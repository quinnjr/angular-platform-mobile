/**
 * Platform Mobile Module
 *
 * Root module for Angular Platform Mobile.
 * Provides core services for both iOS and Android platforms.
 */

import { NgModule, ModuleWithProviders, Optional, SkipSelf, Provider, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Platform, PLATFORM, PLATFORM_TYPE, PlatformType } from './platform';
import { NativeBridge } from '../bridge/native-bridge';
import { BridgeService } from '../bridge/bridge.service';

// Services
import { StyleService } from '../../services/style.service';
import { NavigationService } from '../../services/navigation.service';
import { DeviceService } from '../../services/device.service';
import { StorageService } from '../../services/storage.service';
import { PermissionsService } from '../../services/permissions.service';
import { AlertService } from '../../services/alert.service';
import { LinkingService } from '../../services/linking.service';
import { ClipboardService } from '../../services/clipboard.service';
import { ShareService } from '../../services/share.service';
import { ToastService } from '../../services/toast.service';

// Components
import { ComponentsModule } from '../../components/components.module';

// Platform implementations
import { AndroidPlatform } from '../../platforms/android/android-platform';
import { IOSPlatform } from '../../platforms/ios/ios-platform';

/**
 * Mobile platform configuration
 */
export interface MobilePlatformConfig {
  /** Enable debug mode */
  debug?: boolean;
  /** App package name (Android) or bundle ID (iOS) */
  appId?: string;
  /** Force a specific platform (for testing) */
  platform?: PlatformType;
  /** WebSocket port for development */
  bridgePort?: number;
  /** Enable hot reload in development */
  hotReload?: boolean;
}

/**
 * Injection token for mobile platform configuration
 */
export const MOBILE_PLATFORM_CONFIG = new InjectionToken<MobilePlatformConfig>('MobilePlatformConfig');

/**
 * Create providers for the mobile platform
 */
export function createMobilePlatformProviders(config: MobilePlatformConfig = {}): Provider[] {
  const platformType = config.platform ?? Platform.detect();

  return [
    { provide: MOBILE_PLATFORM_CONFIG, useValue: config },
    { provide: PLATFORM_TYPE, useValue: platformType },
    {
      provide: NativeBridge,
      useFactory: () => new NativeBridge({
        port: config.bridgePort ?? 8081,
        debug: config.debug ?? false,
        platform: platformType,
      }),
    },
    {
      provide: PLATFORM,
      useFactory: (bridge: NativeBridge) => {
        if (platformType === 'ios') {
          return new IOSPlatform(bridge);
        }
        return new AndroidPlatform(bridge);
      },
      deps: [NativeBridge],
    },
  ];
}

/**
 * Platform Mobile Module
 *
 * The root module for Angular Platform Mobile.
 * Import this module in your AppModule to enable mobile native rendering.
 *
 * @example
 * ```typescript
 * @NgModule({
 *   imports: [
 *     PlatformMobileModule.forRoot({
 *       debug: true,
 *       appId: 'com.myapp.mobile'
 *     })
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
@NgModule({
  imports: [CommonModule, ComponentsModule],
  exports: [ComponentsModule],
})
export class PlatformMobileModule {
  constructor(@Optional() @SkipSelf() parentModule?: PlatformMobileModule) {
    if (parentModule) {
      throw new Error(
        'PlatformMobileModule has already been loaded. Import it in the AppModule only.'
      );
    }
  }

  /**
   * Configure the mobile platform with custom settings
   */
  static forRoot(config: MobilePlatformConfig = {}): ModuleWithProviders<PlatformMobileModule> {
    return {
      ngModule: PlatformMobileModule,
      providers: [
        ...createMobilePlatformProviders(config),
        BridgeService,
        StyleService,
        NavigationService,
        DeviceService,
        StorageService,
        PermissionsService,
        AlertService,
        LinkingService,
        ClipboardService,
        ShareService,
        ToastService,
      ],
    };
  }

  /**
   * Import in feature modules (no providers)
   */
  static forChild(): ModuleWithProviders<PlatformMobileModule> {
    return {
      ngModule: PlatformMobileModule,
      providers: [],
    };
  }
}

/**
 * Alias for backward compatibility
 * @deprecated Use PlatformMobileModule instead
 */
export const PlatformAndroidModule = PlatformMobileModule;
