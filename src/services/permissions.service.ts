import { Injectable } from '@angular/core';
import { BridgeService } from '../core/bridge/bridge.service';
import { AndroidPermission, PermissionStatus } from '../types/native.types';

/**
 * Permission result
 */
export interface PermissionResult {
  permission: string;
  status: PermissionStatus;
}

/**
 * Multiple permissions result
 */
export type PermissionsResult = Record<string, PermissionStatus>;

/**
 * Permissions Service
 *
 * Handles Android runtime permissions.
 * Provides methods to check, request, and manage permissions.
 */
@Injectable()
export class PermissionsService {
  constructor(private readonly bridgeService: BridgeService) {}

  /**
   * Check if a permission is granted
   */
  async check(permission: AndroidPermission): Promise<PermissionStatus> {
    try {
      const result = await this.bridgeService.request<PermissionResult>('checkPermission', {
        permission,
      });
      return result.status;
    } catch (error) {
      console.error(`[PermissionsService] Failed to check permission: ${permission}`, error);
      return 'unavailable';
    }
  }

  /**
   * Request a permission
   */
  async request(permission: AndroidPermission): Promise<PermissionStatus> {
    try {
      const result = await this.bridgeService.request<PermissionResult>('requestPermission', {
        permission,
      });
      return result.status;
    } catch (error) {
      console.error(`[PermissionsService] Failed to request permission: ${permission}`, error);
      return 'denied';
    }
  }

  /**
   * Check multiple permissions
   */
  async checkMultiple(permissions: AndroidPermission[]): Promise<PermissionsResult> {
    try {
      return await this.bridgeService.request<PermissionsResult>('checkMultiplePermissions', {
        permissions,
      });
    } catch (error) {
      console.error('[PermissionsService] Failed to check multiple permissions', error);
      const result: PermissionsResult = {};
      for (const p of permissions) {
        result[p] = 'unavailable';
      }
      return result;
    }
  }

  /**
   * Request multiple permissions
   */
  async requestMultiple(permissions: AndroidPermission[]): Promise<PermissionsResult> {
    try {
      return await this.bridgeService.request<PermissionsResult>('requestMultiplePermissions', {
        permissions,
      });
    } catch (error) {
      console.error('[PermissionsService] Failed to request multiple permissions', error);
      const result: PermissionsResult = {};
      for (const p of permissions) {
        result[p] = 'denied';
      }
      return result;
    }
  }

  /**
   * Open app settings
   */
  async openSettings(): Promise<void> {
    await this.bridgeService.send('openAppSettings', {});
  }

  /**
   * Check if permission should show rationale
   */
  async shouldShowRequestPermissionRationale(permission: AndroidPermission): Promise<boolean> {
    try {
      return await this.bridgeService.request<boolean>('shouldShowRationale', {
        permission,
      });
    } catch {
      return false;
    }
  }

  // Common permission helpers

  /**
   * Request camera permission
   */
  async requestCamera(): Promise<PermissionStatus> {
    return this.request('android.permission.CAMERA');
  }

  /**
   * Request location permissions
   */
  async requestLocation(precise: boolean = true): Promise<PermissionsResult> {
    const permissions: AndroidPermission[] = ['android.permission.ACCESS_COARSE_LOCATION'];

    if (precise) {
      permissions.push('android.permission.ACCESS_FINE_LOCATION');
    }

    return this.requestMultiple(permissions);
  }

  /**
   * Request storage permissions
   */
  async requestStorage(): Promise<PermissionsResult> {
    return this.requestMultiple([
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ]);
  }

  /**
   * Request microphone permission
   */
  async requestMicrophone(): Promise<PermissionStatus> {
    return this.request('android.permission.RECORD_AUDIO');
  }

  /**
   * Request contacts permissions
   */
  async requestContacts(writeAccess: boolean = false): Promise<PermissionsResult> {
    const permissions: AndroidPermission[] = ['android.permission.READ_CONTACTS'];

    if (writeAccess) {
      permissions.push('android.permission.WRITE_CONTACTS');
    }

    return this.requestMultiple(permissions);
  }

  /**
   * Request phone call permission
   */
  async requestPhoneCall(): Promise<PermissionStatus> {
    return this.request('android.permission.CALL_PHONE');
  }

  /**
   * Request SMS permissions
   */
  async requestSms(sendAccess: boolean = false): Promise<PermissionsResult> {
    const permissions: AndroidPermission[] = ['android.permission.RECEIVE_SMS'];

    if (sendAccess) {
      permissions.push('android.permission.SEND_SMS');
    }

    return this.requestMultiple(permissions);
  }

  /**
   * Request calendar permissions
   */
  async requestCalendar(writeAccess: boolean = false): Promise<PermissionsResult> {
    const permissions: AndroidPermission[] = ['android.permission.READ_CALENDAR'];

    if (writeAccess) {
      permissions.push('android.permission.WRITE_CALENDAR');
    }

    return this.requestMultiple(permissions);
  }

  /**
   * Check if all specified permissions are granted
   */
  async allGranted(permissions: AndroidPermission[]): Promise<boolean> {
    const results = await this.checkMultiple(permissions);
    return Object.values(results).every((status) => status === 'granted');
  }
}
