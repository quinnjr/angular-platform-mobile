import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AndroidPlatformConfig,
  createAndroidPlatformProviders,
} from './platform-android';
import { BridgeService } from '../bridge/bridge.service';
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
import { ComponentsModule } from '../../components/components.module';

/**
 * Core module for Angular Platform Android
 *
 * Import this module in your root AppModule to enable Android native rendering.
 *
 * @example
 * ```typescript
 * @NgModule({
 *   imports: [
 *     PlatformAndroidModule.forRoot({
 *       debug: true,
 *       packageName: 'com.myapp.android'
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
export class PlatformAndroidModule {
  constructor(@Optional() @SkipSelf() parentModule?: PlatformAndroidModule) {
    if (parentModule) {
      throw new Error(
        'PlatformAndroidModule has already been loaded. Import it in the AppModule only.'
      );
    }
  }

  /**
   * Configure the Android platform with custom settings
   */
  static forRoot(config: AndroidPlatformConfig = {}): ModuleWithProviders<PlatformAndroidModule> {
    return {
      ngModule: PlatformAndroidModule,
      providers: [
        ...createAndroidPlatformProviders(config),
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
  static forChild(): ModuleWithProviders<PlatformAndroidModule> {
    return {
      ngModule: PlatformAndroidModule,
      providers: [],
    };
  }
}
