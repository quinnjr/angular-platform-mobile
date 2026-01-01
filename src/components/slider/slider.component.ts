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
import { SliderChangeEvent } from '../../types/event.types';
import { AccessibilityProps } from '../../types/native.types';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService } from '../../core/bridge/bridge.service';

/**
 * Slider Component
 *
 * A slider component for selecting a value from a range.
 * Maps to Android's SeekBar widget.
 *
 * @example
 * ```html
 * <android-slider
 *   [(ngModel)]="volume"
 *   [minimumValue]="0"
 *   [maximumValue]="100"
 *   [step]="1"
 *   minimumTrackTintColor="#2196F3"
 *   maximumTrackTintColor="#E0E0E0"
 *   (valueChange)="onVolumeChange($event)">
 * </android-slider>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.widget.SeekBar',
  hasChildren: false,
  events: ['valueChange', 'slidingStart', 'slidingComplete'],
})
@Component({
  selector: 'android-slider',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true,
    },
  ],
})
export class SliderComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  private viewId: string | null = null;
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  // Value
  @Input() value?: number;

  // Range
  @Input() minimumValue?: number;
  @Input() maximumValue?: number;
  @Input() step?: number;

  // Colors
  @Input() minimumTrackTintColor?: string;
  @Input() maximumTrackTintColor?: string;
  @Input() thumbTintColor?: string;

  // Thumb image
  @Input() thumbImage?: { uri: string } | number;

  // State
  @Input() disabled?: boolean;
  @Input() inverted?: boolean;

  // Style
  @Input() style?: ViewStyle;

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;
  @Input() accessibilityHint?: string;
  @Input() accessibilityRole?: AccessibilityProps['accessibilityRole'];
  @Input() accessibilityValue?: AccessibilityProps['accessibilityValue'];

  // Test
  @Input() testID?: string;
  @Input() nativeID?: string;

  // Events
  @Output() valueChange = new EventEmitter<number>();
  @Output() slidingStart = new EventEmitter<number>();
  @Output() slidingComplete = new EventEmitter<number>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    this.viewId = await this.bridgeService.createView('Slider', this.getProps());
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
  writeValue(value: number): void {
    this.value = value;
    if (this.viewId) {
      this.bridgeService.updateView(this.viewId, { value });
    }
  }

  registerOnChange(fn: (value: number) => void): void {
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
    const minValue = this.minimumValue ?? 0;
    const maxValue = this.maximumValue ?? 1;

    return {
      value: this.value ?? minValue,
      minimumValue: minValue,
      maximumValue: maxValue,
      step: this.step ?? 0,
      minimumTrackTintColor: this.minimumTrackTintColor,
      maximumTrackTintColor: this.maximumTrackTintColor,
      thumbTintColor: this.thumbTintColor,
      thumbImage: this.thumbImage,
      disabled: this.disabled ?? false,
      inverted: this.inverted ?? false,
      style: this.style,
      accessible: this.accessible ?? true,
      accessibilityLabel: this.accessibilityLabel,
      accessibilityHint: this.accessibilityHint,
      accessibilityRole: this.accessibilityRole ?? 'adjustable',
      accessibilityValue: {
        min: minValue,
        max: maxValue,
        now: this.value ?? minValue,
        ...this.accessibilityValue,
      },
      testID: this.testID,
      nativeID: this.nativeID,
    };
  }

  private registerEventListeners(): void {
    if (!this.viewId) return;

    this.bridgeService.on<SliderChangeEvent>('valueChange').subscribe((event) => {
      if (event.target === this.viewId) {
        const newValue = this.applyStep(event.nativeEvent.value);
        this.value = newValue;
        this.onChange(newValue);
        this.valueChange.emit(newValue);
      }
    });

    this.bridgeService.on<{ value: number; target?: string }>('slidingStart').subscribe((event) => {
      if (event.target === this.viewId) {
        this.slidingStart.emit(event.value);
      }
    });

    this.bridgeService.on<{ value: number; target?: string }>('slidingComplete').subscribe((event) => {
      if (event.target === this.viewId) {
        this.onTouched();
        this.slidingComplete.emit(event.value);
      }
    });
  }

  /**
   * Apply step to value
   */
  private applyStep(value: number): number {
    if (!this.step || this.step === 0) return value;

    const min = this.minimumValue ?? 0;
    const max = this.maximumValue ?? 1;
    const steps = Math.round((value - min) / this.step);
    const steppedValue = min + steps * this.step;

    return Math.max(min, Math.min(max, steppedValue));
  }

  getViewId(): string | null {
    return this.viewId;
  }
}
