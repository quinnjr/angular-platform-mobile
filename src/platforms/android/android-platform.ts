/**
 * Android Platform Implementation
 *
 * Provides Android-specific platform functionality.
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
 * Android-specific platform implementation
 */
@Injectable()
export class AndroidPlatform extends BasePlatform {
  readonly type = 'android' as const;

  private _os: PlatformOS = {
    type: 'android',
    version: '13',
    versionNumber: 33,
    isTablet: false,
    isTV: false,
    model: 'Unknown',
    brand: 'Unknown',
    manufacturer: 'Unknown',
  };

  private _constants: PlatformConstants = {
    isDebugging: false,
    isRTL: false,
    android: {
      apiLevel: 33,
      sdkInt: 33,
      release: '13',
      fingerprint: '',
    },
  };

  constructor(private readonly bridge: NativeBridge) {
    super();
    this.initializePlatform();
  }

  get OS(): PlatformOS {
    return this._os;
  }

  get constants(): PlatformConstants {
    return this._constants;
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
      console.warn('[AndroidPlatform] Failed to get platform info:', error);
    }
  }

  /**
   * Get Android-specific status bar height
   */
  getStatusBarHeight(): number {
    return this.getSafeAreaInsets().top;
  }

  /**
   * Get Android-specific navigation bar height
   */
  getNavigationBarHeight(): number {
    return this.getSafeAreaInsets().bottom;
  }

  /**
   * Check if device has hardware back button
   */
  hasHardwareBackButton(): boolean {
    return true; // Android always has back button (hardware or gesture)
  }

  /**
   * Check if running in Android Auto
   */
  isAndroidAuto(): boolean {
    return false; // Would be detected from native
  }
}

/**
 * Android view class mappings
 */
export const AndroidViewClassMap: Record<string, string> = {
  View: 'android.view.ViewGroup',
  Text: 'android.widget.TextView',
  Image: 'android.widget.ImageView',
  TextInput: 'android.widget.EditText',
  ScrollView: 'android.widget.ScrollView',
  Button: 'android.widget.Button',
  Switch: 'android.widget.Switch',
  Slider: 'android.widget.SeekBar',
  ActivityIndicator: 'android.widget.ProgressBar',
  Modal: 'android.app.Dialog',
  WebView: 'android.webkit.WebView',
  FlatList: 'androidx.recyclerview.widget.RecyclerView',
  SafeAreaView: 'android.view.ViewGroup',
  StatusBar: 'android.view.View',
  TouchableOpacity: 'android.view.ViewGroup',
  TouchableHighlight: 'android.view.ViewGroup',
  TouchableWithoutFeedback: 'android.view.View',
};

/**
 * Android event name mappings
 */
export const AndroidEventMap: Record<string, string> = {
  press: 'onClick',
  longPress: 'onLongClick',
  pressIn: 'onTouchDown',
  pressOut: 'onTouchUp',
  focus: 'onFocusChange',
  blur: 'onFocusChange',
  change: 'onTextChanged',
  submit: 'onEditorAction',
  scroll: 'onScrollChanged',
  layout: 'onLayout',
  load: 'onLoadComplete',
  error: 'onError',
  valueChange: 'onCheckedChanged',
};

/**
 * Android style property mappings
 */
export const AndroidStyleMap: Record<string, string> = {
  backgroundColor: 'android:background',
  color: 'android:textColor',
  fontSize: 'android:textSize',
  fontWeight: 'android:textStyle',
  textAlign: 'android:gravity',
  padding: 'android:padding',
  paddingTop: 'android:paddingTop',
  paddingRight: 'android:paddingEnd',
  paddingBottom: 'android:paddingBottom',
  paddingLeft: 'android:paddingStart',
  margin: 'android:layout_margin',
  marginTop: 'android:layout_marginTop',
  marginRight: 'android:layout_marginEnd',
  marginBottom: 'android:layout_marginBottom',
  marginLeft: 'android:layout_marginStart',
  borderRadius: 'android:cornerRadius',
  borderColor: 'android:strokeColor',
  borderWidth: 'android:strokeWidth',
  opacity: 'android:alpha',
  elevation: 'android:elevation',
};
