/**
 * Event types for native Android components
 */

/**
 * Base event interface for all native events
 */
export interface BaseNativeEvent<T = unknown> {
  nativeEvent: T;
  target: string;
  currentTarget: string;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  timeStamp: number;
  type: string;
  preventDefault(): void;
  stopPropagation(): void;
}

/**
 * Touch point interface
 */
export interface TouchPoint {
  identifier: number;
  locationX: number;
  locationY: number;
  pageX: number;
  pageY: number;
  timestamp: number;
}

/**
 * Touch event data
 */
export interface TouchEventNativeData {
  changedTouches: TouchPoint[];
  touches: TouchPoint[];
  locationX: number;
  locationY: number;
  pageX: number;
  pageY: number;
  timestamp: number;
}

/**
 * Press event (tap)
 */
export type PressEvent = BaseNativeEvent<TouchEventNativeData>;

/**
 * Long press event
 */
export type LongPressEvent = BaseNativeEvent<TouchEventNativeData>;

/**
 * Layout change event data
 */
export interface LayoutEventNativeData {
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Layout event
 */
export type LayoutEvent = BaseNativeEvent<LayoutEventNativeData>;

/**
 * Text input change event data
 */
export interface TextInputChangeEventNativeData {
  text: string;
  eventCount: number;
}

/**
 * Text change event
 */
export type TextChangeEvent = BaseNativeEvent<TextInputChangeEventNativeData>;

/**
 * Text input submit event data
 */
export interface TextInputSubmitEventNativeData {
  text: string;
}

/**
 * Submit editing event
 */
export type SubmitEditingEvent = BaseNativeEvent<TextInputSubmitEventNativeData>;

/**
 * Focus event data
 */
export interface FocusEventNativeData {
  target: string;
  relatedTarget?: string;
}

/**
 * Focus event
 */
export type FocusEvent = BaseNativeEvent<FocusEventNativeData>;

/**
 * Blur event
 */
export type BlurEvent = BaseNativeEvent<FocusEventNativeData>;

/**
 * Scroll event data
 */
export interface ScrollEventNativeData {
  contentOffset: {
    x: number;
    y: number;
  };
  contentSize: {
    width: number;
    height: number;
  };
  layoutMeasurement: {
    width: number;
    height: number;
  };
  contentInset: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  zoomScale: number;
  velocity?: {
    x: number;
    y: number;
  };
}

/**
 * Scroll event
 */
export type ScrollEvent = BaseNativeEvent<ScrollEventNativeData>;

/**
 * Image load event data
 */
export interface ImageLoadEventNativeData {
  source: {
    uri: string;
    width: number;
    height: number;
  };
}

/**
 * Image load event
 */
export type ImageLoadEvent = BaseNativeEvent<ImageLoadEventNativeData>;

/**
 * Image error event data
 */
export interface ImageErrorEventNativeData {
  error: string;
}

/**
 * Image error event
 */
export type ImageErrorEvent = BaseNativeEvent<ImageErrorEventNativeData>;

/**
 * Image progress event data
 */
export interface ImageProgressEventNativeData {
  loaded: number;
  total: number;
}

/**
 * Image progress event
 */
export type ImageProgressEvent = BaseNativeEvent<ImageProgressEventNativeData>;

/**
 * Switch value change event data
 */
export interface SwitchChangeEventNativeData {
  value: boolean;
}

/**
 * Switch change event
 */
export type SwitchChangeEvent = BaseNativeEvent<SwitchChangeEventNativeData>;

/**
 * Slider value change event data
 */
export interface SliderChangeEventNativeData {
  value: number;
}

/**
 * Slider change event
 */
export type SliderChangeEvent = BaseNativeEvent<SliderChangeEventNativeData>;

/**
 * Modal request close event data
 */
export interface ModalRequestCloseEventNativeData {
  animated: boolean;
}

/**
 * Modal request close event
 */
export type ModalRequestCloseEvent = BaseNativeEvent<ModalRequestCloseEventNativeData>;

/**
 * Refresh control refresh event
 */
export interface RefreshEventNativeData {
  refreshing: boolean;
}

/**
 * Refresh event
 */
export type RefreshEvent = BaseNativeEvent<RefreshEventNativeData>;

/**
 * Gesture state
 */
export enum GestureState {
  Undetermined = 0,
  Failed = 1,
  Began = 2,
  Cancelled = 3,
  Active = 4,
  End = 5,
}

/**
 * Pan gesture event data
 */
export interface PanGestureEventNativeData {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
  state: GestureState;
}

/**
 * Pan gesture event
 */
export type PanGestureEvent = BaseNativeEvent<PanGestureEventNativeData>;

/**
 * Pinch gesture event data
 */
export interface PinchGestureEventNativeData {
  scale: number;
  focalX: number;
  focalY: number;
  velocity: number;
  state: GestureState;
}

/**
 * Pinch gesture event
 */
export type PinchGestureEvent = BaseNativeEvent<PinchGestureEventNativeData>;

/**
 * Rotation gesture event data
 */
export interface RotationGestureEventNativeData {
  rotation: number;
  anchorX: number;
  anchorY: number;
  velocity: number;
  state: GestureState;
}

/**
 * Rotation gesture event
 */
export type RotationGestureEvent = BaseNativeEvent<RotationGestureEventNativeData>;

/**
 * Create a synthetic native event
 */
export function createNativeEvent<T>(type: string, nativeData: T): BaseNativeEvent<T> {
  const event: BaseNativeEvent<T> = {
    nativeEvent: nativeData,
    target: '',
    currentTarget: '',
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    timeStamp: Date.now(),
    type,
    preventDefault() {
      event.defaultPrevented = true;
    },
    stopPropagation() {
      event.bubbles = false;
    },
  };

  return event;
}
