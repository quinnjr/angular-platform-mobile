import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { StatusBarStyle, StatusBarAnimation } from '../../types/native.types';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService } from '../../core/bridge/bridge.service';

/**
 * StatusBar Component
 *
 * Controls the appearance of the Android status bar.
 * Use this component to customize the status bar color, style, and visibility.
 *
 * @example
 * ```html
 * <!-- Light content on dark background -->
 * <android-status-bar
 *   barStyle="light-content"
 *   backgroundColor="#1976D2"
 *   [translucent]="false">
 * </android-status-bar>
 * ```
 *
 * @example
 * ```html
 * <!-- Translucent status bar for immersive experience -->
 * <android-status-bar
 *   [translucent]="true"
 *   [hidden]="isFullscreen">
 * </android-status-bar>
 * ```
 */
@NativeComponent({
  nativeViewClass: '',
  hasChildren: false,
  events: [],
})
@Component({
  selector: 'android-status-bar',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class StatusBarComponent implements OnInit, OnDestroy, OnChanges {
  // Visibility
  @Input() hidden?: boolean;
  @Input() animated?: boolean;
  @Input() showHideTransition?: StatusBarAnimation;

  // Style
  @Input() barStyle?: StatusBarStyle;
  @Input() backgroundColor?: string;
  @Input() translucent?: boolean;

  // Network activity indicator (usually not visible on Android)
  @Input() networkActivityIndicatorVisible?: boolean;

  constructor(private readonly bridgeService: BridgeService) {}

  ngOnInit(): void {
    this.applyStatusBarSettings();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only apply after initialization
    if (Object.keys(changes).some((key) => !changes[key].firstChange)) {
      this.applyStatusBarSettings();
    }
  }

  ngOnDestroy(): void {
    // Optionally reset status bar to defaults
  }

  private applyStatusBarSettings(): void {
    // Set visibility
    if (this.hidden !== undefined) {
      this.setHidden(this.hidden, this.animated);
    }

    // Set bar style
    if (this.barStyle) {
      this.setBarStyle(this.barStyle, this.animated);
    }

    // Set background color
    if (this.backgroundColor) {
      this.setBackgroundColor(this.backgroundColor, this.animated);
    }

    // Set translucent
    if (this.translucent !== undefined) {
      this.setTranslucent(this.translucent);
    }
  }

  /**
   * Set status bar visibility
   */
  private setHidden(hidden: boolean, animated?: boolean): void {
    void this.bridgeService.send('setStatusBarHidden', {
      hidden,
      animation: animated ? (this.showHideTransition ?? 'fade') : 'none',
    });
  }

  /**
   * Set status bar style
   */
  private setBarStyle(style: StatusBarStyle, animated?: boolean): void {
    void this.bridgeService.send('setStatusBarStyle', {
      style,
      animated: animated ?? false,
    });
  }

  /**
   * Set status bar background color
   */
  private setBackgroundColor(color: string, animated?: boolean): void {
    void this.bridgeService.send('setStatusBarBackgroundColor', {
      color,
      animated: animated ?? false,
    });
  }

  /**
   * Set status bar translucent
   */
  private setTranslucent(translucent: boolean): void {
    void this.bridgeService.send('setStatusBarTranslucent', {
      translucent,
    });
  }

  /**
   * Static methods for imperative control
   */

  /**
   * Show the status bar
   */
  static show(bridgeService: BridgeService, animation?: StatusBarAnimation): void {
    void bridgeService.send('setStatusBarHidden', {
      hidden: false,
      animation: animation ?? 'fade',
    });
  }

  /**
   * Hide the status bar
   */
  static hide(bridgeService: BridgeService, animation?: StatusBarAnimation): void {
    void bridgeService.send('setStatusBarHidden', {
      hidden: true,
      animation: animation ?? 'fade',
    });
  }

  /**
   * Set the status bar style
   */
  static setStyle(bridgeService: BridgeService, style: StatusBarStyle): void {
    void bridgeService.send('setStatusBarStyle', { style });
  }

  /**
   * Set the status bar background color
   */
  static setColor(bridgeService: BridgeService, color: string): void {
    void bridgeService.send('setStatusBarBackgroundColor', { color });
  }

  /**
   * Push a new status bar configuration onto the stack
   */
  static pushStackEntry(
    bridgeService: BridgeService,
    props: { barStyle?: StatusBarStyle; backgroundColor?: string; hidden?: boolean }
  ): string {
    const entryId = `statusbar_${Date.now()}`;
    void bridgeService.send('pushStatusBarStackEntry', { id: entryId, props });
    return entryId;
  }

  /**
   * Pop a status bar configuration from the stack
   */
  static popStackEntry(bridgeService: BridgeService, entryId: string): void {
    void bridgeService.send('popStatusBarStackEntry', { id: entryId });
  }

  /**
   * Replace a status bar stack entry
   */
  static replaceStackEntry(
    bridgeService: BridgeService,
    entryId: string,
    props: { barStyle?: StatusBarStyle; backgroundColor?: string; hidden?: boolean }
  ): void {
    void bridgeService.send('replaceStatusBarStackEntry', { id: entryId, props });
  }

  /**
   * Get current status bar height
   */
  static async getHeight(bridgeService: BridgeService): Promise<number> {
    try {
      const result = await bridgeService.request<{ height: number }>('getStatusBarHeight', {});
      return result.height;
    } catch {
      return 24; // Default Android status bar height in dp
    }
  }
}
