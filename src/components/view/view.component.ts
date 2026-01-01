import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ViewStyle } from '../../types/style.types';
import { LayoutEvent, PressEvent } from '../../types/event.types';
import { AccessibilityProps, HitSlop, PointerEvents } from '../../types/native.types';
import { NativeComponent } from '../../decorators/native-component';
import { NativeProp } from '../../decorators/native-prop';
import { BridgeService } from '../../core/bridge/bridge.service';

/**
 * View Component
 *
 * The fundamental container component for building UI.
 * Similar to React Native's View, this maps to Android's ViewGroup.
 *
 * @example
 * ```html
 * <android-view [style]="containerStyle" (press)="onPress()">
 *   <android-text>Hello World</android-text>
 * </android-view>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.view.ViewGroup',
  hasChildren: true,
  events: ['press', 'longPress', 'layout'],
})
@Component({
  selector: 'android-view',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ViewComponent implements OnInit, OnDestroy, OnChanges, AccessibilityProps {
  private viewId: string | null = null;

  // Style
  @NativeProp()
  @Input()
  style?: ViewStyle;

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;
  @Input() accessibilityHint?: string;
  @Input() accessibilityRole?: AccessibilityProps['accessibilityRole'];
  @Input() accessibilityState?: AccessibilityProps['accessibilityState'];
  @Input() accessibilityValue?: AccessibilityProps['accessibilityValue'];
  @Input() accessibilityActions?: AccessibilityProps['accessibilityActions'];
  @Input() accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  @Input() importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';

  // Touch & Interaction
  @Input() pointerEvents?: PointerEvents;
  @Input() hitSlop?: HitSlop | number;
  @Input() focusable?: boolean;
  @Input() nativeID?: string;
  @Input() testID?: string;

  // Performance
  @Input() removeClippedSubviews?: boolean;
  @Input() collapsable?: boolean;
  @Input() renderToHardwareTextureAndroid?: boolean;
  @Input() needsOffscreenAlphaCompositing?: boolean;

  // Events
  @Output() press = new EventEmitter<PressEvent>();
  @Output() longPress = new EventEmitter<PressEvent>();
  @Output() pressIn = new EventEmitter<PressEvent>();
  @Output() pressOut = new EventEmitter<PressEvent>();
  @Output() layout = new EventEmitter<LayoutEvent>();
  @Output() accessibilityAction = new EventEmitter<{ actionName: string }>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    // Create native view
    this.viewId = await this.bridgeService.createView('View', this.getProps());

    // Register event listeners
    this.registerEventListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewId) return;

    const props: Record<string, any> = {};

    for (const [key, change] of Object.entries(changes)) {
      if (!change.firstChange) {
        props[key] = change.currentValue;
      }
    }

    if (Object.keys(props).length > 0) {
      this.bridgeService.updateView(this.viewId, props);
    }
  }

  ngOnDestroy(): void {
    if (this.viewId) {
      this.bridgeService.removeView(this.viewId);
    }
  }

  private getProps(): Record<string, any> {
    return {
      style: this.style,
      accessible: this.accessible,
      accessibilityLabel: this.accessibilityLabel,
      accessibilityHint: this.accessibilityHint,
      accessibilityRole: this.accessibilityRole,
      accessibilityState: this.accessibilityState,
      accessibilityValue: this.accessibilityValue,
      pointerEvents: this.pointerEvents,
      hitSlop: this.hitSlop,
      focusable: this.focusable,
      nativeID: this.nativeID,
      testID: this.testID,
      removeClippedSubviews: this.removeClippedSubviews,
      collapsable: this.collapsable,
      renderToHardwareTextureAndroid: this.renderToHardwareTextureAndroid,
    };
  }

  private registerEventListeners(): void {
    if (!this.viewId) return;

    this.bridgeService.on<PressEvent>('press').subscribe((event) => {
      if (event.target === this.viewId) {
        this.press.emit(event);
      }
    });

    this.bridgeService.on<PressEvent>('longPress').subscribe((event) => {
      if (event.target === this.viewId) {
        this.longPress.emit(event);
      }
    });

    this.bridgeService.on<LayoutEvent>('layout').subscribe((event) => {
      if (event.target === this.viewId) {
        this.layout.emit(event);
      }
    });
  }

  /**
   * Get the native view ID
   */
  getViewId(): string | null {
    return this.viewId;
  }

  /**
   * Measure the view layout
   */
  async measure(): Promise<{ x: number; y: number; width: number; height: number }> {
    if (!this.viewId) {
      throw new Error('View not initialized');
    }
    return this.bridgeService.measureView(this.viewId);
  }

  /**
   * Set native focus on this view
   */
  async focus(): Promise<void> {
    if (this.viewId) {
      await this.bridgeService.send('focus', { viewId: this.viewId });
    }
  }

  /**
   * Remove focus from this view
   */
  async blur(): Promise<void> {
    if (this.viewId) {
      await this.bridgeService.send('blur', { viewId: this.viewId });
    }
  }
}
