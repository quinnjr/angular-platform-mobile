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
import { ViewStyle, TextStyle } from '../../types/style.types';
import { PressEvent } from '../../types/event.types';
import { AccessibilityProps } from '../../types/native.types';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService, ViewProps } from '../../core/bridge/bridge.service';

/**
 * Button Component
 *
 * A basic button component. Maps to Android's Button widget.
 * For more customization, consider using TouchableOpacity with custom styling.
 *
 * @example
 * ```html
 * <android-button
 *   title="Press Me"
 *   color="#2196F3"
 *   (press)="onPress()">
 * </android-button>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.widget.Button',
  hasChildren: false,
  events: ['press'],
  propMapping: {
    title: 'android:text',
    color: 'android:textColor',
  },
})
@Component({
  selector: 'android-button',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ButtonComponent implements OnInit, OnDestroy, OnChanges {
  private viewId: string | null = null;

  // Content
  @Input() title!: string;
  @Input() color?: string;

  // Style
  @Input() style?: ViewStyle;
  @Input() titleStyle?: TextStyle;

  // State
  @Input() disabled?: boolean;
  @Input() loading?: boolean;

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;
  @Input() accessibilityHint?: string;
  @Input() accessibilityRole?: AccessibilityProps['accessibilityRole'];
  @Input() accessibilityState?: AccessibilityProps['accessibilityState'];

  // Test
  @Input() testID?: string;
  @Input() nativeID?: string;

  // Touch feedback
  @Input() touchSoundDisabled?: boolean;
  @Input() hasTVPreferredFocus?: boolean;
  @Input() nextFocusDown?: number;
  @Input() nextFocusForward?: number;
  @Input() nextFocusLeft?: number;
  @Input() nextFocusRight?: number;
  @Input() nextFocusUp?: number;

  // Events
  @Output() press = new EventEmitter<PressEvent>();
  @Output() pressIn = new EventEmitter<PressEvent>();
  @Output() pressOut = new EventEmitter<PressEvent>();
  @Output() longPress = new EventEmitter<PressEvent>();
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    this.viewId = await this.bridgeService.createView('Button', this.getProps());
    this.registerEventListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewId) return;

    const props: ViewProps = {};

    for (const [key, change] of Object.entries(changes)) {
      if (!change.firstChange) {
        props[key] = change.currentValue as unknown;
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
      title: this.title,
      color: this.color,
      style: this.style,
      titleStyle: this.titleStyle,
      disabled: this.disabled ?? false,
      loading: this.loading ?? false,
      accessible: this.accessible ?? true,
      accessibilityLabel: this.accessibilityLabel ?? this.title,
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

    this.bridgeService.on<void>('focus').subscribe(() => {
      this.focus.emit();
    });

    this.bridgeService.on<void>('blur').subscribe(() => {
      this.blur.emit();
    });
  }

  getViewId(): string | null {
    return this.viewId;
  }
}
