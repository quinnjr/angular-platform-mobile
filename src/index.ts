/**
 * @pegasusheavy/angular-platform-mobile
 * React Native-like system for Angular targeting iOS and Android
 *
 * Copyright (c) 2026 Pegasus Heavy Industries LLC
 * Licensed under the MIT License
 */

// ============================================================================
// Core Platform
// ============================================================================

export {
  Platform,
  BasePlatform,
  PLATFORM,
  PLATFORM_TYPE,
} from './core/platform/platform';

export type {
  PlatformType,
  PlatformOS,
  PlatformDimensions,
  ColorScheme,
  SafeAreaInsets,
  PlatformConstants,
  IPlatform,
} from './core/platform/platform';

export {
  PlatformMobileModule,
  PlatformAndroidModule, // Backward compatibility
  MOBILE_PLATFORM_CONFIG,
  createMobilePlatformProviders,
} from './core/platform/platform-mobile.module';

export type { MobilePlatformConfig } from './core/platform/platform-mobile.module';

// Legacy exports (deprecated)
export * from './core/platform/platform-android';
export * from './core/platform/bootstrap';

// ============================================================================
// Platform-specific implementations
// ============================================================================

// Android
export {
  AndroidPlatform,
  AndroidViewClassMap,
  AndroidEventMap,
  AndroidStyleMap,
} from './platforms/android/android-platform';

// iOS
export {
  IOSPlatform,
  IOSViewClassMap,
  IOSEventMap,
  IOSStyleMap,
  IOSSystemColors,
} from './platforms/ios/ios-platform';

export type {
  IOSInterfaceIdiom,
  IOSHapticType,
  IOSAnimationCurve,
} from './platforms/ios/ios-platform';

// ============================================================================
// Bridge
// ============================================================================

export {
  NativeBridge,
  BridgeConnectionState,
} from './core/bridge/native-bridge';

export type {
  BridgeMessage,
  BridgeResponse,
  BridgeConfig,
  BridgeTransport,
} from './core/bridge/native-bridge';

export * from './core/bridge/bridge.service';
export * from './core/bridge/message-queue';

// ============================================================================
// Performance / Caching
// ============================================================================

export {
  StyleCache,
  cachedTransformStyle,
  cachedMergeStyles,
} from './core/cache/style-cache';

export {
  FastEasing,
  benchmarkEasing,
} from './core/animation/easing-lut';

// ============================================================================
// Runtime
// ============================================================================

export { AndroidRenderer, AndroidViewType } from './core/runtime/renderer';
export type { ViewProps as RendererViewProps, ViewMeasurement as RendererViewMeasurement } from './core/runtime/renderer';

export { OptimizedRenderer, MobileViewType } from './core/runtime/optimized-renderer';
export type { ViewProps as OptimizedViewProps } from './core/runtime/optimized-renderer';
export * from './core/runtime/view-registry';

export {
  EventDispatcher,
  NativeEventTypes,
} from './core/runtime/event-dispatcher';

export type {
  EventHandler,
  NativeEvent as DispatcherNativeEvent,
} from './core/runtime/event-dispatcher';

// ============================================================================
// Animation
// ============================================================================

export * from './core/animation/animated';
export * from './core/animation/easing-lut';

// ============================================================================
// Benchmarking (development only)
// ============================================================================

export {
  benchmark,
  benchmarkAsync,
  runBenchmarkSuite,
  formatResult,
  compareResults,
  measureMemory,
} from './core/benchmark/benchmark';

export type { BenchmarkResult, BenchmarkOptions } from './core/benchmark/benchmark';

// ============================================================================
// Components
// ============================================================================

export * from './components/view/view.component';
export * from './components/text/text.component';
export * from './components/scroll-view/scroll-view.component';
export * from './components/image/image.component';
export * from './components/button/button.component';
export * from './components/text-input/text-input.component';
export * from './components/touchable/touchable.component';
export * from './components/flat-list/flat-list.component';
export * from './components/modal/modal.component';
export * from './components/activity-indicator/activity-indicator.component';
export * from './components/switch/switch.component';
export * from './components/slider/slider.component';
export * from './components/webview/webview.component';
export * from './components/safe-area-view/safe-area-view.component';
export * from './components/status-bar/status-bar.component';

// Component Module
export * from './components/components.module';

// ============================================================================
// Services
// ============================================================================

export * from './services/style.service';
export * from './services/navigation.service';
export * from './services/device.service';
export * from './services/storage.service';
export * from './services/permissions.service';
export * from './services/alert.service';
export * from './services/linking.service';
export * from './services/clipboard.service';
export * from './services/share.service';
export * from './services/toast.service';

// ============================================================================
// Decorators
// ============================================================================

export {
  NativeComponent,
  getNativeComponentConfig,
  isNativeComponent,
  NATIVE_COMPONENT_METADATA,
  NativeModuleConfig,
  NativeModule,
  getNativeModuleConfig,
  isNativeModule,
  NATIVE_MODULE_METADATA,
} from './decorators/native-component';

export type { NativeComponentConfig } from './decorators/native-component';

export {
  NativeProp,
  getNativeProps,
  NATIVE_PROP_METADATA,
  NativeEvent as NativeEventDecorator,
  getNativeEvents,
  NATIVE_EVENT_METADATA,
} from './decorators/native-prop';

export type { NativePropConfig, NativeEventConfig } from './decorators/native-prop';

// ============================================================================
// Types
// ============================================================================

export * from './types/style.types';
export * from './types/event.types';

export {
  // Platform info
  MobilePlatformInfo,
  AndroidPlatformInfo,
  IOSPlatformInfo,
  DimensionSet,
  Dimensions,
  EdgeInsets,
  KeyboardInfo,
  NetworkInfo,
  NativeModule as NativeModuleInterface,

  // Image
  ImageSource,

  // Accessibility
  AccessibilityRole,
  AccessibilityState,
  AccessibilityProps,
  PointerEvents,
  HitSlop,
  NativeViewProps,

  // Animation
  AnimationConfig,
  SpringConfig,
  TimingConfig,
  AnimatedValueOperations,

  // Linking & Share
  LinkingURL,
  ShareContent,
  ShareOptions,

  // Alerts & Actions
  AlertButton,
  AlertOptions,
  ActionSheetButton,
  ActionSheetOptions,

  // Toast
  ToastDuration,
  ToastGravity,

  // System
  VibrationPattern,
  StatusBarStyle,
  StatusBarAnimation,
  HapticFeedbackType,
  AppStateStatus,
  DeviceOrientation,
  InterfaceOrientation,
  BiometricType,

  // Permissions
  PermissionStatus,
  AndroidPermission,
  IOSPermission,
  Permission,

  // Date/Time picker
  DateTimePickerMode,
  DateTimePickerDisplay,
} from './types/native.types';
