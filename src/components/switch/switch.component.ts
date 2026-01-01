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
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ViewStyle } from '../../types/style.types';
import { SwitchChangeEvent } from '../../types/event.types';
import { AccessibilityProps } from '../../types/native.types';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService } from '../../core/bridge/bridge.service';

/**
 * Switch Component
 *
 * A toggle switch component. Maps to Android's Switch widget.
 * Supports Angular forms integration with ControlValueAccessor.
 *
 * @example
 * ```html
 * <android-switch
 *   [(ngModel)]="isEnabled"
 *   thumbColor="#2196F3"
 *   trackColor="#E0E0E0"
 *   (valueChange)="onToggle($event)">
 * </android-switch>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.widget.Switch',
  hasChildren: false,
  events: ['valueChange'],
})
@Component({
  selector: 'android-switch',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
})
export class SwitchComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  private viewId: string | null = null;
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  // Value
  @Input() value?: boolean;

  // Colors
  @Input() thumbColor?: string;
  @Input() trackColor?: string | { false: string; true: string };
  @Input() thumbTintColor?: string;
  @Input() onTintColor?: string;

  // State
  @Input() disabled?: boolean;

  // Style
  @Input() style?: ViewStyle;

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;
  @Input() accessibilityHint?: string;
  @Input() accessibilityRole?: AccessibilityProps['accessibilityRole'];
  @Input() accessibilityState?: AccessibilityProps['accessibilityState'];

  // Test
  @Input() testID?: string;
  @Input() nativeID?: string;

  // Events
  @Output() valueChange = new EventEmitter<boolean>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    this.viewId = await this.bridgeService.createView('Switch', this.getProps());
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

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.value = value;
    if (this.viewId) {
      this.bridgeService.updateView(this.viewId, { value });
    }
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.viewId) {
      this.bridgeService.updateView(this.viewId, { disabled: isDisabled });
    }
  }

  private getProps(): Record<string, any> {
    return {
      value: this.value ?? false,
      thumbColor: this.thumbColor || this.thumbTintColor,
      trackColor: this.normalizeTrackColor(),
      onTintColor: this.onTintColor,
      disabled: this.disabled ?? false,
      style: this.style,
      accessible: this.accessible ?? true,
      accessibilityLabel: this.accessibilityLabel,
      accessibilityHint: this.accessibilityHint,
      accessibilityRole: this.accessibilityRole ?? 'switch',
      accessibilityState: {
        ...this.accessibilityState,
        disabled: this.disabled,
        checked: this.value,
      },
      testID: this.testID,
      nativeID: this.nativeID,
    };
  }

  private normalizeTrackColor(): { false: string; true: string } | undefined {
    if (!this.trackColor) return undefined;

    if (typeof this.trackColor === 'string') {
      return { false: this.trackColor, true: this.onTintColor || this.trackColor };
    }

    return this.trackColor;
  }

  private registerEventListeners(): void {
    if (!this.viewId) return;

    this.bridgeService.on<SwitchChangeEvent>('valueChange').subscribe((event) => {
      if (event.target === this.viewId) {
        const newValue = event.nativeEvent.value;
        this.value = newValue;
        this.onChange(newValue);
        this.onTouched();
        this.valueChange.emit(newValue);
      }
    });
  }

  /**
   * Toggle the switch value
   */
  toggle(): void {
    if (!this.disabled) {
      const newValue = !this.value;
      this.writeValue(newValue);
      this.onChange(newValue);
      this.valueChange.emit(newValue);
    }
  }

  getViewId(): string | null {
    return this.viewId;
  }
}
