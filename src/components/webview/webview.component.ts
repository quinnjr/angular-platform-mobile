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
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService, ViewProps } from '../../core/bridge/bridge.service';

/**
 * WebView source type
 */
export type WebViewSource =
  | { uri: string; headers?: Record<string, string> }
  | { html: string; baseUrl?: string };

/**
 * Base event with target
 */
interface TargetedEvent {
  target?: string;
}

/**
 * WebView navigation event
 */
export interface WebViewNavigationEvent extends TargetedEvent {
  url: string;
  title: string;
  loading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

/**
 * WebView message event
 */
export interface WebViewMessageEvent extends TargetedEvent {
  data: string;
}

/**
 * WebView error event
 */
export interface WebViewErrorEvent extends TargetedEvent {
  domain?: string;
  code: number;
  description: string;
}

/**
 * WebView progress event
 */
export interface WebViewProgressEvent extends TargetedEvent {
  progress: number;
}

/**
 * WebView Component
 *
 * Renders web content inside the app.
 * Maps to Android's WebView.
 *
 * @example
 * ```html
 * <android-webview
 *   [source]="{ uri: 'https://example.com' }"
 *   [style]="{ flex: 1 }"
 *   (loadStart)="onLoadStart($event)"
 *   (loadEnd)="onLoadEnd($event)"
 *   (message)="onMessage($event)">
 * </android-webview>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.webkit.WebView',
  hasChildren: false,
  events: ['loadStart', 'load', 'loadEnd', 'error', 'message', 'navigationStateChange'],
})
@Component({
  selector: 'android-webview',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class WebViewComponent implements OnInit, OnDestroy, OnChanges {
  private viewId: string | null = null;

  // Source
  @Input() source!: WebViewSource;

  // JavaScript
  @Input() javaScriptEnabled?: boolean;
  @Input() javaScriptCanOpenWindowsAutomatically?: boolean;
  @Input() injectedJavaScript?: string;
  @Input() injectedJavaScriptBeforeContentLoaded?: string;

  // Media
  @Input() mediaPlaybackRequiresUserAction?: boolean;
  @Input() allowsInlineMediaPlayback?: boolean;

  // User agent
  @Input() userAgent?: string;
  @Input() applicationNameForUserAgent?: string;

  // DOM storage
  @Input() domStorageEnabled?: boolean;

  // Caching
  @Input() cacheEnabled?: boolean;
  @Input() cacheMode?: 'LOAD_DEFAULT' | 'LOAD_CACHE_ELSE_NETWORK' | 'LOAD_NO_CACHE' | 'LOAD_CACHE_ONLY';

  // Mixed content
  @Input() mixedContentMode?: 'never' | 'always' | 'compatibility';

  // Geolocation
  @Input() geolocationEnabled?: boolean;

  // File access
  @Input() allowFileAccess?: boolean;
  @Input() allowUniversalAccessFromFileURLs?: boolean;

  // Zoom
  @Input() scalesPageToFit?: boolean;
  @Input() setSupportMultipleWindows?: boolean;

  // Text zoom
  @Input() textZoom?: number;

  // Scroll
  @Input() scrollEnabled?: boolean;
  @Input() nestedScrollEnabled?: boolean;
  @Input() overScrollMode?: 'auto' | 'always' | 'never';

  // Style
  @Input() style?: ViewStyle;

  // Behavior
  @Input() showsHorizontalScrollIndicator?: boolean;
  @Input() showsVerticalScrollIndicator?: boolean;
  @Input() bounces?: boolean;
  @Input() startInLoadingState?: boolean;
  @Input() originWhitelist?: string[];

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;

  // Test
  @Input() testID?: string;
  @Input() nativeID?: string;

  // Events
  @Output() loadStart = new EventEmitter<WebViewNavigationEvent>();
  @Output() load = new EventEmitter<WebViewNavigationEvent>();
  @Output() loadEnd = new EventEmitter<WebViewNavigationEvent>();
  @Output() loadProgress = new EventEmitter<{ progress: number }>();
  @Output() error = new EventEmitter<WebViewErrorEvent>();
  @Output() message = new EventEmitter<WebViewMessageEvent>();
  @Output() navigationStateChange = new EventEmitter<WebViewNavigationEvent>();
  @Output() shouldStartLoadWithRequest = new EventEmitter<{ url: string; navigationType: string }>();
  @Output() contentProcessDidTerminate = new EventEmitter<void>();
  @Output() scroll = new EventEmitter<{ contentOffset: { x: number; y: number } }>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    this.viewId = await this.bridgeService.createView('WebView', this.getProps());
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
      this.bridgeService.removeView(this.viewId);
    }
  }

  private getProps(): ViewProps {
    return {
      source: this.source,
      javaScriptEnabled: this.javaScriptEnabled ?? true,
      javaScriptCanOpenWindowsAutomatically: this.javaScriptCanOpenWindowsAutomatically ?? false,
      injectedJavaScript: this.injectedJavaScript,
      injectedJavaScriptBeforeContentLoaded: this.injectedJavaScriptBeforeContentLoaded,
      mediaPlaybackRequiresUserAction: this.mediaPlaybackRequiresUserAction ?? true,
      allowsInlineMediaPlayback: this.allowsInlineMediaPlayback ?? false,
      userAgent: this.userAgent,
      applicationNameForUserAgent: this.applicationNameForUserAgent,
      domStorageEnabled: this.domStorageEnabled ?? true,
      cacheEnabled: this.cacheEnabled ?? true,
      cacheMode: this.cacheMode ?? 'LOAD_DEFAULT',
      mixedContentMode: this.mixedContentMode ?? 'never',
      geolocationEnabled: this.geolocationEnabled ?? false,
      allowFileAccess: this.allowFileAccess ?? false,
      scalesPageToFit: this.scalesPageToFit ?? true,
      textZoom: this.textZoom ?? 100,
      scrollEnabled: this.scrollEnabled ?? true,
      nestedScrollEnabled: this.nestedScrollEnabled ?? false,
      overScrollMode: this.overScrollMode ?? 'auto',
      style: this.style,
      showsHorizontalScrollIndicator: this.showsHorizontalScrollIndicator ?? true,
      showsVerticalScrollIndicator: this.showsVerticalScrollIndicator ?? true,
      bounces: this.bounces ?? true,
      startInLoadingState: this.startInLoadingState ?? true,
      originWhitelist: this.originWhitelist ?? ['http://*', 'https://*'],
      accessible: this.accessible ?? true,
      accessibilityLabel: this.accessibilityLabel,
      testID: this.testID,
      nativeID: this.nativeID,
    };
  }

  private registerEventListeners(): void {
    if (!this.viewId) return;

    this.bridgeService.on<WebViewNavigationEvent>('loadStart').subscribe((event) => {
      if (event.target === this.viewId) {
        this.loadStart.emit(event);
      }
    });

    this.bridgeService.on<WebViewNavigationEvent>('load').subscribe((event) => {
      if (event.target === this.viewId) {
        this.load.emit(event);
      }
    });

    this.bridgeService.on<WebViewNavigationEvent>('loadEnd').subscribe((event) => {
      if (event.target === this.viewId) {
        this.loadEnd.emit(event);
      }
    });

    this.bridgeService.on<WebViewProgressEvent>('loadProgress').subscribe((event) => {
      if (event.target === this.viewId) {
        this.loadProgress.emit(event);
      }
    });

    this.bridgeService.on<WebViewErrorEvent>('error').subscribe((event) => {
      if (event.target === this.viewId) {
        this.error.emit(event);
      }
    });

    this.bridgeService.on<WebViewMessageEvent>('message').subscribe((event) => {
      if (event.target === this.viewId) {
        this.message.emit(event);
      }
    });

    this.bridgeService.on<WebViewNavigationEvent>('navigationStateChange').subscribe((event) => {
      if (event.target === this.viewId) {
        this.navigationStateChange.emit(event);
      }
    });
  }

  /**
   * Go back in history
   */
  async goBack(): Promise<void> {
    if (this.viewId) {
      await this.bridgeService.send('webViewGoBack', { viewId: this.viewId });
    }
  }

  /**
   * Go forward in history
   */
  async goForward(): Promise<void> {
    if (this.viewId) {
      await this.bridgeService.send('webViewGoForward', { viewId: this.viewId });
    }
  }

  /**
   * Reload the current page
   */
  async reload(): Promise<void> {
    if (this.viewId) {
      await this.bridgeService.send('webViewReload', { viewId: this.viewId });
    }
  }

  /**
   * Stop loading
   */
  async stopLoading(): Promise<void> {
    if (this.viewId) {
      await this.bridgeService.send('webViewStopLoading', { viewId: this.viewId });
    }
  }

  /**
   * Inject JavaScript into the page
   */
  async injectJavaScript(script: string): Promise<void> {
    if (this.viewId) {
      await this.bridgeService.send('webViewInjectJavaScript', {
        viewId: this.viewId,
        script,
      });
    }
  }

  /**
   * Post a message to the web page
   */
  async postMessage(message: string): Promise<void> {
    const script = `
      window.postMessage(${JSON.stringify(message)}, '*');
      true;
    `;
    await this.injectJavaScript(script);
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    if (this.viewId) {
      await this.bridgeService.send('webViewClearCache', { viewId: this.viewId });
    }
  }

  /**
   * Clear history
   */
  async clearHistory(): Promise<void> {
    if (this.viewId) {
      await this.bridgeService.send('webViewClearHistory', { viewId: this.viewId });
    }
  }

  /**
   * Request focus
   */
  async requestFocus(): Promise<void> {
    if (this.viewId) {
      await this.bridgeService.send('focus', { viewId: this.viewId });
    }
  }

  getViewId(): string | null {
    return this.viewId;
  }
}
