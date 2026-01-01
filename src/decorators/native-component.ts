import { Type } from '@angular/core';

/**
 * Metadata key for native component configuration
 */
export const NATIVE_COMPONENT_METADATA = Symbol('nativeComponent');

/**
 * Configuration for native component decorator
 */
export interface NativeComponentConfig {
  /** Android native view class name */
  nativeViewClass: string;
  /** Custom props mapping */
  propMapping?: Record<string, string>;
  /** Events that this component can emit */
  events?: string[];
  /** Whether this component can have children */
  hasChildren?: boolean;
}

/**
 * Extended class interface with native metadata
 */
interface NativeComponentClass extends Function {
  __nativeConfig?: NativeComponentConfig;
  [NATIVE_COMPONENT_METADATA]?: NativeComponentConfig;
}

/**
 * Extended type interface with native metadata
 */
interface NativeComponentType<T = unknown> extends Type<T> {
  __nativeConfig?: NativeComponentConfig;
  [NATIVE_COMPONENT_METADATA]?: NativeComponentConfig;
}

/**
 * Decorator to mark a component as a native Android component
 *
 * @example
 * ```typescript
 * @NativeComponent({
 *   nativeViewClass: 'android.widget.TextView',
 *   propMapping: {
 *     text: 'android:text',
 *     textColor: 'android:textColor'
 *   },
 *   events: ['press', 'longPress']
 * })
 * @Component({ ... })
 * export class TextComponent { }
 * ```
 */
export function NativeComponent(config: NativeComponentConfig): ClassDecorator {
  return function <T extends Function>(target: T): T {
    const nativeTarget = target as NativeComponentClass;
    // Store metadata on the class as static property for runtime access
    nativeTarget.__nativeConfig = config;
    nativeTarget[NATIVE_COMPONENT_METADATA] = config;

    return target;
  };
}

/**
 * Get native component configuration from a class
 */
export function getNativeComponentConfig<T = unknown>(target: Type<T>): NativeComponentConfig | undefined {
  const nativeTarget = target as NativeComponentType<T>;
  return nativeTarget.__nativeConfig ?? nativeTarget[NATIVE_COMPONENT_METADATA];
}

/**
 * Check if a class is a native component
 */
export function isNativeComponent<T = unknown>(target: Type<T>): boolean {
  return getNativeComponentConfig(target) !== undefined;
}

/**
 * Native module decorator configuration
 */
export interface NativeModuleConfig {
  /** Module name as registered in native code */
  moduleName: string;
  /** Methods exposed by this module */
  methods?: string[];
}

/**
 * Metadata key for native module configuration
 */
export const NATIVE_MODULE_METADATA = Symbol('nativeModule');

/**
 * Extended class interface with native module metadata
 */
interface NativeModuleClass extends Function {
  __nativeModuleConfig?: NativeModuleConfig;
  [NATIVE_MODULE_METADATA]?: NativeModuleConfig;
}

/**
 * Extended type interface with native module metadata
 */
interface NativeModuleType<T = unknown> extends Type<T> {
  __nativeModuleConfig?: NativeModuleConfig;
  [NATIVE_MODULE_METADATA]?: NativeModuleConfig;
}

/**
 * Decorator to mark a service as a native module wrapper
 *
 * @example
 * ```typescript
 * @NativeModule({
 *   moduleName: 'CameraModule',
 *   methods: ['takePicture', 'recordVideo', 'switchCamera']
 * })
 * @Injectable()
 * export class CameraService { }
 * ```
 */
export function NativeModule(config: NativeModuleConfig): ClassDecorator {
  return function <T extends Function>(target: T): T {
    const nativeTarget = target as NativeModuleClass;
    nativeTarget.__nativeModuleConfig = config;
    nativeTarget[NATIVE_MODULE_METADATA] = config;
    return target;
  };
}

/**
 * Get native module configuration from a class
 */
export function getNativeModuleConfig<T = unknown>(target: Type<T>): NativeModuleConfig | undefined {
  const nativeTarget = target as NativeModuleType<T>;
  return nativeTarget.__nativeModuleConfig ?? nativeTarget[NATIVE_MODULE_METADATA];
}

/**
 * Check if a class is a native module
 */
export function isNativeModule<T = unknown>(target: Type<T>): boolean {
  return getNativeModuleConfig(target) !== undefined;
}
