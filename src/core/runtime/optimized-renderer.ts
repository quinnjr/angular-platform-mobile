/**
 * Optimized renderer with performance enhancements
 *
 * Features:
 * - Diff-based updates (only send changed props)
 * - Operation coalescing (merge multiple updates to same view)
 * - Batched operations with priority
 * - Style caching
 */

import { NativeBridge, JsonValue } from '../bridge/native-bridge';
import { MessageQueue } from '../bridge/message-queue';
import { ViewRegistry, ViewNode } from './view-registry';
import { EventDispatcher, NativeEvent, NativeEventData } from './event-dispatcher';
import { cachedTransformStyle } from '../cache/style-cache';
import { NativeStyle } from '../../types/style.types';

/**
 * View props type
 */
export type ViewProps = Record<string, JsonValue>;

/**
 * View types for mobile
 */
export type MobileViewType =
  | 'View'
  | 'Text'
  | 'Image'
  | 'ScrollView'
  | 'TextInput'
  | 'Button'
  | 'TouchableOpacity'
  | 'FlatList'
  | 'Modal'
  | 'ActivityIndicator'
  | 'Switch'
  | 'Slider'
  | 'WebView';

/**
 * Pending update operation
 */
interface PendingUpdate {
  props: ViewProps;
  timestamp: number;
}

/**
 * View event payload
 */
interface ViewEventPayload {
  viewId: string;
  eventType: string;
  payload: NativeEventData;
}

/**
 * Optimized mobile renderer
 */
export class OptimizedRenderer {
  private readonly messageQueue: MessageQueue;
  private readonly pendingUpdates = new Map<string, PendingUpdate>();
  private readonly propsCache = new Map<string, ViewProps>();
  private isUpdateScheduled = false;
  private rootViewId: string | null = null;

  constructor(
    private readonly bridge: NativeBridge,
    private readonly viewRegistry: ViewRegistry,
    private readonly eventDispatcher: EventDispatcher
  ) {
    this.messageQueue = new MessageQueue({ batchSize: 100, flushInterval: 8 });
    this.setupMessageQueue();
    this.setupEventListeners();
  }

  /**
   * Setup the message queue with bridge send callback
   */
  private setupMessageQueue(): void {
    this.messageQueue.setSendCallback(async (messages) => {
      if (messages.length === 1) {
        await this.bridge.send(messages[0]);
      } else {
        await this.bridge.send({
          type: 'batch',
          payload: { messages: messages as unknown as JsonValue },
        });
      }
    });
  }

  /**
   * Setup listeners for native events
   */
  private setupEventListeners(): void {
    this.bridge.on<ViewEventPayload>('viewEvent', (data) => {
      this.eventDispatcher.dispatch(data.viewId, data.eventType, data.payload);
    });
  }

  /**
   * Create a native view
   */
  createView(viewType: MobileViewType, props: ViewProps = {}): string {
    const viewId = this.viewRegistry.generateViewId();
    const processedProps = this.processProps(props);

    const node: ViewNode = {
      id: viewId,
      type: viewType,
      props: processedProps,
      children: [],
      parent: null,
    };

    this.viewRegistry.register(node);
    this.propsCache.set(viewId, { ...processedProps });

    // Use high priority for view creation
    this.messageQueue.enqueueHigh('createView', {
      viewId,
      viewType,
      props: processedProps as unknown as JsonValue,
    });

    return viewId;
  }

  /**
   * Update a view's properties with diff detection
   */
  updateView(viewId: string, props: ViewProps): void {
    const node = this.viewRegistry.get(viewId);
    if (!node) {
      return;
    }

    // Get cached props and compute diff
    const cachedProps = this.propsCache.get(viewId) ?? {};
    const diffProps = this.computePropsDiff(cachedProps, props);

    if (Object.keys(diffProps).length === 0) {
      // No changes, skip update
      return;
    }

    // Coalesce with any pending updates
    const pending = this.pendingUpdates.get(viewId);
    if (pending) {
      // Merge with existing pending update
      Object.assign(pending.props, diffProps);
    } else {
      this.pendingUpdates.set(viewId, {
        props: diffProps,
        timestamp: Date.now(),
      });
    }

    // Schedule update flush
    this.scheduleUpdateFlush();
  }

  /**
   * Compute diff between old and new props
   */
  private computePropsDiff(oldProps: ViewProps, newProps: ViewProps): ViewProps {
    const diff: ViewProps = {};

    for (const [key, value] of Object.entries(newProps)) {
      const oldValue = oldProps[key];

      // Special handling for style objects
      if (key === 'style' && typeof value === 'object' && typeof oldValue === 'object') {
        if (JSON.stringify(value) !== JSON.stringify(oldValue)) {
          diff[key] = value;
        }
      } else if (value !== oldValue) {
        diff[key] = value;
      }
    }

    return diff;
  }

  /**
   * Schedule a flush of pending updates
   */
  private scheduleUpdateFlush(): void {
    if (this.isUpdateScheduled) {
      return;
    }

    this.isUpdateScheduled = true;

    // Use microtask for faster batching
    queueMicrotask(() => {
      this.flushPendingUpdates();
    });
  }

  /**
   * Flush all pending updates
   */
  private flushPendingUpdates(): void {
    this.isUpdateScheduled = false;

    if (this.pendingUpdates.size === 0) {
      return;
    }

    // Process all pending updates
    const updates = Array.from(this.pendingUpdates.entries());
    this.pendingUpdates.clear();

    for (const [viewId, update] of updates) {
      const processedProps = this.processProps(update.props);

      // Update cache
      const cached = this.propsCache.get(viewId) ?? {};
      Object.assign(cached, processedProps);
      this.propsCache.set(viewId, cached);

      // Update registry
      const node = this.viewRegistry.get(viewId);
      if (node) {
        Object.assign(node.props, processedProps);
      }

      // Queue for sending
      this.messageQueue.enqueue('updateView', {
        viewId,
        props: processedProps as unknown as JsonValue,
      });
    }
  }

  /**
   * Set or update view style (with caching)
   */
  setStyle(viewId: string, style: NativeStyle): void {
    const transformedStyle = cachedTransformStyle(style);
    this.updateView(viewId, { style: transformedStyle as unknown as JsonValue });
  }

  /**
   * Remove a view
   */
  removeView(viewId: string): void {
    const node = this.viewRegistry.get(viewId);
    if (!node) {
      return;
    }

    // Cancel any pending updates
    this.pendingUpdates.delete(viewId);
    this.propsCache.delete(viewId);

    // Remove from parent
    if (node.parent) {
      const parentNode = this.viewRegistry.get(node.parent);
      if (parentNode) {
        parentNode.children = parentNode.children.filter((id) => id !== viewId);
      }
    }

    // Remove all children recursively
    for (const childId of [...node.children]) {
      this.removeView(childId);
    }

    // Unregister
    this.viewRegistry.unregister(viewId);
    this.eventDispatcher.unregisterView(viewId);

    // Queue removal
    this.messageQueue.enqueue('removeView', { viewId });
  }

  /**
   * Append a child view to a parent
   */
  appendChild(parentId: string, childId: string): void {
    const parentNode = this.viewRegistry.get(parentId);
    const childNode = this.viewRegistry.get(childId);

    if (!parentNode || !childNode) {
      return;
    }

    childNode.parent = parentId;
    if (!parentNode.children.includes(childId)) {
      parentNode.children.push(childId);
    }

    this.messageQueue.enqueue('appendChild', { parentId, childId });
  }

  /**
   * Insert a child at a specific index
   */
  insertChild(parentId: string, childId: string, index: number): void {
    const parentNode = this.viewRegistry.get(parentId);
    const childNode = this.viewRegistry.get(childId);

    if (!parentNode || !childNode) {
      return;
    }

    childNode.parent = parentId;
    parentNode.children.splice(index, 0, childId);

    this.messageQueue.enqueue('insertChild', { parentId, childId, index });
  }

  /**
   * Remove a child from its parent
   */
  removeChild(parentId: string, childId: string): void {
    const parentNode = this.viewRegistry.get(parentId);

    if (parentNode) {
      parentNode.children = parentNode.children.filter((id) => id !== childId);
    }

    const childNode = this.viewRegistry.get(childId);
    if (childNode) {
      childNode.parent = null;
    }

    this.messageQueue.enqueue('removeChild', { parentId, childId });
  }

  /**
   * Set the root view
   */
  setRootView(viewId: string): void {
    this.rootViewId = viewId;
    this.messageQueue.enqueueHigh('setRootView', { viewId });
  }

  /**
   * Get the root view ID
   */
  getRootViewId(): string | null {
    return this.rootViewId;
  }

  /**
   * Register an event listener
   */
  registerEventListener<T = NativeEventData>(
    viewId: string,
    eventType: string,
    handler: (event: NativeEvent<T>) => void
  ): () => void {
    return this.eventDispatcher.register(viewId, eventType, handler);
  }

  /**
   * Force flush all pending operations
   */
  async flush(): Promise<void> {
    this.flushPendingUpdates();
    await this.messageQueue.flushImmediate();
  }

  /**
   * Process props before sending
   */
  private processProps(props: ViewProps): ViewProps {
    const processed: ViewProps = {};

    for (const [key, value] of Object.entries(props)) {
      if (key === 'style' && typeof value === 'object' && value !== null) {
        processed[key] = cachedTransformStyle(value as NativeStyle) as unknown as JsonValue;
      } else if (typeof value !== 'function') {
        processed[key] = value;
      }
    }

    return processed;
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    pendingUpdates: number;
    pendingMessages: number;
    cachedViews: number;
  } {
    return {
      pendingUpdates: this.pendingUpdates.size,
      pendingMessages: this.messageQueue.pendingCount,
      cachedViews: this.propsCache.size,
    };
  }
}
