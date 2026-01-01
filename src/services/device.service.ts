import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BridgeService } from '../core/bridge/bridge.service';
import { Dimensions, EdgeInsets, NetworkInfo, KeyboardInfo } from '../types/native.types';

/**
 * Device orientation
 */
export type DeviceOrientation = 'portrait' | 'landscape';

/**
 * Device appearance (color scheme)
 */
export type ColorScheme = 'light' | 'dark';

/**
 * Device info
 */
export interface DeviceInfo {
  brand: string;
  model: string;
  deviceId: string;
  systemName: string;
  systemVersion: string;
  apiLevel: number;
  isEmulator: boolean;
  isTablet: boolean;
}

/**
 * Device Service
 *
 * Provides access to device information, dimensions,
 * and system events like orientation changes.
 */
@Injectable()
export class DeviceService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private readonly dimensions$ = new BehaviorSubject<Dimensions>({
    window: { width: 0, height: 0, scale: 1, fontScale: 1 },
    screen: { width: 0, height: 0, scale: 1, fontScale: 1 },
  });

  private readonly orientation$ = new BehaviorSubject<DeviceOrientation>('portrait');
  private readonly colorScheme$ = new BehaviorSubject<ColorScheme>('light');
  private readonly safeAreaInsets$ = new BehaviorSubject<EdgeInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  private readonly networkInfo$ = new BehaviorSubject<NetworkInfo>({
    type: 'unknown',
    isConnected: true,
    isInternetReachable: true,
    details: {},
  });
  private readonly keyboardInfo$ = new BehaviorSubject<KeyboardInfo>({
    height: 0,
    duration: 0,
    easing: 'keyboard',
    isVisible: false,
  });

  private deviceInfo: DeviceInfo | null = null;

  constructor(private readonly bridgeService: BridgeService) {
    this.initialize();
  }

  /**
   * Get window dimensions
   */
  get windowDimensions$(): Observable<Dimensions['window']> {
    return new Observable((observer) => {
      this.dimensions$.pipe(takeUntil(this.destroy$)).subscribe((dims) => {
        observer.next(dims.window);
      });
    });
  }

  /**
   * Get screen dimensions
   */
  get screenDimensions$(): Observable<Dimensions['screen']> {
    return new Observable((observer) => {
      this.dimensions$.pipe(takeUntil(this.destroy$)).subscribe((dims) => {
        observer.next(dims.screen);
      });
    });
  }

  /**
   * Get current dimensions synchronously
   */
  get dimensions(): Dimensions {
    return this.dimensions$.value;
  }

  /**
   * Get device orientation
   */
  get orientation$Observable(): Observable<DeviceOrientation> {
    return this.orientation$.asObservable();
  }

  /**
   * Get current orientation
   */
  get orientation(): DeviceOrientation {
    return this.orientation$.value;
  }

  /**
   * Get color scheme (light/dark mode)
   */
  get colorScheme$Observable(): Observable<ColorScheme> {
    return this.colorScheme$.asObservable();
  }

  /**
   * Get current color scheme
   */
  get colorScheme(): ColorScheme {
    return this.colorScheme$.value;
  }

  /**
   * Get safe area insets
   */
  get safeAreaInsets$Observable(): Observable<EdgeInsets> {
    return this.safeAreaInsets$.asObservable();
  }

  /**
   * Get current safe area insets
   */
  get safeAreaInsets(): EdgeInsets {
    return this.safeAreaInsets$.value;
  }

  /**
   * Get network info
   */
  get networkInfo$Observable(): Observable<NetworkInfo> {
    return this.networkInfo$.asObservable();
  }

  /**
   * Get current network info
   */
  get networkInfo(): NetworkInfo {
    return this.networkInfo$.value;
  }

  /**
   * Check if device is connected to the internet
   */
  get isConnected(): boolean {
    return this.networkInfo$.value.isConnected;
  }

  /**
   * Get keyboard info
   */
  get keyboardInfo$Observable(): Observable<KeyboardInfo> {
    return this.keyboardInfo$.asObservable();
  }

  /**
   * Check if keyboard is visible
   */
  get isKeyboardVisible(): boolean {
    return this.keyboardInfo$.value.isVisible;
  }

  /**
   * Get device info
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    if (this.deviceInfo) {
      return this.deviceInfo;
    }

    this.deviceInfo = await this.bridgeService.request<DeviceInfo>('getDeviceInfo', {});
    return this.deviceInfo;
  }

  /**
   * Check if device is a tablet
   */
  async isTablet(): Promise<boolean> {
    const info = await this.getDeviceInfo();
    return info.isTablet;
  }

  /**
   * Get Android API level
   */
  async getApiLevel(): Promise<number> {
    const info = await this.getDeviceInfo();
    return info.apiLevel;
  }

  /**
   * Get pixel ratio
   */
  getPixelRatio(): number {
    return this.dimensions$.value.window.scale;
  }

  /**
   * Get font scale
   */
  getFontScale(): number {
    return this.dimensions$.value.window.fontScale;
  }

  /**
   * Vibrate the device
   */
  async vibrate(pattern?: number | number[]): Promise<void> {
    await this.bridgeService.send('vibrate', {
      pattern: Array.isArray(pattern) ? pattern : [pattern || 400],
    });
  }

  /**
   * Get battery info
   */
  async getBatteryInfo(): Promise<{ level: number; isCharging: boolean }> {
    return this.bridgeService.request('getBatteryInfo', {});
  }

  /**
   * Get unique device ID
   */
  async getUniqueId(): Promise<string> {
    const info = await this.getDeviceInfo();
    return info.deviceId;
  }

  /**
   * Check if the app is running in an emulator
   */
  async isEmulator(): Promise<boolean> {
    const info = await this.getDeviceInfo();
    return info.isEmulator;
  }

  /**
   * Initialize device service
   */
  private async initialize(): Promise<void> {
    // Get initial dimensions
    try {
      const dims = await this.bridgeService.request<Dimensions>('getDimensions', {});
      this.dimensions$.next(dims);
      this.updateOrientation(dims.window.width, dims.window.height);
    } catch (error) {
      console.warn('[DeviceService] Failed to get initial dimensions');
    }

    // Listen for dimension changes
    this.bridgeService
      .on<Dimensions>('dimensionsChange')
      .pipe(takeUntil(this.destroy$))
      .subscribe((dims) => {
        this.dimensions$.next(dims);
        this.updateOrientation(dims.window.width, dims.window.height);
      });

    // Listen for color scheme changes
    this.bridgeService
      .on<{ colorScheme: ColorScheme }>('colorSchemeChange')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.colorScheme$.next(data.colorScheme);
      });

    // Listen for safe area changes
    this.bridgeService
      .on<EdgeInsets>('safeAreaInsetsChange')
      .pipe(takeUntil(this.destroy$))
      .subscribe((insets) => {
        this.safeAreaInsets$.next(insets);
      });

    // Listen for network changes
    this.bridgeService
      .on<NetworkInfo>('networkChange')
      .pipe(takeUntil(this.destroy$))
      .subscribe((info) => {
        this.networkInfo$.next(info);
      });

    // Listen for keyboard events
    this.bridgeService
      .on<KeyboardInfo>('keyboardDidShow')
      .pipe(takeUntil(this.destroy$))
      .subscribe((info) => {
        this.keyboardInfo$.next({ ...info, isVisible: true });
      });

    this.bridgeService
      .on<KeyboardInfo>('keyboardDidHide')
      .pipe(takeUntil(this.destroy$))
      .subscribe((info) => {
        this.keyboardInfo$.next({ ...info, isVisible: false });
      });
  }

  /**
   * Update orientation based on dimensions
   */
  private updateOrientation(width: number, height: number): void {
    const orientation: DeviceOrientation = width > height ? 'landscape' : 'portrait';
    if (orientation !== this.orientation$.value) {
      this.orientation$.next(orientation);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
