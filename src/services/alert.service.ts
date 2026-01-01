import { Injectable } from '@angular/core';
import { BridgeService } from '../core/bridge/bridge.service';
import { AlertButton, AlertOptions } from '../types/native.types';

/**
 * Alert input configuration
 */
export interface AlertInput {
  type?: 'default' | 'plain-text' | 'secure-text' | 'login-password';
  defaultValue?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
}

/**
 * Prompt result with input values
 */
export interface PromptResult {
  buttonIndex: number;
  text?: string;
  login?: string;
  password?: string;
}

/**
 * Alert Service
 *
 * Provides native Android alert dialogs, prompts, and action sheets.
 * Maps to Android's AlertDialog and DialogFragment.
 */
@Injectable()
export class AlertService {
  constructor(private readonly bridgeService: BridgeService) {}

  /**
   * Show a basic alert dialog
   *
   * @example
   * ```typescript
   * alertService.alert('Title', 'This is the message');
   *
   * alertService.alert('Confirm?', 'Are you sure?', [
   *   { text: 'Cancel', style: 'cancel' },
   *   { text: 'OK', onPress: () => doSomething() }
   * ]);
   * ```
   */
  async alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ): Promise<number> {
    const alertButtons = buttons || [{ text: 'OK' }];

    return new Promise((resolve) => {
      this.bridgeService
        .request<{ buttonIndex: number }>('showAlert', {
          title,
          message,
          buttons: alertButtons.map((btn, index) => ({
            text: btn.text,
            style: btn.style || 'default',
            index,
          })),
          cancelable: options?.cancelable ?? true,
        })
        .then((result) => {
          const button = alertButtons[result.buttonIndex];
          if (button?.onPress) {
            button.onPress();
          }
          if (options?.onDismiss) {
            options.onDismiss();
          }
          resolve(result.buttonIndex);
        })
        .catch(() => {
          if (options?.onDismiss) {
            options.onDismiss();
          }
          resolve(-1);
        });
    });
  }

  /**
   * Show a confirmation dialog with OK and Cancel buttons
   */
  async confirm(title: string, message?: string): Promise<boolean> {
    return new Promise((resolve) => {
      void this.alert(title, message, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'OK', onPress: () => resolve(true) },
      ]);
    });
  }

  /**
   * Show a prompt dialog with text input
   *
   * @example
   * ```typescript
   * const result = await alertService.prompt('Enter Name', 'Please enter your name');
   * if (result.text) {
   *   console.log('Name:', result.text);
   * }
   * ```
   */
  async prompt(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    inputConfig?: AlertInput
  ): Promise<PromptResult> {
    const alertButtons = buttons || [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK' },
    ];

    return this.bridgeService.request<PromptResult>('showPrompt', {
      title,
      message,
      buttons: alertButtons.map((btn, index) => ({
        text: btn.text,
        style: btn.style || 'default',
        index,
      })),
      inputType: inputConfig?.type || 'plain-text',
      defaultValue: inputConfig?.defaultValue || '',
      placeholder: inputConfig?.placeholder || '',
      keyboardType: inputConfig?.keyboardType || 'default',
    });
  }

  /**
   * Show an action sheet with multiple options
   *
   * @example
   * ```typescript
   * const index = await alertService.actionSheet({
   *   title: 'Choose an action',
   *   options: ['Option 1', 'Option 2', 'Option 3'],
   *   cancelButtonIndex: 3,
   *   destructiveButtonIndex: 2,
   * });
   * ```
   */
  async actionSheet(config: {
    title?: string;
    message?: string;
    options: string[];
    cancelButtonIndex?: number;
    destructiveButtonIndex?: number;
    tintColor?: string;
  }): Promise<number> {
    return this.bridgeService.request<number>('showActionSheet', {
      title: config.title,
      message: config.message,
      options: config.options,
      cancelButtonIndex: config.cancelButtonIndex ?? config.options.length - 1,
      destructiveButtonIndex: config.destructiveButtonIndex,
      tintColor: config.tintColor,
    });
  }

  /**
   * Show a date picker dialog
   */
  async datePicker(config?: {
    date?: Date;
    minimumDate?: Date;
    maximumDate?: Date;
    mode?: 'date' | 'time' | 'datetime';
  }): Promise<Date | null> {
    try {
      const result = await this.bridgeService.request<{ timestamp: number } | null>(
        'showDatePicker',
        {
          timestamp: (config?.date || new Date()).getTime(),
          minimumTimestamp: config?.minimumDate?.getTime(),
          maximumTimestamp: config?.maximumDate?.getTime(),
          mode: config?.mode || 'date',
        }
      );

      return result ? new Date(result.timestamp) : null;
    } catch {
      return null;
    }
  }

  /**
   * Show a time picker dialog
   */
  async timePicker(config?: {
    hour?: number;
    minute?: number;
    is24Hour?: boolean;
  }): Promise<{ hour: number; minute: number } | null> {
    const now = new Date();

    try {
      return await this.bridgeService.request<{ hour: number; minute: number } | null>(
        'showTimePicker',
        {
          hour: config?.hour ?? now.getHours(),
          minute: config?.minute ?? now.getMinutes(),
          is24Hour: config?.is24Hour ?? true,
        }
      );
    } catch {
      return null;
    }
  }

  /**
   * Show a single choice dialog (radio buttons)
   */
  async singleChoice(config: {
    title: string;
    items: string[];
    selectedIndex?: number;
  }): Promise<number> {
    return this.bridgeService.request<number>('showSingleChoice', {
      title: config.title,
      items: config.items,
      selectedIndex: config.selectedIndex ?? -1,
    });
  }

  /**
   * Show a multi choice dialog (checkboxes)
   */
  async multiChoice(config: {
    title: string;
    items: string[];
    selectedIndices?: number[];
  }): Promise<number[]> {
    return this.bridgeService.request<number[]>('showMultiChoice', {
      title: config.title,
      items: config.items,
      selectedIndices: config.selectedIndices ?? [],
    });
  }
}
