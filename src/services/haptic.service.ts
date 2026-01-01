/**
 * Haptic Feedback Service
 *
 * Provides haptic feedback functionality for both iOS and Android.
 * Uses platform-specific haptic APIs for the best user experience.
 */

import { Injectable, Inject } from '@angular/core';
import { BridgeService } from '../core/bridge/bridge.service';
import { PLATFORM, IPlatform } from '../core/platform/platform';
import { HapticFeedbackType } from '../types/native.types';

/**
 * Haptic intensity levels
 */
export type HapticIntensity = 'light' | 'medium' | 'heavy';

/**
 * Haptic Feedback Service
 *
 * Provides cross-platform haptic feedback.
 *
 * @example
 * ```typescript
 * // Inject the service
 * constructor(private haptic: HapticService) {}
 *
 * // Trigger feedback
 * this.haptic.impact('medium');
 * this.haptic.notification('success');
 * this.haptic.selection();
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class HapticService {
  constructor(
    private readonly bridgeService: BridgeService,
    @Inject(PLATFORM) private readonly platform: IPlatform
  ) {}

  /**
   * Trigger impact feedback
   *
   * @param intensity - The intensity of the impact (light, medium, heavy)
   */
  async impact(intensity: HapticIntensity = 'medium'): Promise<void> {
    const type = this.platform.select<HapticFeedbackType>({
      ios: `impact${intensity.charAt(0).toUpperCase() + intensity.slice(1)}` as HapticFeedbackType,
      android: intensity === 'light' ? 'effectClick' : intensity === 'heavy' ? 'effectHeavyClick' : 'effectDoubleClick',
    });

    if (type) {
      await this.trigger(type);
    }
  }

  /**
   * Trigger notification feedback
   *
   * @param type - The type of notification (success, warning, error)
   */
  async notification(type: 'success' | 'warning' | 'error'): Promise<void> {
    const hapticType = this.platform.select<HapticFeedbackType>({
      ios: `notification${type.charAt(0).toUpperCase() + type.slice(1)}` as HapticFeedbackType,
      android: type === 'success' ? 'effectClick' : type === 'error' ? 'effectHeavyClick' : 'effectDoubleClick',
    });

    if (hapticType) {
      await this.trigger(hapticType);
    }
  }

  /**
   * Trigger selection feedback (light tap)
   */
  async selection(): Promise<void> {
    const type = this.platform.select<HapticFeedbackType>({
      ios: 'selection',
      android: 'effectTick',
    });

    if (type) {
      await this.trigger(type);
    }
  }

  /**
   * Trigger keyboard feedback
   */
  async keyboard(): Promise<void> {
    const type = this.platform.select<HapticFeedbackType>({
      ios: 'impactLight',
      android: 'keyboardTap',
    });

    if (type) {
      await this.trigger(type);
    }
  }

  /**
   * Trigger a specific haptic feedback type
   *
   * @param type - The haptic feedback type
   */
  async trigger(type: HapticFeedbackType): Promise<void> {
    await this.bridgeService.send('hapticFeedback', { type });
  }

  /**
   * Check if haptic feedback is available
   */
  async isAvailable(): Promise<boolean> {
    return this.bridgeService.request<boolean>('hapticIsAvailable', {});
  }

  /**
   * Vibrate with a pattern (Android) or single vibration (iOS)
   *
   * @param pattern - Vibration pattern in milliseconds [wait, vibrate, wait, vibrate, ...]
   */
  async vibrate(pattern: number[] = [0, 100]): Promise<void> {
    await this.bridgeService.send('vibrate', { pattern });
  }

  /**
   * Cancel any ongoing vibration
   */
  async cancel(): Promise<void> {
    await this.bridgeService.send('cancelVibration', {});
  }
}
