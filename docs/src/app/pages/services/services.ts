import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ServiceDoc {
  name: string;
  path: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-services',
  imports: [RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class ServicesPage {
  protected readonly services: ServiceDoc[] = [
    {
      name: 'NavigationService',
      path: 'navigation',
      description: 'Native navigation stack with transitions and deep linking.',
      icon: '🧭',
    },
    {
      name: 'StorageService',
      path: 'storage',
      description: 'Persistent key-value storage using native storage APIs.',
      icon: '💾',
    },
    {
      name: 'DeviceService',
      path: 'device',
      description: 'Device info, dimensions, orientation, and system settings.',
      icon: '📱',
    },
    {
      name: 'PermissionsService',
      path: 'permissions',
      description: 'Request and check native permissions for camera, location, etc.',
      icon: '🔐',
    },
    {
      name: 'AlertService',
      path: 'alert',
      description: 'Native alerts, action sheets, and confirmation dialogs.',
      icon: '⚠️',
    },
    {
      name: 'LinkingService',
      path: 'linking',
      description: 'Open URLs, deep links, and handle incoming links.',
      icon: '🔗',
    },
    {
      name: 'ClipboardService',
      path: 'clipboard',
      description: 'Read and write to the system clipboard.',
      icon: '📋',
    },
    {
      name: 'ShareService',
      path: 'share',
      description: 'Native share sheet for sharing content to other apps.',
      icon: '📤',
    },
    {
      name: 'ToastService',
      path: 'toast',
      description: 'Show toast notifications and snackbars.',
      icon: '🔔',
    },
    {
      name: 'HapticService',
      path: 'haptic',
      description: 'Trigger haptic feedback for touch interactions.',
      icon: '📳',
    },
    {
      name: 'BiometricService',
      path: 'biometric',
      description: 'Face ID, Touch ID, and fingerprint authentication.',
      icon: '👆',
    },
  ];

  protected readonly codeExample1 = `import { Component, inject } from '@angular/core';
import {
  DeviceService,
  HapticService,
  AlertService
} from '@pegasusheavy/angular-platform-mobile';

@Component({
  selector: 'app-settings',
  template: \`
    <mobile-view>
      <mobile-text>Device: {{ device.model }}</mobile-text>
      <mobile-button (press)="showAlert()">Show Alert</mobile-button>
    </mobile-view>
  \`,
})
export class SettingsComponent {
  private readonly deviceService = inject(DeviceService);
  private readonly hapticService = inject(HapticService);
  private readonly alertService = inject(AlertService);

  get device() {
    return this.deviceService.info;
  }

  async showAlert() {
    // Trigger haptic feedback
    await this.hapticService.impact('medium');

    // Show native alert
    await this.alertService.show({
      title: 'Settings',
      message: 'Would you like to save changes?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', style: 'default' },
      ],
    });
  }
}`;

  protected readonly codeExample2 = `import { DeviceService } from '@pegasusheavy/angular-platform-mobile';

@Component({...})
export class MyComponent {
  private readonly deviceService = inject(DeviceService);

  // Subscribe to dimension changes
  dimensions$ = this.deviceService.dimensions$;

  // Subscribe to orientation changes
  orientation$ = this.deviceService.orientation$;

  // Subscribe to color scheme changes
  colorScheme$ = this.deviceService.colorScheme$;
}`;

  protected readonly codeExample3 = `import { PermissionsService } from '@pegasusheavy/angular-platform-mobile';

@Component({...})
export class CameraComponent {
  private readonly permissions = inject(PermissionsService);

  async requestCameraAccess() {
    const result = await this.permissions.request('camera');

    if (result.granted) {
      // Camera access granted
      await this.openCamera();
    } else if (!result.canAskAgain) {
      // User permanently denied, show settings prompt
      await this.showSettingsPrompt();
    }
  }
}`;
}
