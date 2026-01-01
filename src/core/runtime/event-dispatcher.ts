import { JsonValue } from '../bridge/native-bridge';

/**
 * Native event data (generic JSON-compatible structure)
 */
export type NativeEventData = JsonValue;

/**
 * Native event structure from Android/iOS
 */
export interface NativeEvent<T = NativeEventData> {
  type: string;
  target: string;
  timestamp: number;
  data: T;
  nativeEvent?: T;
}

/**
 * Event handler function type
 */
export type EventHandler<T = NativeEventData> = (event: NativeEvent<T>) => void;

/**
 * Touch event data
 */
export interface TouchEventData {
  locationX: number;
  locationY: number;
  pageX: number;
  pageY: number;
  touches: Array<{
    identifier: number;
    locationX: number;
    locationY: number;
    pageX: number;
    pageY: number;
  }>;
}

/**
 * Text change event data
 */
export interface TextChangeEventData {
  text: string;
  previousText: string;
}

/**
 * Scroll event data
 */
export interface ScrollEventData {
  contentOffset: { x: number; y: number };
  contentSize: { width: number; height: number };
  layoutMeasurement: { width: number; height: number };
}

/**
 * Event Dispatcher for handling native view events
 *
 * Manages event subscriptions and dispatches events from
 * the native side to Angular component handlers.
 */
export class EventDispatcher {
  private readonly handlers = new Map<string, Map<string, Set<EventHandler>>>();
  private readonly globalHandlers = new Map<string, Set<EventHandler>>();

  /**
   * Register an event handler for a specific view and event type
   */
  register<T = NativeEventData>(viewId: string, eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(viewId)) {
      this.handlers.set(viewId, new Map());
    }

    const viewHandlers = this.handlers.get(viewId);
    if (viewHandlers) {
      if (!viewHandlers.has(eventType)) {
        viewHandlers.set(eventType, new Set());
      }

      const eventHandlers = viewHandlers.get(eventType);
      if (eventHandlers) {
        eventHandlers.add(handler as EventHandler);
      }
    }

    // Return unsubscribe function
    return () => {
      const viewHandlers = this.handlers.get(viewId);
      viewHandlers?.get(eventType)?.delete(handler as EventHandler);
    };
  }

  /**
   * Register a global event handler (for all views)
   */
  registerGlobal<T = NativeEventData>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.globalHandlers.has(eventType)) {
      this.globalHandlers.set(eventType, new Set());
    }

    const eventHandlers = this.globalHandlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.add(handler as EventHandler);
    }

    return () => {
      this.globalHandlers.get(eventType)?.delete(handler as EventHandler);
    };
  }

  /**
   * Dispatch an event to registered handlers
   */
  dispatch<T = NativeEventData>(viewId: string, eventType: string, data: T): void {
    const event: NativeEvent<T> = {
      type: eventType,
      target: viewId,
      timestamp: Date.now(),
      data,
    };

    // Dispatch to view-specific handlers
    const viewHandlers = this.handlers.get(viewId);
    if (viewHandlers) {
      const eventHandlers = viewHandlers.get(eventType);
      if (eventHandlers) {
        eventHandlers.forEach((handler) => {
          try {
            handler(event as NativeEvent);
          } catch (error) {
            console.error(`[EventDispatcher] Handler error for ${eventType}:`, error);
          }
        });
      }
    }

    // Dispatch to global handlers
    const globalEventHandlers = this.globalHandlers.get(eventType);
    if (globalEventHandlers) {
      globalEventHandlers.forEach((handler) => {
        try {
          handler(event as NativeEvent);
        } catch (error) {
          console.error(`[EventDispatcher] Global handler error for ${eventType}:`, error);
        }
      });
    }

    // Bubble the event up to parent views
    this.bubbleEvent(viewId, event as NativeEvent);
  }

  /**
   * Bubble an event up the view hierarchy
   */
  private bubbleEvent(_viewId: string, _event: NativeEvent): void {
    // Event bubbling would be implemented with view registry integration
    // For now, we'll handle it in the component layer
  }

  /**
   * Unregister all handlers for a view
   */
  unregisterView(viewId: string): void {
    this.handlers.delete(viewId);
  }

  /**
   * Unregister all handlers for an event type
   */
  unregisterEventType(eventType: string): void {
    for (const viewHandlers of this.handlers.values()) {
      viewHandlers.delete(eventType);
    }
    this.globalHandlers.delete(eventType);
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.globalHandlers.clear();
  }

  /**
   * Get count of registered handlers
   */
  getHandlerCount(viewId?: string): number {
    if (viewId) {
      const viewHandlers = this.handlers.get(viewId);
      if (!viewHandlers) return 0;

      let count = 0;
      for (const handlers of viewHandlers.values()) {
        count += handlers.size;
      }
      return count;
    }

    let total = 0;
    for (const viewHandlers of this.handlers.values()) {
      for (const handlers of viewHandlers.values()) {
        total += handlers.size;
      }
    }
    return total;
  }
}

/**
 * Common event types for native views
 */
export const NativeEventTypes = {
  // Touch events
  PRESS: 'press',
  PRESS_IN: 'pressIn',
  PRESS_OUT: 'pressOut',
  LONG_PRESS: 'longPress',

  // Focus events
  FOCUS: 'focus',
  BLUR: 'blur',

  // Text events
  CHANGE_TEXT: 'changeText',
  SUBMIT_EDITING: 'submitEditing',
  END_EDITING: 'endEditing',

  // Scroll events
  SCROLL: 'scroll',
  SCROLL_BEGIN_DRAG: 'scrollBeginDrag',
  SCROLL_END_DRAG: 'scrollEndDrag',
  MOMENTUM_SCROLL_BEGIN: 'momentumScrollBegin',
  MOMENTUM_SCROLL_END: 'momentumScrollEnd',

  // Layout events
  LAYOUT: 'layout',

  // Image events
  LOAD_START: 'loadStart',
  LOAD: 'load',
  LOAD_END: 'loadEnd',
  ERROR: 'error',

  // Other events
  VALUE_CHANGE: 'valueChange',
  REFRESH: 'refresh',
} as const;
