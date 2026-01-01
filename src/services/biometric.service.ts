/**
 * Biometric Authentication Service
 *
 * Provides biometric authentication (Face ID, Touch ID, Fingerprint)
 * for both iOS and Android platforms.
 */

import { Injectable, Inject } from '@angular/core';
import { BridgeService } from '../core/bridge/bridge.service';
import { PLATFORM, IPlatform } from '../core/platform/platform';
import { BiometricType } from '../types/native.types';

/**
 * Biometric authentication result
 */
export interface BiometricResult {
  success: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Biometric authentication options
 */
export interface BiometricOptions {
  /** Prompt title */
  title?: string;
  /** Prompt subtitle (Android only) */
  subtitle?: string;
  /** Prompt description/reason */
  description?: string;
  /** Cancel button text */
  cancelButtonText?: string;
  /** Fallback button text (for password fallback) */
  fallbackButtonText?: string;
  /** Allow device passcode as fallback */
  allowDeviceCredential?: boolean;
  /** Confirm on biometric match (Android only) */
  confirmationRequired?: boolean;
}

/**
 * Biometric Authentication Service
 *
 * Provides cross-platform biometric authentication.
 *
 * @example
 * ```typescript
 * // Check availability
 * const available = await this.biometric.isAvailable();
 *
 * // Authenticate
 * const result = await this.biometric.authenticate({
 *   title: 'Authenticate',
 *   description: 'Use biometrics to access your account',
 * });
 *
 * if (result.success) {
 *   // Authenticated!
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class BiometricService {
  constructor(
    private readonly bridgeService: BridgeService,
    @Inject(PLATFORM) private readonly platform: IPlatform
  ) {}

  /**
   * Check if biometric authentication is available
   */
  async isAvailable(): Promise<boolean> {
    return this.bridgeService.request<boolean>('biometricIsAvailable', {});
  }

  /**
   * Get the type of biometric authentication available
   */
  async getBiometricType(): Promise<BiometricType> {
    return this.bridgeService.request<BiometricType>('getBiometricType', {});
  }

  /**
   * Check if device has enrolled biometrics
   */
  async isEnrolled(): Promise<boolean> {
    return this.bridgeService.request<boolean>('biometricIsEnrolled', {});
  }

  /**
   * Authenticate using biometrics
   *
   * @param options - Authentication options
   * @returns Promise resolving to authentication result
   */
  async authenticate(options: BiometricOptions = {}): Promise<BiometricResult> {
    const defaultOptions: BiometricOptions = {
      title: this.platform.select({
        ios: 'Authenticate',
        android: 'Biometric Authentication',
      }),
      description: this.platform.select({
        ios: 'Use Face ID or Touch ID to continue',
        android: 'Use your fingerprint to authenticate',
      }),
      cancelButtonText: 'Cancel',
      fallbackButtonText: 'Use Password',
      allowDeviceCredential: false,
      confirmationRequired: true,
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
      const result = await this.bridgeService.request<BiometricResult>('biometricAuthenticate', mergedOptions);
      return result;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      return {
        success: false,
        error: err.message ?? 'Authentication failed',
        errorCode: err.code,
      };
    }
  }

  /**
   * Get a human-readable name for the biometric type
   */
  async getBiometricName(): Promise<string> {
    const type = await this.getBiometricType();

    switch (type) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Fingerprint':
        return 'Fingerprint';
      case 'Iris':
        return 'Iris Scanner';
      default:
        return 'Biometrics';
    }
  }

  /**
   * Check if Face ID is available (iOS only)
   */
  async isFaceIDAvailable(): Promise<boolean> {
    if (!this.platform.isIOS) {
      return false;
    }
    const type = await this.getBiometricType();
    return type === 'FaceID';
  }

  /**
   * Check if Touch ID is available (iOS only)
   */
  async isTouchIDAvailable(): Promise<boolean> {
    if (!this.platform.isIOS) {
      return false;
    }
    const type = await this.getBiometricType();
    return type === 'TouchID';
  }

  /**
   * Check if fingerprint is available (Android only)
   */
  async isFingerprintAvailable(): Promise<boolean> {
    if (!this.platform.isAndroid) {
      return false;
    }
    const type = await this.getBiometricType();
    return type === 'Fingerprint';
  }
}
