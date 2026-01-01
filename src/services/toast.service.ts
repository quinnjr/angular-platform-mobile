import { Injectable } from '@angular/core';
import { BridgeService } from '../core/bridge/bridge.service';
import { ToastDuration, ToastGravity } from '../types/native.types';

/**
 * Toast configuration
 */
export interface ToastConfig {
  /** Toast message */
  message: string;
  /** Display duration */
  duration?: ToastDuration;
  /** Toast position */
  gravity?: ToastGravity;
  /** X offset from gravity */
  xOffset?: number;
  /** Y offset from gravity */
  yOffset?: number;
  /** Background color */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
}

/**
 * Snackbar action
 */
export interface SnackbarAction {
  text: string;
  textColor?: string;
  onPress?: () => void;
}

/**
 * Snackbar configuration
 */
export interface SnackbarConfig {
  message: string;
  duration?: 'short' | 'long' | 'indefinite' | number;
  action?: SnackbarAction;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Toast Service
 *
 * Provides native Android Toast and Snackbar notifications.
 * Shows brief messages to the user.
 */
@Injectable()
export class ToastService {
  constructor(private readonly bridgeService: BridgeService) {}

  /**
   * Show a toast message
   *
   * @example
   * ```typescript
   * // Simple toast
   * toastService.show('Operation completed!');
   *
   * // Toast with duration
   * toastService.show('Processing...', 'long');
   *
   * // Toast with full config
   * toastService.showWithConfig({
   *   message: 'Success!',
   *   duration: 'short',
   *   gravity: 'center',
   *   backgroundColor: '#4CAF50',
   *   textColor: '#FFFFFF'
   * });
   * ```
   */
  show(message: string, duration: ToastDuration = 'short'): void {
    this.bridgeService.send('showToast', {
      message,
      duration: duration === 'long' ? 1 : 0, // Android Toast.LENGTH_LONG = 1, LENGTH_SHORT = 0
    });
  }

  /**
   * Show a toast with full configuration
   */
  showWithConfig(config: ToastConfig): void {
    const duration = config.duration === 'long' ? 1 : 0;
    const gravity = this.getGravityValue(config.gravity);

    this.bridgeService.send('showToastWithConfig', {
      message: config.message,
      duration,
      gravity,
      xOffset: config.xOffset ?? 0,
      yOffset: config.yOffset ?? 0,
      backgroundColor: config.backgroundColor,
      textColor: config.textColor,
    });
  }

  /**
   * Show a short toast at the bottom
   */
  short(message: string): void {
    this.show(message, 'short');
  }

  /**
   * Show a long toast at the bottom
   */
  long(message: string): void {
    this.show(message, 'long');
  }

  /**
   * Show a toast at the top of the screen
   */
  top(message: string, duration: ToastDuration = 'short'): void {
    this.showWithConfig({
      message,
      duration,
      gravity: 'top',
    });
  }

  /**
   * Show a toast at the center of the screen
   */
  center(message: string, duration: ToastDuration = 'short'): void {
    this.showWithConfig({
      message,
      duration,
      gravity: 'center',
    });
  }

  /**
   * Show a success toast (green)
   */
  success(message: string, duration: ToastDuration = 'short'): void {
    this.showWithConfig({
      message,
      duration,
      backgroundColor: '#4CAF50',
      textColor: '#FFFFFF',
    });
  }

  /**
   * Show an error toast (red)
   */
  error(message: string, duration: ToastDuration = 'short'): void {
    this.showWithConfig({
      message,
      duration,
      backgroundColor: '#F44336',
      textColor: '#FFFFFF',
    });
  }

  /**
   * Show a warning toast (orange)
   */
  warning(message: string, duration: ToastDuration = 'short'): void {
    this.showWithConfig({
      message,
      duration,
      backgroundColor: '#FF9800',
      textColor: '#FFFFFF',
    });
  }

  /**
   * Show an info toast (blue)
   */
  info(message: string, duration: ToastDuration = 'short'): void {
    this.showWithConfig({
      message,
      duration,
      backgroundColor: '#2196F3',
      textColor: '#FFFFFF',
    });
  }

  /**
   * Show a Snackbar (Material Design)
   *
   * @example
   * ```typescript
   * // Simple snackbar
   * toastService.snackbar({ message: 'Item deleted' });
   *
   * // Snackbar with action
   * toastService.snackbar({
   *   message: 'Item deleted',
   *   action: {
   *     text: 'UNDO',
   *     onPress: () => undoDelete()
   *   }
   * });
   *
   * // Indefinite snackbar with dismiss action
   * toastService.snackbar({
   *   message: 'No internet connection',
   *   duration: 'indefinite',
   *   action: {
   *     text: 'DISMISS'
   *   }
   * });
   * ```
   */
  async snackbar(config: SnackbarConfig): Promise<void> {
    const duration = this.getSnackbarDuration(config.duration);

    if (config.action?.onPress) {
      // Set up action callback
      const actionId = `snackbar_action_${Date.now()}`;

      const unsubscribe = this.bridgeService.on<{ actionId: string }>('snackbarAction')
        .subscribe((event) => {
          if (event.actionId === actionId) {
            config.action!.onPress!();
            unsubscribe.unsubscribe();
          }
        });

      await this.bridgeService.send('showSnackbar', {
        message: config.message,
        duration,
        actionText: config.action?.text,
        actionId,
        actionTextColor: config.action?.textColor,
        backgroundColor: config.backgroundColor,
        textColor: config.textColor,
      });
    } else {
      await this.bridgeService.send('showSnackbar', {
        message: config.message,
        duration,
        actionText: config.action?.text,
        actionTextColor: config.action?.textColor,
        backgroundColor: config.backgroundColor,
        textColor: config.textColor,
      });
    }
  }

  /**
   * Dismiss any visible snackbar
   */
  async dismissSnackbar(): Promise<void> {
    await this.bridgeService.send('dismissSnackbar', {});
  }

  /**
   * Get Android gravity value
   */
  private getGravityValue(gravity?: ToastGravity): number {
    switch (gravity) {
      case 'top':
        return 48; // Gravity.TOP
      case 'center':
        return 17; // Gravity.CENTER
      case 'bottom':
      default:
        return 80; // Gravity.BOTTOM
    }
  }

  /**
   * Get snackbar duration value
   */
  private getSnackbarDuration(duration?: 'short' | 'long' | 'indefinite' | number): number {
    if (typeof duration === 'number') {
      return duration;
    }

    switch (duration) {
      case 'long':
        return 0; // Snackbar.LENGTH_LONG
      case 'indefinite':
        return -2; // Snackbar.LENGTH_INDEFINITE
      case 'short':
      default:
        return -1; // Snackbar.LENGTH_SHORT
    }
  }
}
