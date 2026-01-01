import { NativeBridge, JsonValue } from '../bridge/native-bridge';
import { ViewRegistry, ViewNode } from './view-registry';
import { EventDispatcher, NativeEvent, NativeEventData } from './event-dispatcher';
import { NativeStyle, transformStyle } from '../../types/style.types';

/**
 * View props type (JSON-compatible)
 */
export type ViewProps = Record<string, unknown>;

/**
 * View event payload
 */
interface ViewEventPayload {
  viewId: string;
  eventType: string;
  payload: NativeEventData;
}

/**
 * View measurement result
 */
export interface ViewMeasurement {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Android-specific view types
 */
export type AndroidViewType =
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
 * Renderer for Angular components to Android native views
 *
 * This class handles the translation of Angular component updates
 * to native Android view operations.
 */
export class AndroidRenderer {
  private rootViewId: string | null = null;
  private readonly pendingOperations: RendererOperation[] = [];
  private isFlushScheduled = false;

  constructor(
    private readonly bridge: NativeBridge,
    private readonly viewRegistry: ViewRegistry,
    private readonly eventDispatcher: EventDispatcher
  ) {
    this.setupEventListeners();
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
  async createView(
    viewType: AndroidViewType,
    props: ViewProps = {}
  ): Promise<string> {
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

    await this.bridge.send({
      type: 'createView',
      payload: {
        viewId,
        viewType: this.mapToAndroidViewType(viewType),
        props: processedProps,
      },
    });

    return viewId;
  }

  /**
   * Update a view's properties
   */
  async updateView(viewId: string, props: ViewProps): Promise<void> {
    const node = this.viewRegistry.get(viewId);
    if (!node) {
      console.warn(`[AndroidRenderer] View not found: ${viewId}`);
      return;
    }

    const processedProps = this.processProps(props);
    node.props = { ...node.props, ...processedProps };

    this.queueOperation({
      type: 'update',
      viewId,
      props: processedProps,
    });
  }

  /**
   * Set or update view style
   */
  async setStyle(viewId: string, style: NativeStyle): Promise<void> {
    const transformedStyle = transformStyle(style);
    await this.updateView(viewId, { style: transformedStyle as unknown as JsonValue });
  }

  /**
   * Remove a view
   */
  async removeView(viewId: string): Promise<void> {
    const node = this.viewRegistry.get(viewId);
    if (!node) {
      return;
    }

    // Remove from parent
    if (node.parent) {
      const parentNode = this.viewRegistry.get(node.parent);
      if (parentNode) {
        parentNode.children = parentNode.children.filter((id) => id !== viewId);
      }
    }

    // Remove all children recursively
    for (const childId of node.children) {
      await this.removeView(childId);
    }

    // Unregister from registry
    this.viewRegistry.unregister(viewId);

    // Unregister event listeners
    this.eventDispatcher.unregisterView(viewId);

    this.queueOperation({
      type: 'remove',
      viewId,
    });
  }

  /**
   * Append a child view to a parent
   */
  async appendChild(parentId: string, childId: string): Promise<void> {
    const parentNode = this.viewRegistry.get(parentId);
    const childNode = this.viewRegistry.get(childId);

    if (!parentNode || !childNode) {
      console.warn(`[AndroidRenderer] Parent or child not found`);
      return;
    }

    // Update view hierarchy
    childNode.parent = parentId;
    parentNode.children.push(childId);

    this.queueOperation({
      type: 'appendChild',
      parentId,
      childId,
    });
  }

  /**
   * Insert a child at a specific index
   */
  async insertChild(parentId: string, childId: string, index: number): Promise<void> {
    const parentNode = this.viewRegistry.get(parentId);
    const childNode = this.viewRegistry.get(childId);

    if (!parentNode || !childNode) {
      return;
    }

    childNode.parent = parentId;
    parentNode.children.splice(index, 0, childId);

    this.queueOperation({
      type: 'insertChild',
      parentId,
      childId,
      index,
    });
  }

  /**
   * Remove a child from its parent
   */
  async removeChild(parentId: string, childId: string): Promise<void> {
    const parentNode = this.viewRegistry.get(parentId);

    if (parentNode) {
      parentNode.children = parentNode.children.filter((id) => id !== childId);
    }

    const childNode = this.viewRegistry.get(childId);
    if (childNode) {
      childNode.parent = null;
    }

    this.queueOperation({
      type: 'removeChild',
      parentId,
      childId,
    });
  }

  /**
   * Set the root view for the application
   */
  async setRootView(viewId: string): Promise<void> {
    this.rootViewId = viewId;

    await this.bridge.send({
      type: 'setRootView',
      payload: { viewId },
    });
  }

  /**
   * Get the root view ID
   */
  getRootViewId(): string | null {
    return this.rootViewId;
  }

  /**
   * Register an event listener for a view
   */
  registerEventListener<T = NativeEventData>(
    viewId: string,
    eventType: string,
    handler: (event: NativeEvent<T>) => void
  ): () => void {
    return this.eventDispatcher.register(viewId, eventType, handler);
  }

  /**
   * Measure a view's dimensions
   */
  async measureView(viewId: string): Promise<ViewMeasurement> {
    return this.bridge.request<ViewMeasurement>('measureView', { viewId });
  }

  /**
   * Focus a view (for inputs)
   */
  async focus(viewId: string): Promise<void> {
    await this.bridge.send({
      type: 'focus',
      payload: { viewId },
    });
  }

  /**
   * Blur a view (for inputs)
   */
  async blur(viewId: string): Promise<void> {
    await this.bridge.send({
      type: 'blur',
      payload: { viewId },
    });
  }

  /**
   * Queue a renderer operation for batching
   */
  private queueOperation(operation: RendererOperation): void {
    this.pendingOperations.push(operation);
    this.scheduleFlush();
  }

  /**
   * Schedule a flush of pending operations
   */
  private scheduleFlush(): void {
    if (this.isFlushScheduled) {
      return;
    }

    this.isFlushScheduled = true;

    // Use requestAnimationFrame-like timing
    setTimeout(() => {
      void this.flush();
    }, 0);
  }

  /**
   * Flush all pending operations
   */
  private async flush(): Promise<void> {
    this.isFlushScheduled = false;

    if (this.pendingOperations.length === 0) {
      return;
    }

    const operations = this.pendingOperations.splice(0);

    await this.bridge.send({
      type: 'batchOperations',
      payload: { operations: operations as unknown as JsonValue },
    });
  }

  /**
   * Process props before sending to native
   */
  private processProps(props: ViewProps): ViewProps {
    const processed: ViewProps = {};

    for (const [key, value] of Object.entries(props)) {
      if (key === 'style' && typeof value === 'object' && value !== null) {
        processed[key] = transformStyle(value as NativeStyle) as unknown as JsonValue;
      } else if (typeof value === 'function') {
        // Functions are event handlers, skip them
        continue;
      } else {
        processed[key] = value;
      }
    }

    return processed;
  }

  /**
   * Map view type to Android native class
   */
  private mapToAndroidViewType(viewType: AndroidViewType): string {
    const mapping: Record<AndroidViewType, string> = {
      View: 'android.view.ViewGroup',
      Text: 'android.widget.TextView',
      Image: 'android.widget.ImageView',
      ScrollView: 'android.widget.ScrollView',
      TextInput: 'android.widget.EditText',
      Button: 'android.widget.Button',
      TouchableOpacity: 'android.view.ViewGroup',
      FlatList: 'androidx.recyclerview.widget.RecyclerView',
      Modal: 'android.app.Dialog',
      ActivityIndicator: 'android.widget.ProgressBar',
      Switch: 'android.widget.Switch',
      Slider: 'android.widget.SeekBar',
      WebView: 'android.webkit.WebView',
    };

    return mapping[viewType];
  }
}

/**
 * Renderer operation for batching
 */
interface RendererOperation {
  type: 'create' | 'update' | 'remove' | 'appendChild' | 'insertChild' | 'removeChild';
  viewId?: string;
  parentId?: string;
  childId?: string;
  index?: number;
  props?: ViewProps;
}
