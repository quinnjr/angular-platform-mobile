/**
 * Native Types
 *
 * Type definitions for native mobile platform interactions.
 * Supports both iOS and Android platforms.
 */

import { PlatformType } from '../core/platform/platform';

/**
 * Platform-specific information
 */
export interface MobilePlatformInfo {
  platform: PlatformType;
  version: string;
  versionNumber: number;
  isTablet: boolean;
  isTV: boolean;
  model: string;
  // Android-specific
  brand?: string;
  manufacturer?: string;
  apiLevel?: number;
  // iOS-specific
  deviceName?: string;
  systemName?: string;
  interfaceIdiom?: 'phone' | 'pad' | 'tv' | 'carPlay' | 'mac';
  isSimulator?: boolean;
}

/**
 * Android platform info (legacy export)
 * @deprecated Use MobilePlatformInfo instead
 */
export interface AndroidPlatformInfo {
  apiLevel: number;
  versionName: string;
  versionCode: number;
  model: string;
  manufacturer: string;
  brand: string;
  isEmulator: boolean;
  isTablet: boolean;
  screenDensity: number;
  screenWidth: number;
  screenHeight: number;
}

/**
 * iOS platform info
 */
export interface IOSPlatformInfo {
  systemVersion: string;
  systemName: string;
  model: string;
  deviceName: string;
  interfaceIdiom: 'phone' | 'pad' | 'tv' | 'carPlay' | 'mac';
  isSimulator: boolean;
  screenScale: number;
  screenWidth: number;
  screenHeight: number;
}

/**
 * Single dimension set
 */
export interface DimensionSet {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

/**
 * Dimensions type (window and screen)
 */
export interface Dimensions {
  window: DimensionSet;
  screen: DimensionSet;
}

/**
 * Edge insets (safe area)
 */
export interface EdgeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Keyboard information
 */
export interface KeyboardInfo {
  height: number;
  duration: number;
  easing: string;
  isVisible: boolean;
  // iOS-specific
  startCoordinates?: {
    screenX: number;
    screenY: number;
    width: number;
    height: number;
  };
  endCoordinates?: {
    screenX: number;
    screenY: number;
    width: number;
    height: number;
  };
}

/**
 * Network information
 */
export interface NetworkInfo {
  type: 'wifi' | 'cellular' | 'bluetooth' | 'ethernet' | 'vpn' | 'none' | 'unknown';
  isConnected: boolean;
  isInternetReachable: boolean;
  details?: {
    isConnectionExpensive?: boolean;
    cellularGeneration?: '2g' | '3g' | '4g' | '5g';
    carrier?: string;
    ssid?: string;
  };
}

/**
 * Native module interface
 */
export interface NativeModule {
  name: string;
  methods: string[];
  constants?: Record<string, unknown>;
  events?: string[];
}

/**
 * Image source type
 */
export type ImageSource =
  | { uri: string; headers?: Record<string, string>; cache?: 'default' | 'reload' | 'force-cache' | 'only-if-cached' }
  | { base64: string }
  | number; // Local asset reference

/**
 * Accessibility role type
 */
export type AccessibilityRole =
  | 'none'
  | 'button'
  | 'link'
  | 'search'
  | 'image'
  | 'keyboardkey'
  | 'text'
  | 'adjustable'
  | 'imagebutton'
  | 'header'
  | 'summary'
  | 'alert'
  | 'checkbox'
  | 'combobox'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'scrollbar'
  | 'spinbutton'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'timer'
  | 'toolbar'
  | 'list'
  | 'grid'
  // iOS-specific roles
  | 'togglebutton'
  | 'drawerlayout'
  | 'dropdownlist'
  | 'pager'
  | 'viewgroup';

/**
 * Accessibility state
 */
export interface AccessibilityState {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
}

/**
 * Accessibility props
 */
export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityActions?: Array<{
    name: string;
    label?: string;
  }>;
  onAccessibilityAction?: (event: { actionName: string }) => void;
  // iOS-specific
  accessibilityElementsHidden?: boolean;
  accessibilityViewIsModal?: boolean;
  onAccessibilityEscape?: () => boolean;
  onAccessibilityTap?: () => void;
  onMagicTap?: () => void;
  // Android-specific
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

/**
 * Pointer events type
 */
export type PointerEvents = 'auto' | 'none' | 'box-none' | 'box-only';

/**
 * Hit slop type
 */
export interface HitSlop {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

/**
 * Native view props base
 */
export interface NativeViewProps extends AccessibilityProps {
  style?: Record<string, string | number | boolean | null | undefined>;
  pointerEvents?: PointerEvents;
  hitSlop?: HitSlop | number;
  testID?: string;
  nativeID?: string;
  collapsable?: boolean; // Android
  needsOffscreenAlphaCompositing?: boolean; // Android
  renderToHardwareTextureAndroid?: boolean; // Android
  shouldRasterizeIOS?: boolean; // iOS
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  toValue: number;
  duration?: number;
  delay?: number;
  useNativeDriver?: boolean;
}

/**
 * Spring animation configuration
 */
export interface SpringConfig {
  toValue?: number;
  damping?: number;
  mass?: number;
  stiffness?: number;
  overshootClamping?: boolean;
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
  velocity?: number;
  delay?: number;
  useNativeDriver?: boolean;
  // iOS-specific (UIKit Dynamics)
  initialVelocity?: number;
}

/**
 * Timing animation configuration
 */
export interface TimingConfig extends AnimationConfig {
  easing?: string | ((t: number) => number);
}

/**
 * Animated value operations
 */
export interface AnimatedValueOperations {
  setValue(value: number): void;
  setOffset(offset: number): void;
  flattenOffset(): void;
  extractOffset(): void;
  addListener(callback: (state: { value: number }) => void): string;
  removeListener(id: string): void;
  removeAllListeners(): void;
  stopAnimation(callback?: (value: number) => void): void;
  resetAnimation(callback?: (value: number) => void): void;
}

/**
 * Linking URL type
 */
export interface LinkingURL {
  url: string;
  path?: string;
  pathname?: string;
  queryParams?: Record<string, string>;
  query?: string;
  scheme?: string;
  protocol?: string;
  host?: string;
  hostname?: string;
  port?: string;
  hash?: string;
  search?: string;
}

/**
 * Share content type
 */
export interface ShareContent {
  message?: string;
  url?: string;
  title?: string;
  // iOS-specific
  subject?: string; // Email subject
  excludedActivityTypes?: string[];
  // Android-specific
  type?: string; // MIME type
}

/**
 * Share options
 */
export interface ShareOptions {
  dialogTitle?: string; // Android
  tintColor?: string; // iOS
  anchor?: number; // iPad popover anchor view ref
  subject?: string; // Email subject
  // iOS-specific
  excludedActivityTypes?: string[];
}

/**
 * Alert button type
 */
export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  // iOS-specific
  isPreferred?: boolean;
}

/**
 * Alert options
 */
export interface AlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
  // iOS-specific
  userInterfaceStyle?: 'light' | 'dark' | 'unspecified';
}

/**
 * Toast duration
 */
export type ToastDuration = 'short' | 'long';

/**
 * Toast gravity
 */
export type ToastGravity = 'top' | 'bottom' | 'center';

/**
 * Vibration pattern
 */
export type VibrationPattern = number[];

/**
 * Status bar style
 */
export type StatusBarStyle = 'default' | 'light-content' | 'dark-content';

/**
 * Status bar animation
 */
export type StatusBarAnimation = 'none' | 'fade' | 'slide';

/**
 * Permission status
 */
export type PermissionStatus = 'granted' | 'denied' | 'never_ask_again' | 'unavailable' | 'blocked' | 'limited';

/**
 * Android permissions
 */
export type AndroidPermission =
  | 'android.permission.CAMERA'
  | 'android.permission.READ_EXTERNAL_STORAGE'
  | 'android.permission.WRITE_EXTERNAL_STORAGE'
  | 'android.permission.READ_MEDIA_IMAGES'
  | 'android.permission.READ_MEDIA_VIDEO'
  | 'android.permission.READ_MEDIA_AUDIO'
  | 'android.permission.ACCESS_FINE_LOCATION'
  | 'android.permission.ACCESS_COARSE_LOCATION'
  | 'android.permission.ACCESS_BACKGROUND_LOCATION'
  | 'android.permission.RECORD_AUDIO'
  | 'android.permission.READ_CONTACTS'
  | 'android.permission.WRITE_CONTACTS'
  | 'android.permission.READ_CALENDAR'
  | 'android.permission.WRITE_CALENDAR'
  | 'android.permission.CALL_PHONE'
  | 'android.permission.SEND_SMS'
  | 'android.permission.RECEIVE_SMS'
  | 'android.permission.POST_NOTIFICATIONS'
  | 'android.permission.BLUETOOTH_CONNECT'
  | 'android.permission.BLUETOOTH_SCAN'
  | 'android.permission.NEARBY_WIFI_DEVICES'
  | 'android.permission.BODY_SENSORS'
  | 'android.permission.ACTIVITY_RECOGNITION';

/**
 * iOS permissions
 */
export type IOSPermission =
  | 'camera'
  | 'microphone'
  | 'photo-library'
  | 'photo-library-add'
  | 'location-when-in-use'
  | 'location-always'
  | 'contacts'
  | 'calendars'
  | 'reminders'
  | 'speech-recognition'
  | 'media-library'
  | 'motion'
  | 'notifications'
  | 'bluetooth'
  | 'face-id'
  | 'tracking'
  | 'siri';

/**
 * Cross-platform permission type
 */
export type Permission = AndroidPermission | IOSPermission | string;

/**
 * Haptic feedback types
 */
export type HapticFeedbackType =
  // iOS
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'impactRigid'
  | 'impactSoft'
  | 'notificationSuccess'
  | 'notificationWarning'
  | 'notificationError'
  | 'selection'
  // Android
  | 'effectClick'
  | 'effectDoubleClick'
  | 'effectHeavyClick'
  | 'effectTick'
  | 'clockTick'
  | 'contextClick'
  | 'keyboardPress'
  | 'keyboardRelease'
  | 'keyboardTap'
  | 'longPress'
  | 'textHandleMove'
  | 'virtualKey'
  | 'virtualKeyRelease';

/**
 * App state status
 */
export type AppStateStatus = 'active' | 'background' | 'inactive' | 'unknown' | 'extension';

/**
 * Device orientation
 */
export type DeviceOrientation =
  | 'portrait'
  | 'portrait-upside-down'
  | 'landscape-left'
  | 'landscape-right'
  | 'face-up'
  | 'face-down'
  | 'unknown';

/**
 * Interface orientation (app orientation)
 */
export type InterfaceOrientation = 'portrait' | 'landscape';

/**
 * Biometric type
 */
export type BiometricType = 'TouchID' | 'FaceID' | 'Fingerprint' | 'Iris' | 'none';

/**
 * Action sheet button
 */
export interface ActionSheetButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  icon?: string; // iOS SF Symbol or Android icon name
  onPress?: () => void;
}

/**
 * Action sheet options
 */
export interface ActionSheetOptions {
  title?: string;
  message?: string;
  buttons: ActionSheetButton[];
  cancelButtonIndex?: number;
  destructiveButtonIndex?: number | number[];
  anchor?: number; // iPad popover anchor
  tintColor?: string; // iOS
  userInterfaceStyle?: 'light' | 'dark'; // iOS
}

/**
 * Date time picker mode
 */
export type DateTimePickerMode = 'date' | 'time' | 'datetime' | 'countdown';

/**
 * Date time picker display
 */
export type DateTimePickerDisplay =
  | 'default'
  | 'spinner'
  | 'calendar'
  | 'clock'
  | 'compact' // iOS 14+
  | 'inline'; // iOS 14+
