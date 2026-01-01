/**
 * Platform Abstraction Layer
 *
 * Provides a unified interface for platform-specific implementations.
 * This allows code to work seamlessly across iOS and Android.
 */

import { InjectionToken } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

/**
 * Supported mobile platforms
 */
export type PlatformType = 'ios' | 'android';

/**
 * Platform OS information
 */
export interface PlatformOS {
  /** Platform type */
  type: PlatformType;
  /** OS version string */
  version: string;
  /** OS version number (e.g., 14 for iOS 14, 33 for Android 13) */
  versionNumber: number;
  /** Whether running on a tablet */
  isTablet: boolean;
  /** Whether running on a TV */
  isTV: boolean;
  /** Device model identifier */
  model: string;
  /** Device brand (Android only) */
  brand?: string;
  /** Device manufacturer (Android only) */
  manufacturer?: string;
  /** Device name (iOS only) */
  deviceName?: string;
}

/**
 * Platform dimensions
 */
export interface PlatformDimensions {
  window: {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
  };
  screen: {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
  };
}

/**
 * Platform appearance (light/dark mode)
 */
export type ColorScheme = 'light' | 'dark' | 'no-preference';

/**
 * Safe area insets
 */
export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Platform constants that don't change at runtime
 */
export interface PlatformConstants {
  /** Whether the app is running in debug mode */
  isDebugging: boolean;
  /** Whether the platform supports RTL */
  isRTL: boolean;
  /** Platform-specific constants */
  android?: {
    apiLevel: number;
    sdkInt: number;
    release: string;
    fingerprint: string;
  };
  ios?: {
    systemName: string;
    systemVersion: string;
    interfaceIdiom: 'phone' | 'pad' | 'tv' | 'carPlay' | 'mac';
    isSimulator: boolean;
  };
}

/**
 * Base interface for platform implementations
 */
export interface IPlatform {
  /** Platform type */
  readonly type: PlatformType;

  /** Platform OS information */
  readonly OS: PlatformOS;

  /** Platform constants */
  readonly constants: PlatformConstants;

  /** Whether this is iOS */
  readonly isIOS: boolean;

  /** Whether this is Android */
  readonly isAndroid: boolean;

  /** Current dimensions (observable) */
  readonly dimensions$: Observable<PlatformDimensions>;

  /** Current color scheme (observable) */
  readonly colorScheme$: Observable<ColorScheme>;

  /** Safe area insets (observable) */
  readonly safeAreaInsets$: Observable<SafeAreaInsets>;

  /** Get current dimensions synchronously */
  getDimensions(): PlatformDimensions;

  /** Get current color scheme synchronously */
  getColorScheme(): ColorScheme;

  /** Get safe area insets synchronously */
  getSafeAreaInsets(): SafeAreaInsets;

  /** Select platform-specific value */
  select<T>(specifics: { ios?: T; android?: T; default?: T }): T | undefined;

  /** Check if running on specific platform version or higher */
  isVersionAtLeast(version: number): boolean;
}

/**
 * Injection token for the platform implementation
 */
export const PLATFORM = new InjectionToken<IPlatform>('MobilePlatform');

/**
 * Injection token for platform type
 */
export const PLATFORM_TYPE = new InjectionToken<PlatformType>('PlatformType');

/**
 * Abstract base class for platform implementations
 */
export abstract class BasePlatform implements IPlatform {
  abstract readonly type: PlatformType;
  abstract readonly OS: PlatformOS;
  abstract readonly constants: PlatformConstants;

  protected readonly _dimensions$ = new BehaviorSubject<PlatformDimensions>({
    window: { width: 0, height: 0, scale: 1, fontScale: 1 },
    screen: { width: 0, height: 0, scale: 1, fontScale: 1 },
  });

  protected readonly _colorScheme$ = new BehaviorSubject<ColorScheme>('light');

  protected readonly _safeAreaInsets$ = new BehaviorSubject<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  get isIOS(): boolean {
    return this.type === 'ios';
  }

  get isAndroid(): boolean {
    return this.type === 'android';
  }

  get dimensions$(): Observable<PlatformDimensions> {
    return this._dimensions$.asObservable();
  }

  get colorScheme$(): Observable<ColorScheme> {
    return this._colorScheme$.asObservable();
  }

  get safeAreaInsets$(): Observable<SafeAreaInsets> {
    return this._safeAreaInsets$.asObservable();
  }

  getDimensions(): PlatformDimensions {
    return this._dimensions$.getValue();
  }

  getColorScheme(): ColorScheme {
    return this._colorScheme$.getValue();
  }

  getSafeAreaInsets(): SafeAreaInsets {
    return this._safeAreaInsets$.getValue();
  }

  select<T>(specifics: { ios?: T; android?: T; default?: T }): T | undefined {
    if (this.isIOS && specifics.ios !== undefined) {
      return specifics.ios;
    }
    if (this.isAndroid && specifics.android !== undefined) {
      return specifics.android;
    }
    return specifics.default;
  }

  isVersionAtLeast(version: number): boolean {
    return this.OS.versionNumber >= version;
  }

  /**
   * Update dimensions (called by native bridge)
   */
  protected updateDimensions(dimensions: PlatformDimensions): void {
    this._dimensions$.next(dimensions);
  }

  /**
   * Update color scheme (called by native bridge)
   */
  protected updateColorScheme(scheme: ColorScheme): void {
    this._colorScheme$.next(scheme);
  }

  /**
   * Update safe area insets (called by native bridge)
   */
  protected updateSafeAreaInsets(insets: SafeAreaInsets): void {
    this._safeAreaInsets$.next(insets);
  }
}

/**
 * Native global interface for platform detection
 */
interface PlatformDetectionGlobal {
  __IOS_BRIDGE__?: unknown;
  __ANDROID_BRIDGE__?: unknown;
  navigator?: { userAgent?: string };
}

/**
 * Get typed global for platform detection
 */
function getPlatformGlobal(): PlatformDetectionGlobal {
  return globalThis as unknown as PlatformDetectionGlobal;
}

/**
 * Platform detection utilities
 */
export const Platform = {
  /**
   * Detect current platform from user agent or native context
   */
  detect(): PlatformType {
    const global = getPlatformGlobal();

    // Check for native bridge first
    if (global.__IOS_BRIDGE__ !== undefined) {
      return 'ios';
    }
    if (global.__ANDROID_BRIDGE__ !== undefined) {
      return 'android';
    }

    // Fallback to user agent detection (for development/testing)
    if (global.navigator?.userAgent) {
      const ua = global.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        return 'ios';
      }
      if (/android/.test(ua)) {
        return 'android';
      }
    }

    // Default to Android for development
    return 'android';
  },

  /**
   * Select platform-specific value
   */
  select<T>(specifics: { ios?: T; android?: T; default?: T }): T | undefined {
    const type = Platform.detect();
    if (type === 'ios' && specifics.ios !== undefined) {
      return specifics.ios;
    }
    if (type === 'android' && specifics.android !== undefined) {
      return specifics.android;
    }
    return specifics.default;
  },

  /**
   * Check if running on iOS
   */
  get isIOS(): boolean {
    return Platform.detect() === 'ios';
  },

  /**
   * Check if running on Android
   */
  get isAndroid(): boolean {
    return Platform.detect() === 'android';
  },
};
