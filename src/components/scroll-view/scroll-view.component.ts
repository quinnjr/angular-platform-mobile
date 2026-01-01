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
import { ScrollEvent, LayoutEvent } from '../../types/event.types';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService } from '../../core/bridge/bridge.service';

/**
 * Content inset type
 */
export interface ContentInset {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

/**
 * Content offset type
 */
export interface ContentOffset {
  x: number;
  y: number;
}

/**
 * ScrollView Component
 *
 * A scrollable container component. Maps to Android's ScrollView.
 * Supports both vertical and horizontal scrolling.
 *
 * @example
 * ```html
 * <android-scroll-view [style]="scrollStyle" (scroll)="onScroll($event)">
 *   <android-view *ngFor="let item of items">
 *     <android-text>{{ item.title }}</android-text>
 *   </android-view>
 * </android-scroll-view>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.widget.ScrollView',
  hasChildren: true,
  events: ['scroll', 'scrollBeginDrag', 'scrollEndDrag', 'momentumScrollBegin', 'momentumScrollEnd'],
})
@Component({
  selector: 'android-scroll-view',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ScrollViewComponent implements OnInit, OnDestroy, OnChanges {
  private viewId: string | null = null;

  // Style
  @Input() style?: ViewStyle;
  @Input() contentContainerStyle?: ViewStyle;

  // Scroll behavior
  @Input() horizontal?: boolean;
  @Input() showsVerticalScrollIndicator?: boolean;
  @Input() showsHorizontalScrollIndicator?: boolean;
  @Input() scrollEnabled?: boolean;
  @Input() pagingEnabled?: boolean;
  @Input() bounces?: boolean;
  @Input() alwaysBounceVertical?: boolean;
  @Input() alwaysBounceHorizontal?: boolean;
  @Input() overScrollMode?: 'auto' | 'always' | 'never';
  @Input() nestedScrollEnabled?: boolean;

  // Content
  @Input() contentInset?: ContentInset;
  @Input() contentOffset?: ContentOffset;
  @Input() scrollEventThrottle?: number;
  @Input() decelerationRate?: 'fast' | 'normal' | number;

  // Performance
  @Input() removeClippedSubviews?: boolean;
  @Input() fadingEdgeLength?: number;
  @Input() persistentScrollbar?: boolean;

  // Keyboard
  @Input() keyboardDismissMode?: 'none' | 'on-drag' | 'interactive';
  @Input() keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';

  // Refresh control
  @Input() refreshing?: boolean;
  @Input() refreshControlEnabled?: boolean;
  @Input() refreshControlColors?: string[];
  @Input() refreshControlProgressBackgroundColor?: string;

  // Snapping
  @Input() snapToInterval?: number;
  @Input() snapToOffsets?: number[];
  @Input() snapToStart?: boolean;
  @Input() snapToEnd?: boolean;
  @Input() snapToAlignment?: 'start' | 'center' | 'end';
  @Input() disableIntervalMomentum?: boolean;

  // Scroll indicators
  @Input() indicatorStyle?: 'default' | 'black' | 'white';
  @Input() scrollIndicatorInsets?: ContentInset;

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;
  @Input() testID?: string;

  // Events
  @Output() scroll = new EventEmitter<ScrollEvent>();
  @Output() scrollBeginDrag = new EventEmitter<ScrollEvent>();
  @Output() scrollEndDrag = new EventEmitter<ScrollEvent>();
  @Output() momentumScrollBegin = new EventEmitter<ScrollEvent>();
  @Output() momentumScrollEnd = new EventEmitter<ScrollEvent>();
  @Output() scrollToTop = new EventEmitter<void>();
  @Output() layout = new EventEmitter<LayoutEvent>();
  @Output() contentSizeChange = new EventEmitter<{ width: number; height: number }>();
  @Output() refresh = new EventEmitter<void>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    this.viewId = await this.bridgeService.createView('ScrollView', this.getProps());
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
      style: this.style,
      contentContainerStyle: this.contentContainerStyle,
      horizontal: this.horizontal,
      showsVerticalScrollIndicator: this.showsVerticalScrollIndicator ?? true,
      showsHorizontalScrollIndicator: this.showsHorizontalScrollIndicator ?? true,
      scrollEnabled: this.scrollEnabled ?? true,
      pagingEnabled: this.pagingEnabled,
      bounces: this.bounces ?? true,
      overScrollMode: this.overScrollMode ?? 'auto',
      nestedScrollEnabled: this.nestedScrollEnabled,
      contentInset: this.contentInset,
      contentOffset: this.contentOffset,
      scrollEventThrottle: this.scrollEventThrottle ?? 16,
      decelerationRate: this.decelerationRate ?? 'normal',
      removeClippedSubviews: this.removeClippedSubviews,
      keyboardDismissMode: this.keyboardDismissMode ?? 'none',
      keyboardShouldPersistTaps: this.keyboardShouldPersistTaps ?? 'never',
      refreshing: this.refreshing,
      refreshControlEnabled: this.refreshControlEnabled,
      testID: this.testID,
    };
  }

  private registerEventListeners(): void {
    if (!this.viewId) return;

    this.bridgeService.on<ScrollEvent>('scroll').subscribe((event) => {
      if (event.target === this.viewId) {
        this.scroll.emit(event);
      }
    });

    this.bridgeService.on<ScrollEvent>('scrollBeginDrag').subscribe((event) => {
      if (event.target === this.viewId) {
        this.scrollBeginDrag.emit(event);
      }
    });

    this.bridgeService.on<ScrollEvent>('scrollEndDrag').subscribe((event) => {
      if (event.target === this.viewId) {
        this.scrollEndDrag.emit(event);
      }
    });

    this.bridgeService.on<void>('refresh').subscribe(() => {
      this.refresh.emit();
    });
  }

  /**
   * Scroll to a specific position
   */
  async scrollTo(options: { x?: number; y?: number; animated?: boolean }): Promise<void> {
    if (!this.viewId) return;

    await this.bridgeService.send('scrollTo', {
      viewId: this.viewId,
      x: options.x ?? 0,
      y: options.y ?? 0,
      animated: options.animated ?? true,
    });
  }

  /**
   * Scroll to the end
   */
  async scrollToEnd(options?: { animated?: boolean }): Promise<void> {
    if (!this.viewId) return;

    await this.bridgeService.send('scrollToEnd', {
      viewId: this.viewId,
      animated: options?.animated ?? true,
    });
  }

  /**
   * Flash scroll indicators
   */
  async flashScrollIndicators(): Promise<void> {
    if (!this.viewId) return;

    await this.bridgeService.send('flashScrollIndicators', {
      viewId: this.viewId,
    });
  }

  getViewId(): string | null {
    return this.viewId;
  }
}
