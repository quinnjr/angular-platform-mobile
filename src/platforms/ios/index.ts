/**
 * Angular Platform Mobile - iOS Platform
 *
 * iOS-specific exports and utilities.
 */

export * from './ios-platform';

// Re-export core with iOS defaults
export { NativeBridge, BridgeConnectionState } from '../../core/bridge/native-bridge';
export type { BridgeMessage, BridgeResponse, BridgeConfig, BridgeTransport } from '../../core/bridge/native-bridge';

// Platform utilities
export { Platform, PLATFORM, PLATFORM_TYPE } from '../../core/platform/platform';
export type {
  PlatformType,
  PlatformOS,
  PlatformDimensions,
  ColorScheme,
  SafeAreaInsets,
  PlatformConstants,
  IPlatform,
} from '../../core/platform/platform';
