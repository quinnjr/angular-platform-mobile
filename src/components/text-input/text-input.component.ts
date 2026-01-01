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
import { TextStyle } from '../../types/style.types';
import { TextChangeEvent, SubmitEditingEvent, FocusEvent, BlurEvent, LayoutEvent } from '../../types/event.types';
import { AccessibilityProps } from '../../types/native.types';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService, ViewProps } from '../../core/bridge/bridge.service';

/**
 * Keyboard type options
 */
export type KeyboardType =
  | 'default'
  | 'email-address'
  | 'numeric'
  | 'phone-pad'
  | 'number-pad'
  | 'decimal-pad'
  | 'visible-password'
  | 'ascii-capable'
  | 'numbers-and-punctuation'
  | 'url'
  | 'name-phone-pad'
  | 'twitter'
  | 'web-search';

/**
 * Return key type options
 */
export type ReturnKeyType =
  | 'done'
  | 'go'
  | 'next'
  | 'search'
  | 'send'
  | 'none'
  | 'previous'
  | 'default'
  | 'emergency-call'
  | 'google'
  | 'join'
  | 'route'
  | 'yahoo';

/**
 * Auto capitalize options
 */
export type AutoCapitalize = 'none' | 'sentences' | 'words' | 'characters';

/**
 * TextInput Component
 *
 * A text input field. Maps to Android's EditText.
 * Supports Angular forms integration with ControlValueAccessor.
 *
 * @example
 * ```html
 * <android-text-input
 *   [(ngModel)]="username"
 *   placeholder="Enter username"
 *   keyboardType="email-address"
 *   (changeText)="onTextChange($event)"
 *   (submitEditing)="onSubmit()">
 * </android-text-input>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.widget.EditText',
  hasChildren: false,
  events: ['changeText', 'submitEditing', 'focus', 'blur', 'keyPress', 'selectionChange'],
  propMapping: {
    value: 'android:text',
    placeholder: 'android:hint',
    maxLength: 'android:maxLength',
  },
})
@Component({
  selector: 'android-text-input',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
  ],
})
export class TextInputComponent
  implements OnInit, OnDestroy, OnChanges, ControlValueAccessor
{
  private viewId: string | null = null;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // Value
  @Input() value?: string;
  @Input() defaultValue?: string;

  // Placeholder
  @Input() placeholder?: string;
  @Input() placeholderTextColor?: string;

  // Style
  @Input() style?: TextStyle;
  @Input() selectionColor?: string;
  @Input() underlineColorAndroid?: string;
  @Input() cursorColor?: string;

  // Keyboard
  @Input() keyboardType?: KeyboardType;
  @Input() returnKeyType?: ReturnKeyType;
  @Input() returnKeyLabel?: string;
  @Input() autoCapitalize?: AutoCapitalize;
  @Input() autoCorrect?: boolean;
  @Input() autoComplete?:
    | 'off'
    | 'username'
    | 'password'
    | 'email'
    | 'name'
    | 'tel'
    | 'street-address'
    | 'postal-code'
    | 'cc-number';

  // Behavior
  @Input() editable?: boolean;
  @Input() multiline?: boolean;
  @Input() numberOfLines?: number;
  @Input() maxLength?: number;
  @Input() secureTextEntry?: boolean;
  @Input() selectTextOnFocus?: boolean;
  @Input() blurOnSubmit?: boolean;
  @Input() caretHidden?: boolean;
  @Input() contextMenuHidden?: boolean;
  @Input() importantForAutofill?: 'auto' | 'no' | 'noExcludeDescendants' | 'yes' | 'yesExcludeDescendants';
  @Input() inlineImageLeft?: string;
  @Input() inlineImagePadding?: number;
  @Input() disableFullscreenUI?: boolean;

  // Selection
  @Input() selection?: { start: number; end?: number };

  // Scroll
  @Input() scrollEnabled?: boolean;

  // Text content type (Android autofill hints)
  @Input() textContentType?:
    | 'none'
    | 'URL'
    | 'addressCity'
    | 'addressCityAndState'
    | 'addressState'
    | 'countryName'
    | 'creditCardNumber'
    | 'emailAddress'
    | 'familyName'
    | 'fullStreetAddress'
    | 'givenName'
    | 'jobTitle'
    | 'location'
    | 'middleName'
    | 'name'
    | 'namePrefix'
    | 'nameSuffix'
    | 'nickname'
    | 'organizationName'
    | 'postalCode'
    | 'streetAddressLine1'
    | 'streetAddressLine2'
    | 'sublocality'
    | 'telephoneNumber'
    | 'username'
    | 'password'
    | 'newPassword'
    | 'oneTimeCode';

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;
  @Input() accessibilityHint?: string;
  @Input() accessibilityRole?: AccessibilityProps['accessibilityRole'];

  // Test
  @Input() testID?: string;
  @Input() nativeID?: string;

  // Font
  @Input() allowFontScaling?: boolean;
  @Input() maxFontSizeMultiplier?: number;

  // Focus
  @Input() autoFocus?: boolean;

  // Spell check
  @Input() spellCheck?: boolean;

  // Events
  @Output() changeText = new EventEmitter<string>();
  @Output() endEditing = new EventEmitter<TextChangeEvent>();
  @Output() submitEditing = new EventEmitter<SubmitEditingEvent>();
  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<BlurEvent>();
  @Output() keyPress = new EventEmitter<{ key: string }>();
  @Output() selectionChange = new EventEmitter<{ selection: { start: number; end: number } }>();
  @Output() contentSizeChange = new EventEmitter<{ contentSize: { width: number; height: number } }>();
  @Output() layout = new EventEmitter<LayoutEvent>();
  @Output() scroll = new EventEmitter<{ contentOffset: { x: number; y: number } }>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    this.viewId = await this.bridgeService.createView('TextInput', this.getProps());
    this.registerEventListeners();

    if (this.autoFocus) {
      setTimeout(() => this.setFocus(), 0);
    }
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
      this.bridgeService.removeView(this.viewId);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value;
    if (this.viewId) {
      this.bridgeService.updateView(this.viewId, { value });
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.editable = !isDisabled;
    if (this.viewId) {
      this.bridgeService.updateView(this.viewId, { editable: !isDisabled });
    }
  }

  private getProps(): ViewProps {
    return {
      value: this.value ?? this.defaultValue ?? '',
      placeholder: this.placeholder,
      placeholderTextColor: this.placeholderTextColor,
      style: this.style,
      selectionColor: this.selectionColor,
      underlineColorAndroid: this.underlineColorAndroid ?? 'transparent',
      cursorColor: this.cursorColor,
      keyboardType: this.keyboardType ?? 'default',
      returnKeyType: this.returnKeyType ?? 'done',
      returnKeyLabel: this.returnKeyLabel,
      autoCapitalize: this.autoCapitalize ?? 'sentences',
      autoCorrect: this.autoCorrect ?? true,
      autoComplete: this.autoComplete ?? 'off',
      editable: this.editable ?? true,
      multiline: this.multiline ?? false,
      numberOfLines: this.numberOfLines,
      maxLength: this.maxLength,
      secureTextEntry: this.secureTextEntry ?? false,
      selectTextOnFocus: this.selectTextOnFocus,
      blurOnSubmit: this.blurOnSubmit ?? !this.multiline,
      caretHidden: this.caretHidden,
      contextMenuHidden: this.contextMenuHidden,
      selection: this.selection,
      scrollEnabled: this.scrollEnabled,
      textContentType: this.textContentType,
      accessible: this.accessible ?? true,
      accessibilityLabel: this.accessibilityLabel,
      accessibilityHint: this.accessibilityHint,
      testID: this.testID,
      nativeID: this.nativeID,
      allowFontScaling: this.allowFontScaling ?? true,
      spellCheck: this.spellCheck,
    };
  }

  private registerEventListeners(): void {
    if (!this.viewId) return;

    this.bridgeService.on<{ text: string; target?: string }>('changeText').subscribe((event) => {
      if (event.target === this.viewId) {
        const text = event.text;
        this.value = text;
        this.onChange(text);
        this.changeText.emit(text);
      }
    });

    this.bridgeService.on<TextChangeEvent>('endEditing').subscribe((event) => {
      if (event.target === this.viewId) {
        this.onTouched();
        this.endEditing.emit(event);
      }
    });

    this.bridgeService.on<SubmitEditingEvent>('submitEditing').subscribe((event) => {
      if (event.target === this.viewId) {
        this.submitEditing.emit(event);
      }
    });

    this.bridgeService.on<FocusEvent>('focus').subscribe((event) => {
      if (event.target === this.viewId) {
        this.focus.emit(event);
      }
    });

    this.bridgeService.on<BlurEvent>('blur').subscribe((event) => {
      if (event.target === this.viewId) {
        this.onTouched();
        this.blur.emit(event);
      }
    });
  }

  /**
   * Set focus on this input
   */
  async setFocus(): Promise<void> {
    if (this.viewId) {
      await this.bridgeService.send('focus', { viewId: this.viewId });
    }
  }

  /**
   * Remove focus from this input
   */
  async setBlur(): Promise<void> {
    if (this.viewId) {
      await this.bridgeService.send('blur', { viewId: this.viewId });
    }
  }

  /**
   * Clear the input text
   */
  async clear(): Promise<void> {
    this.value = '';
    this.onChange('');
    if (this.viewId) {
      await this.bridgeService.updateView(this.viewId, { value: '' });
    }
  }

  /**
   * Check if input is focused
   */
  async isFocused(): Promise<boolean> {
    if (!this.viewId) return false;

    return this.bridgeService.request('isFocused', { viewId: this.viewId });
  }

  getViewId(): string | null {
    return this.viewId;
  }
}
