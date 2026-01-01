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
import { PressEvent, LayoutEvent } from '../../types/event.types';
import { AccessibilityProps, HitSlop } from '../../types/native.types';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService, ViewProps } from '../../core/bridge/bridge.service';

/**
 * TouchableOpacity Component
 *
 * A wrapper for making views respond properly to touches.
 * On press, the opacity of the wrapped view is decreased, providing feedback.
 *
 * @example
 * ```html
 * <android-touchable
 *   [activeOpacity]="0.7"
 *   (press)="onPress()">
 *   <android-view [style]="buttonStyle">
 *     <android-text>Press Me</android-text>
 *   </android-view>
 * </android-touchable>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.view.ViewGroup',
  hasChildren: true,
  events: ['press', 'pressIn', 'pressOut', 'longPress'],
})
@Component({
  selector: 'android-touchable',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TouchableComponent implements OnInit, OnDestroy, OnChanges {
  private viewId: string | null = null;

  // Style
  @Input() style?: ViewStyle;

  // Touch feedback
  @Input() activeOpacity?: number;
  @Input() underlayColor?: string;
  @Input() delayPressIn?: number;
  @Input() delayPressOut?: number;
  @Input() delayLongPress?: number;
  @Input() pressRetentionOffset?: { top: number; left: number; bottom: number; right: number };
  @Input() hitSlop?: HitSlop | number;

  // State
  @Input() disabled?: boolean;

  // Android ripple effect
  @Input() background?: {
    type: 'ThemeAttrAndroid' | 'RippleAndroid';
    color?: string;
    borderless?: boolean;
    radius?: number;
  };

  // TV focus
  @Input() hasTVPreferredFocus?: boolean;
  @Input() nextFocusDown?: number;
  @Input() nextFocusForward?: number;
  @Input() nextFocusLeft?: number;
  @Input() nextFocusRight?: number;
  @Input() nextFocusUp?: number;
  @Input() tvParallaxProperties?: object;

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;
  @Input() accessibilityHint?: string;
  @Input() accessibilityRole?: AccessibilityProps['accessibilityRole'];
  @Input() accessibilityState?: AccessibilityProps['accessibilityState'];

  // Test
  @Input() testID?: string;
  @Input() nativeID?: string;

  // Sound
  @Input() touchSoundDisabled?: boolean;

  // Events
  @Output() press = new EventEmitter<PressEvent>();
  @Output() pressIn = new EventEmitter<PressEvent>();
  @Output() pressOut = new EventEmitter<PressEvent>();
  @Output() longPress = new EventEmitter<PressEvent>();
  @Output() layout = new EventEmitter<LayoutEvent>();
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    this.viewId = await this.bridgeService.createView('TouchableOpacity', this.getProps());
    this.registerEventListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewId) return;

    const props: ViewProps = {};

    for (const [key, change] of Object.entries(changes)) {
      if (!change.firstChange) {
        props[key] = change.currentValue;
      }
    }

    if (Object.keys(props).length > 0) {
      void this.bridgeService.updateView(this.viewId, props);
    }
  }

  ngOnDestroy(): void {
    if (this.viewId) {
      void this.bridgeService.removeView(this.viewId);
    }
  }

  private getProps(): ViewProps {
    return {
      style: this.style,
      activeOpacity: this.activeOpacity ?? 0.2,
      underlayColor: this.underlayColor,
      delayPressIn: this.delayPressIn ?? 0,
      delayPressOut: this.delayPressOut ?? 100,
      delayLongPress: this.delayLongPress ?? 500,
      pressRetentionOffset: this.pressRetentionOffset ?? { top: 20, left: 20, bottom: 30, right: 20 },
      hitSlop: this.hitSlop,
      disabled: this.disabled ?? false,
      background: this.background,
      accessible: this.accessible ?? true,
      accessibilityLabel: this.accessibilityLabel,
      accessibilityHint: this.accessibilityHint,
      accessibilityRole: this.accessibilityRole ?? 'button',
      accessibilityState: {
        ...this.accessibilityState,
        disabled: this.disabled,
      },
      testID: this.testID,
      nativeID: this.nativeID,
      touchSoundDisabled: this.touchSoundDisabled,
    };
  }

  private registerEventListeners(): void {
    if (!this.viewId) return;

    this.bridgeService.on<PressEvent>('press').subscribe((event) => {
      if (event.target === this.viewId && !this.disabled) {
        this.press.emit(event);
      }
    });

    this.bridgeService.on<PressEvent>('pressIn').subscribe((event) => {
      if (event.target === this.viewId && !this.disabled) {
        this.pressIn.emit(event);
      }
    });

    this.bridgeService.on<PressEvent>('pressOut').subscribe((event) => {
      if (event.target === this.viewId) {
        this.pressOut.emit(event);
      }
    });

    this.bridgeService.on<PressEvent>('longPress').subscribe((event) => {
      if (event.target === this.viewId && !this.disabled) {
        this.longPress.emit(event);
      }
    });
  }

  getViewId(): string | null {
    return this.viewId;
  }
}

/**
 * TouchableHighlight Component - alternative touchable with highlight effect
 */
@Component({
  selector: 'android-touchable-highlight',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TouchableHighlightComponent extends TouchableComponent {
  @Input() override underlayColor?: string = '#000000';
  @Input() override activeOpacity?: number = 0.85;
}

/**
 * TouchableWithoutFeedback Component - touchable with no visual feedback
 */
@Component({
  selector: 'android-touchable-no-feedback',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TouchableWithoutFeedbackComponent extends TouchableComponent {
  @Input() override activeOpacity?: number = 1;
}
