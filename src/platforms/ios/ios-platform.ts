/**
 * iOS Platform Implementation
 *
 * Provides iOS-specific platform functionality.
 */

import { Injectable } from '@angular/core';
import {
  BasePlatform,
  PlatformOS,
  PlatformConstants,
  PlatformDimensions,
  ColorScheme,
  SafeAreaInsets,
} from '../../core/platform/platform';
import { NativeBridge } from '../../core/bridge/native-bridge';

/**
 * iOS interface idiom types
 */
export type IOSInterfaceIdiom = 'phone' | 'pad' | 'tv' | 'carPlay' | 'mac';

/**
 * iOS-specific platform implementation
 */
@Injectable()
export class IOSPlatform extends BasePlatform {
  readonly type = 'ios' as const;

  private _os: PlatformOS = {
    type: 'ios',
    version: '17.0',
    versionNumber: 17,
    isTablet: false,
    isTV: false,
    model: 'iPhone',
    deviceName: 'iPhone',
  };

  private _constants: PlatformConstants = {
    isDebugging: false,
    isRTL: false,
    ios: {
      systemName: 'iOS',
      systemVersion: '17.0',
      interfaceIdiom: 'phone',
      isSimulator: false,
    },
  };

  constructor(private readonly bridge: NativeBridge) {
    super();
    void this.initializePlatform();
  }

  get OS(): PlatformOS {
    return this._os;
  }

  get constants(): PlatformConstants {
    return this._constants;
  }

  /**
   * Get the iOS interface idiom
   */
  get interfaceIdiom(): IOSInterfaceIdiom {
    return this._constants.ios?.interfaceIdiom || 'phone';
  }

  /**
   * Check if running on iPad
   */
  get isPad(): boolean {
    return this.interfaceIdiom === 'pad';
  }

  /**
   * Check if running on iPhone
   */
  get isPhone(): boolean {
    return this.interfaceIdiom === 'phone';
  }

  /**
   * Check if running on Mac (Catalyst)
   */
  get isMac(): boolean {
    return this.interfaceIdiom === 'mac';
  }

  /**
   * Check if running in simulator
   */
  get isSimulator(): boolean {
    return this._constants.ios?.isSimulator || false;
  }

  private async initializePlatform(): Promise<void> {
    // Register for platform events
    this.bridge.on('dimensionsChange', (dimensions: PlatformDimensions) => {
      this.updateDimensions(dimensions);
    });

    this.bridge.on('appearanceChange', (data: { colorScheme: ColorScheme }) => {
      this.updateColorScheme(data.colorScheme);
    });

    this.bridge.on('safeAreaInsetsChange', (insets: SafeAreaInsets) => {
      this.updateSafeAreaInsets(insets);
    });

    // Request initial platform info
    try {
      const platformInfo = await this.bridge.request<{
        os: PlatformOS;
        constants: PlatformConstants;
        dimensions: PlatformDimensions;
        colorScheme: ColorScheme;
        safeAreaInsets: SafeAreaInsets;
      }>('getPlatformInfo', {});

      if (platformInfo) {
        this._os = platformInfo.os;
        this._constants = platformInfo.constants;
        this.updateDimensions(platformInfo.dimensions);
        this.updateColorScheme(platformInfo.colorScheme);
        this.updateSafeAreaInsets(platformInfo.safeAreaInsets);
      }
    } catch (error) {
      console.warn('[IOSPlatform] Failed to get platform info:', error);
    }
  }

  /**
   * Check if device has notch (iPhone X and later)
   */
  hasNotch(): boolean {
    const insets = this.getSafeAreaInsets();
    return insets.top > 20; // Notched iPhones have top inset > 20
  }

  /**
   * Check if device has home indicator (iPhone X and later)
   */
  hasHomeIndicator(): boolean {
    const insets = this.getSafeAreaInsets();
    return insets.bottom > 0;
  }

  /**
   * Check if device supports haptic feedback
   */
  supportsHaptics(): boolean {
    // iPhone 7 and later support haptics
    return this.isVersionAtLeast(10);
  }

  /**
   * Check if device supports Face ID
   */
  supportsFaceID(): boolean {
    return this.hasNotch() && this.isPhone;
  }

  /**
   * Check if device supports Dynamic Island
   */
  hasDynamicIsland(): boolean {
    // iPhone 14 Pro and later have Dynamic Island
    const model = this._os.model.toLowerCase();
    return model.includes('iphone15') || model.includes('iphone14 pro') || model.includes('iphone16');
  }
}

/**
 * iOS view class mappings (UIKit)
 */
export const IOSViewClassMap: Record<string, string> = {
  View: 'UIView',
  Text: 'UILabel',
  Image: 'UIImageView',
  TextInput: 'UITextField',
  ScrollView: 'UIScrollView',
  Button: 'UIButton',
  Switch: 'UISwitch',
  Slider: 'UISlider',
  ActivityIndicator: 'UIActivityIndicatorView',
  Modal: 'UIViewController',
  WebView: 'WKWebView',
  FlatList: 'UICollectionView',
  SafeAreaView: 'UIView',
  StatusBar: 'UIStatusBar',
  TouchableOpacity: 'UIControl',
  TouchableHighlight: 'UIControl',
  TouchableWithoutFeedback: 'UIView',
  DatePicker: 'UIDatePicker',
  Picker: 'UIPickerView',
  SegmentedControl: 'UISegmentedControl',
  TabBar: 'UITabBar',
  NavigationBar: 'UINavigationBar',
};

/**
 * iOS event name mappings
 */
export const IOSEventMap: Record<string, string> = {
  press: 'touchUpInside',
  longPress: 'longPressGestureRecognizer',
  pressIn: 'touchDown',
  pressOut: 'touchUpOutside',
  focus: 'becomeFirstResponder',
  blur: 'resignFirstResponder',
  change: 'editingChanged',
  submit: 'primaryActionTriggered',
  scroll: 'scrollViewDidScroll',
  layout: 'layoutSubviews',
  load: 'loadComplete',
  error: 'loadFailed',
  valueChange: 'valueChanged',
};

/**
 * iOS style property mappings
 */
export const IOSStyleMap: Record<string, string> = {
  backgroundColor: 'backgroundColor',
  color: 'textColor',
  fontSize: 'font.pointSize',
  fontWeight: 'font.weight',
  textAlign: 'textAlignment',
  padding: 'layoutMargins',
  paddingTop: 'layoutMargins.top',
  paddingRight: 'layoutMargins.right',
  paddingBottom: 'layoutMargins.bottom',
  paddingLeft: 'layoutMargins.left',
  margin: 'constraints',
  marginTop: 'topAnchor',
  marginRight: 'trailingAnchor',
  marginBottom: 'bottomAnchor',
  marginLeft: 'leadingAnchor',
  borderRadius: 'layer.cornerRadius',
  borderColor: 'layer.borderColor',
  borderWidth: 'layer.borderWidth',
  opacity: 'alpha',
  shadowColor: 'layer.shadowColor',
  shadowOffset: 'layer.shadowOffset',
  shadowOpacity: 'layer.shadowOpacity',
  shadowRadius: 'layer.shadowRadius',
};

/**
 * iOS system colors
 */
export const IOSSystemColors = {
  // Semantic colors
  label: 'UIColor.label',
  secondaryLabel: 'UIColor.secondaryLabel',
  tertiaryLabel: 'UIColor.tertiaryLabel',
  quaternaryLabel: 'UIColor.quaternaryLabel',
  systemFill: 'UIColor.systemFill',
  secondarySystemFill: 'UIColor.secondarySystemFill',
  tertiarySystemFill: 'UIColor.tertiarySystemFill',
  quaternarySystemFill: 'UIColor.quaternarySystemFill',
  placeholderText: 'UIColor.placeholderText',
  systemBackground: 'UIColor.systemBackground',
  secondarySystemBackground: 'UIColor.secondarySystemBackground',
  tertiarySystemBackground: 'UIColor.tertiarySystemBackground',
  systemGroupedBackground: 'UIColor.systemGroupedBackground',
  secondarySystemGroupedBackground: 'UIColor.secondarySystemGroupedBackground',
  tertiarySystemGroupedBackground: 'UIColor.tertiarySystemGroupedBackground',
  separator: 'UIColor.separator',
  opaqueSeparator: 'UIColor.opaqueSeparator',
  link: 'UIColor.link',
  // Standard colors
  systemRed: 'UIColor.systemRed',
  systemOrange: 'UIColor.systemOrange',
  systemYellow: 'UIColor.systemYellow',
  systemGreen: 'UIColor.systemGreen',
  systemMint: 'UIColor.systemMint',
  systemTeal: 'UIColor.systemTeal',
  systemCyan: 'UIColor.systemCyan',
  systemBlue: 'UIColor.systemBlue',
  systemIndigo: 'UIColor.systemIndigo',
  systemPurple: 'UIColor.systemPurple',
  systemPink: 'UIColor.systemPink',
  systemBrown: 'UIColor.systemBrown',
  systemGray: 'UIColor.systemGray',
  systemGray2: 'UIColor.systemGray2',
  systemGray3: 'UIColor.systemGray3',
  systemGray4: 'UIColor.systemGray4',
  systemGray5: 'UIColor.systemGray5',
  systemGray6: 'UIColor.systemGray6',
};

/**
 * iOS haptic feedback types
 */
export type IOSHapticType =
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'impactRigid'
  | 'impactSoft'
  | 'notificationSuccess'
  | 'notificationWarning'
  | 'notificationError'
  | 'selection';

/**
 * iOS animation curve types
 */
export type IOSAnimationCurve =
  | 'easeInOut'
  | 'easeIn'
  | 'easeOut'
  | 'linear'
  | 'spring';
