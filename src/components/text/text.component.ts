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
import { TextStyle } from '../../types/style.types';
import { PressEvent, LayoutEvent } from '../../types/event.types';
import { AccessibilityProps } from '../../types/native.types';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService } from '../../core/bridge/bridge.service';

/**
 * Text Component
 *
 * A component for displaying text. Maps to Android's TextView.
 * Supports nested text with different styles.
 *
 * @example
 * ```html
 * <android-text [style]="textStyle">
 *   Hello <android-text [style]="boldStyle">World</android-text>!
 * </android-text>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.widget.TextView',
  hasChildren: true,
  events: ['press', 'longPress'],
  propMapping: {
    text: 'android:text',
    numberOfLines: 'android:maxLines',
    selectable: 'android:textIsSelectable',
  },
})
@Component({
  selector: 'android-text',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TextComponent implements OnInit, OnDestroy, OnChanges {
  private viewId: string | null = null;

  // Content
  @Input() text?: string;

  // Style
  @Input() style?: TextStyle;

  // Text-specific props
  @Input() numberOfLines?: number;
  @Input() ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  @Input() selectable?: boolean;
  @Input() selectionColor?: string;
  @Input() adjustsFontSizeToFit?: boolean;
  @Input() minimumFontScale?: number;
  @Input() allowFontScaling?: boolean;
  @Input() maxFontSizeMultiplier?: number;
  @Input() suppressHighlighting?: boolean;
  @Input() disabled?: boolean;
  @Input() dataDetectorType?: 'phoneNumber' | 'link' | 'email' | 'none' | 'all';

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;
  @Input() accessibilityHint?: string;
  @Input() accessibilityRole?: AccessibilityProps['accessibilityRole'];

  // Test
  @Input() testID?: string;
  @Input() nativeID?: string;

  // Events
  @Output() press = new EventEmitter<PressEvent>();
  @Output() longPress = new EventEmitter<PressEvent>();
  @Output() layout = new EventEmitter<LayoutEvent>();
  @Output() textLayout = new EventEmitter<{
    lines: Array<{
      text: string;
      x: number;
      y: number;
      width: number;
      height: number;
      ascender: number;
      descender: number;
    }>;
  }>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    this.viewId = await this.bridgeService.createView('Text', this.getProps());
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
      text: this.text,
      style: this.style,
      numberOfLines: this.numberOfLines,
      ellipsizeMode: this.ellipsizeMode,
      selectable: this.selectable,
      selectionColor: this.selectionColor,
      adjustsFontSizeToFit: this.adjustsFontSizeToFit,
      minimumFontScale: this.minimumFontScale,
      allowFontScaling: this.allowFontScaling ?? true,
      maxFontSizeMultiplier: this.maxFontSizeMultiplier,
      suppressHighlighting: this.suppressHighlighting,
      disabled: this.disabled,
      dataDetectorType: this.dataDetectorType,
      accessible: this.accessible ?? true,
      accessibilityLabel: this.accessibilityLabel,
      accessibilityHint: this.accessibilityHint,
      accessibilityRole: this.accessibilityRole ?? 'text',
      testID: this.testID,
      nativeID: this.nativeID,
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
  }

  getViewId(): string | null {
    return this.viewId;
  }
}
