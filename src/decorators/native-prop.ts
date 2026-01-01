import { JsonValue } from '../core/bridge/native-bridge';

/**
 * Metadata key for native prop configuration
 */
export const NATIVE_PROP_METADATA = Symbol('nativeProp');

/**
 * Transform function type for native props
 */
export type PropTransformFn<T = unknown, R = unknown> = (value: T) => R;

/**
 * Configuration for native prop decorator
 */
export interface NativePropConfig<T = unknown, R = unknown> {
  /** Native property name (if different from Angular property) */
  nativeName?: string;
  /** Transform function to convert value before sending to native */
  transform?: PropTransformFn<T, R>;
  /** Whether this prop requires immediate native update */
  immediate?: boolean;
  /** Default value if not provided */
  defaultValue?: T;
}

/**
 * Storage for prop metadata on a class
 */
const propMetadataMap = new WeakMap<object, Map<string, NativePropConfig>>();

/**
 * Decorator to mark a property as a native prop
 *
 * This decorator provides metadata about how Angular properties
 * should be mapped to native Android view properties.
 *
 * @example
 * ```typescript
 * export class TextComponent {
 *   @NativeProp({ nativeName: 'android:text' })
 *   @Input()
 *   text: string = '';
 *
 *   @NativeProp({
 *     transform: (color) => colorToAndroid(color),
 *     immediate: true
 *   })
 *   @Input()
 *   textColor: string = '#000000';
 * }
 * ```
 */
export function NativeProp<T = unknown, R = unknown>(config: NativePropConfig<T, R> = {}): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol): void {
    const key = String(propertyKey);

    if (!propMetadataMap.has(target.constructor)) {
      propMetadataMap.set(target.constructor, new Map());
    }

    const propsMap = propMetadataMap.get(target.constructor);
    if (propsMap) {
      propsMap.set(key, {
        nativeName: config.nativeName ?? key,
        transform: config.transform as PropTransformFn<unknown, unknown> | undefined,
        immediate: config.immediate ?? false,
        defaultValue: config.defaultValue,
      });
    }
  };
}

/**
 * Get all native prop configurations for a class
 */
export function getNativeProps(target: object): Map<string, NativePropConfig> {
  return propMetadataMap.get(target.constructor) ?? new Map();
}

/**
 * Get native prop configuration for a specific property
 */
export function getNativePropConfig(
  target: object,
  propertyKey: string
): NativePropConfig | undefined {
  const propsMap = propMetadataMap.get(target.constructor);
  return propsMap?.get(propertyKey);
}

/**
 * Process native props and return transformed values
 */
export function processNativeProps(
  target: object,
  props: Record<string, unknown>
): Record<string, JsonValue> {
  const propsMap = getNativeProps(target);
  const processed: Record<string, JsonValue> = {};

  for (const [key, value] of Object.entries(props)) {
    const config = propsMap.get(key);

    if (config) {
      const nativeKey = config.nativeName ?? key;
      const transformedValue = config.transform ? config.transform(value) : value;
      processed[nativeKey] = (transformedValue ?? config.defaultValue) as JsonValue;
    } else {
      processed[key] = value as JsonValue;
    }
  }

  return processed;
}

/**
 * Transform function type for native events
 */
export type EventTransformFn<T = unknown, R = unknown> = (data: T) => R;

/**
 * Native event decorator configuration
 */
export interface NativeEventConfig<T = unknown, R = unknown> {
  /** Native event name */
  eventName: string;
  /** Transform function for event data */
  transform?: EventTransformFn<T, R>;
}

/**
 * Metadata key for native events
 */
export const NATIVE_EVENT_METADATA = Symbol('nativeEvent');

/**
 * Storage for event metadata
 */
const eventMetadataMap = new WeakMap<object, Map<string, NativeEventConfig>>();

/**
 * Decorator to mark an output as a native event
 *
 * @example
 * ```typescript
 * export class ButtonComponent {
 *   @NativeEvent({ eventName: 'click' })
 *   @Output()
 *   press = new EventEmitter<void>();
 *
 *   @NativeEvent({
 *     eventName: 'longClick',
 *     transform: (e) => ({ duration: e.duration })
 *   })
 *   @Output()
 *   longPress = new EventEmitter<{ duration: number }>();
 * }
 * ```
 */
export function NativeEvent<T = unknown, R = unknown>(config: NativeEventConfig<T, R>): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol): void {
    const key = String(propertyKey);

    if (!eventMetadataMap.has(target.constructor)) {
      eventMetadataMap.set(target.constructor, new Map());
    }

    const eventsMap = eventMetadataMap.get(target.constructor);
    if (eventsMap) {
      eventsMap.set(key, {
        eventName: config.eventName,
        transform: config.transform as EventTransformFn<unknown, unknown> | undefined,
      });
    }
  };
}

/**
 * Get all native event configurations for a class
 */
export function getNativeEvents(target: object): Map<string, NativeEventConfig> {
  return eventMetadataMap.get(target.constructor) ?? new Map();
}

/**
 * Style prop decorator for automatic style processing
 */
export function StyleProp(): PropertyDecorator {
  return NativeProp({
    nativeName: 'style',
    transform: (style: unknown) => {
      // Style transformation is handled by the style service
      return style;
    },
  });
}
