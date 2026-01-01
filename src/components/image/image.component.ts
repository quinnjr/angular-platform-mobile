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
import { ImageStyle, ResizeModeType } from '../../types/style.types';
import { ImageLoadEvent, ImageErrorEvent, ImageProgressEvent, LayoutEvent } from '../../types/event.types';
import { ImageSource, AccessibilityProps } from '../../types/native.types';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService, ViewProps } from '../../core/bridge/bridge.service';

/**
 * Image Component
 *
 * A component for displaying images. Maps to Android's ImageView.
 * Supports various image sources and resize modes.
 *
 * @example
 * ```html
 * <android-image
 *   [source]="{ uri: 'https://example.com/image.jpg' }"
 *   [style]="{ width: 200, height: 200 }"
 *   resizeMode="cover"
 *   (load)="onLoad($event)"
 *   (error)="onError($event)">
 * </android-image>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.widget.ImageView',
  hasChildren: false,
  events: ['load', 'error', 'loadStart', 'loadEnd', 'progress'],
})
@Component({
  selector: 'android-image',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ImageComponent implements OnInit, OnDestroy, OnChanges {
  private viewId: string | null = null;

  // Source
  @Input() source!: ImageSource;
  @Input() defaultSource?: ImageSource;
  @Input() loadingIndicatorSource?: ImageSource;

  // Style
  @Input() style?: ImageStyle;
  @Input() resizeMode?: ResizeModeType;
  @Input() resizeMethod?: 'auto' | 'resize' | 'scale';
  @Input() blurRadius?: number;
  @Input() tintColor?: string;
  @Input() overlayColor?: string;

  // Behavior
  @Input() fadeDuration?: number;
  @Input() progressiveRenderingEnabled?: boolean;
  @Input() capInsets?: { top: number; left: number; bottom: number; right: number };

  // Cache control
  @Input() cache?: 'default' | 'reload' | 'force-cache' | 'only-if-cached';

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;
  @Input() accessibilityRole?: AccessibilityProps['accessibilityRole'];

  // Test
  @Input() testID?: string;
  @Input() nativeID?: string;

  // Events
  @Output() load = new EventEmitter<ImageLoadEvent>();
  @Output() loadStart = new EventEmitter<void>();
  @Output() loadEnd = new EventEmitter<void>();
  @Output() error = new EventEmitter<ImageErrorEvent>();
  @Output() progress = new EventEmitter<ImageProgressEvent>();
  @Output() layout = new EventEmitter<LayoutEvent>();
  @Output() partialLoad = new EventEmitter<void>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    this.viewId = await this.bridgeService.createView('Image', this.getProps());
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
      this.bridgeService.removeView(this.viewId);
    }
  }

  private getProps(): ViewProps {
    return {
      source: this.normalizeSource(this.source),
      defaultSource: this.defaultSource ? this.normalizeSource(this.defaultSource) : undefined,
      loadingIndicatorSource: this.loadingIndicatorSource
        ? this.normalizeSource(this.loadingIndicatorSource)
        : undefined,
      style: this.style,
      resizeMode: this.resizeMode ?? 'cover',
      resizeMethod: this.resizeMethod ?? 'auto',
      blurRadius: this.blurRadius,
      tintColor: this.tintColor,
      overlayColor: this.overlayColor,
      fadeDuration: this.fadeDuration ?? 300,
      progressiveRenderingEnabled: this.progressiveRenderingEnabled,
      capInsets: this.capInsets,
      cache: this.cache,
      accessible: this.accessible ?? true,
      accessibilityLabel: this.accessibilityLabel,
      accessibilityRole: this.accessibilityRole ?? 'image',
      testID: this.testID,
      nativeID: this.nativeID,
    };
  }

  private normalizeSource(source: ImageSource): object {
    if (typeof source === 'number') {
      return { resource: source };
    }
    if (Array.isArray(source)) {
      return { sources: source };
    }
    return source;
  }

  private registerEventListeners(): void {
    if (!this.viewId) return;

    this.bridgeService.on<ImageLoadEvent>('load').subscribe((event) => {
      if (event.target === this.viewId) {
        this.load.emit(event);
      }
    });

    this.bridgeService.on<void>('loadStart').subscribe(() => {
      this.loadStart.emit();
    });

    this.bridgeService.on<void>('loadEnd').subscribe(() => {
      this.loadEnd.emit();
    });

    this.bridgeService.on<ImageErrorEvent>('error').subscribe((event) => {
      if (event.target === this.viewId) {
        this.error.emit(event);
      }
    });

    this.bridgeService.on<ImageProgressEvent>('progress').subscribe((event) => {
      if (event.target === this.viewId) {
        this.progress.emit(event);
      }
    });
  }

  /**
   * Prefetch an image to cache
   */
  static async prefetch(url: string): Promise<boolean> {
    // This would call native prefetch method
    console.log('[Image] Prefetch:', url);
    return true;
  }

  /**
   * Get the size of an image
   */
  static async getSize(
    _uri: string
  ): Promise<{ width: number; height: number }> {
    // This would call native getSize method
    return { width: 0, height: 0 };
  }

  /**
   * Query the cache for an image
   */
  static async queryCache(
    urls: string[]
  ): Promise<Record<string, 'memory' | 'disk' | 'none'>> {
    // This would call native queryCache method
    const result: Record<string, 'memory' | 'disk' | 'none'> = {};
    for (const url of urls) {
      result[url] = 'none';
    }
    return result;
  }

  getViewId(): string | null {
    return this.viewId;
  }
}
