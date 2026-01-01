import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ChangeDetectionStrategy,
  ContentChild,
  TrackByFunction,
} from '@angular/core';
import { ViewStyle } from '../../types/style.types';
import { ScrollEvent, LayoutEvent } from '../../types/event.types';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService, ViewProps } from '../../core/bridge/bridge.service';
import { JsonValue } from '../../core/bridge/native-bridge';

/**
 * Item layout information for optimization
 */
export interface ItemLayout {
  length: number;
  offset: number;
  index: number;
}

/**
 * Viewability configuration
 */
export interface ViewabilityConfig {
  minimumViewTime?: number;
  viewAreaCoveragePercentThreshold?: number;
  itemVisiblePercentThreshold?: number;
  waitForInteraction?: boolean;
}

/**
 * ViewToken for viewability callbacks
 */
export interface ViewToken<T> {
  item: T;
  key: string;
  index: number | null;
  isViewable: boolean;
}

/**
 * Serialized item for native transport
 */
interface SerializedItem<T> {
  key: string;
  data: T;
}

/**
 * FlatList Component
 *
 * A performant interface for rendering flat lists.
 * Maps to Android's RecyclerView.
 *
 * @example
 * ```html
 * <mobile-flat-list
 *   [data]="items"
 *   [renderItem]="itemTemplate"
 *   [keyExtractor]="getItemKey"
 *   (endReached)="loadMore()">
 *
 *   <ng-template #itemTemplate let-item let-index="index">
 *     <mobile-view [style]="itemStyle">
 *       <mobile-text>{{ item.title }}</mobile-text>
 *     </mobile-view>
 *   </ng-template>
 * </mobile-flat-list>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'androidx.recyclerview.widget.RecyclerView',
  hasChildren: true,
  events: ['scroll', 'endReached', 'refresh', 'viewableItemsChanged'],
})
@Component({
  selector: 'mobile-flat-list',
  template: `
    <ng-container *ngFor="let item of data; let i = index; trackBy: trackByFn">
      <ng-container *ngTemplateOutlet="renderItem; context: { $implicit: item, index: i }">
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class FlatListComponent<T = unknown> implements OnInit, OnDestroy, OnChanges {
  private viewId: string | null = null;

  // Data
  @Input() data: T[] = [];
  @Input() keyExtractor?: (item: T, index: number) => string;
  @Input() extraData?: unknown;

  // Templates
  @ContentChild('renderItem') renderItem!: TemplateRef<{ $implicit: T; index: number }>;
  @ContentChild('listHeader') listHeader?: TemplateRef<unknown>;
  @ContentChild('listFooter') listFooter?: TemplateRef<unknown>;
  @ContentChild('listEmpty') listEmpty?: TemplateRef<unknown>;
  @ContentChild('itemSeparator') itemSeparator?: TemplateRef<unknown>;

  // Style
  @Input() style?: ViewStyle;
  @Input() contentContainerStyle?: ViewStyle;
  @Input() columnWrapperStyle?: ViewStyle;

  // Layout
  @Input() horizontal?: boolean;
  @Input() numColumns?: number;
  @Input() inverted?: boolean;
  @Input() initialNumToRender?: number;
  @Input() initialScrollIndex?: number;
  @Input() maxToRenderPerBatch?: number;
  @Input() updateCellsBatchingPeriod?: number;
  @Input() windowSize?: number;

  // Optimization
  @Input() getItemLayout?: (data: T[] | null, index: number) => ItemLayout;
  @Input() removeClippedSubviews?: boolean;

  // Scroll
  @Input() showsVerticalScrollIndicator?: boolean;
  @Input() showsHorizontalScrollIndicator?: boolean;
  @Input() scrollEnabled?: boolean;
  @Input() pagingEnabled?: boolean;
  @Input() bounces?: boolean;
  @Input() overScrollMode?: 'auto' | 'always' | 'never';
  @Input() scrollEventThrottle?: number;
  @Input() decelerationRate?: 'fast' | 'normal' | number;
  @Input() snapToInterval?: number;
  @Input() snapToOffsets?: number[];
  @Input() snapToAlignment?: 'start' | 'center' | 'end';

  // Pull to refresh
  @Input() refreshing?: boolean;
  @Input() refreshControlColors?: string[];
  @Input() progressViewOffset?: number;

  // End reached
  @Input() onEndReachedThreshold?: number;

  // Viewability
  @Input() viewabilityConfig?: ViewabilityConfig;
  @Input() viewabilityConfigCallbackPairs?: Array<{
    viewabilityConfig: ViewabilityConfig;
    onViewableItemsChanged: (info: { viewableItems: ViewToken<T>[]; changed: ViewToken<T>[] }) => void;
  }>;

  // Sticky headers
  @Input() stickyHeaderIndices?: number[];

  // Keyboard
  @Input() keyboardDismissMode?: 'none' | 'on-drag' | 'interactive';
  @Input() keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;

  // Test
  @Input() testID?: string;

  // Events
  @Output() scroll = new EventEmitter<ScrollEvent>();
  @Output() scrollBeginDrag = new EventEmitter<ScrollEvent>();
  @Output() scrollEndDrag = new EventEmitter<ScrollEvent>();
  @Output() momentumScrollBegin = new EventEmitter<ScrollEvent>();
  @Output() momentumScrollEnd = new EventEmitter<ScrollEvent>();
  @Output() endReached = new EventEmitter<{ distanceFromEnd: number }>();
  @Output() refresh = new EventEmitter<void>();
  @Output() viewableItemsChanged = new EventEmitter<{
    viewableItems: ViewToken<T>[];
    changed: ViewToken<T>[];
  }>();
  @Output() layout = new EventEmitter<LayoutEvent>();
  @Output() scrollToIndexFailed = new EventEmitter<{
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }>();

  // Track by function for ngFor
  trackByFn: TrackByFunction<T> = (index: number, item: T) => {
    if (this.keyExtractor) {
      return this.keyExtractor(item, index);
    }
    return index;
  };

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    this.viewId = await this.bridgeService.createView('FlatList', this.getProps());
    this.registerEventListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewId) return;

    const props: ViewProps = {};

    for (const [key, change] of Object.entries(changes)) {
      if (!change.firstChange && key !== 'data') {
        props[key] = change.currentValue as JsonValue;
      }
    }

    // Handle data changes specially
    if (changes['data'] && !changes['data'].firstChange) {
      props['data'] = this.serializeData(this.data) as unknown as JsonValue;
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
      data: this.serializeData(this.data) as unknown as JsonValue,
      style: this.style as unknown as JsonValue,
      contentContainerStyle: this.contentContainerStyle as unknown as JsonValue,
      horizontal: this.horizontal ?? false,
      numColumns: this.numColumns ?? 1,
      inverted: this.inverted ?? false,
      initialNumToRender: this.initialNumToRender ?? 10,
      initialScrollIndex: this.initialScrollIndex ?? null,
      maxToRenderPerBatch: this.maxToRenderPerBatch ?? 10,
      updateCellsBatchingPeriod: this.updateCellsBatchingPeriod ?? 50,
      windowSize: this.windowSize ?? 21,
      removeClippedSubviews: this.removeClippedSubviews ?? true,
      showsVerticalScrollIndicator: this.showsVerticalScrollIndicator ?? true,
      showsHorizontalScrollIndicator: this.showsHorizontalScrollIndicator ?? true,
      scrollEnabled: this.scrollEnabled ?? true,
      pagingEnabled: this.pagingEnabled ?? false,
      bounces: this.bounces ?? true,
      overScrollMode: this.overScrollMode ?? 'auto',
      scrollEventThrottle: this.scrollEventThrottle ?? 16,
      refreshing: this.refreshing ?? false,
      onEndReachedThreshold: this.onEndReachedThreshold ?? 0.5,
      testID: this.testID ?? null,
    };
  }

  private serializeData(data: T[]): SerializedItem<T>[] {
    return data.map((item, index) => ({
      key: this.keyExtractor ? this.keyExtractor(item, index) : String(index),
      data: item,
    }));
  }

  private registerEventListeners(): void {
    if (!this.viewId) return;

    this.bridgeService.on<ScrollEvent>('scroll').subscribe((event) => {
      if (event.target === this.viewId) {
        this.scroll.emit(event);
      }
    });

    this.bridgeService.on<{ distanceFromEnd: number }>('endReached').subscribe((event) => {
      this.endReached.emit(event);
    });

    this.bridgeService.on<void>('refresh').subscribe(() => {
      this.refresh.emit();
    });

    this.bridgeService
      .on<{ viewableItems: ViewToken<T>[]; changed: ViewToken<T>[] }>('viewableItemsChanged')
      .subscribe((event) => {
        this.viewableItemsChanged.emit(event);
      });
  }

  /**
   * Scroll to a specific index
   */
  async scrollToIndex(params: {
    index: number;
    animated?: boolean;
    viewOffset?: number;
    viewPosition?: number;
  }): Promise<void> {
    if (!this.viewId) return;

    await this.bridgeService.send('scrollToIndex', {
      viewId: this.viewId,
      index: params.index,
      animated: params.animated ?? true,
      viewOffset: params.viewOffset ?? 0,
      viewPosition: params.viewPosition ?? 0,
    });
  }

  /**
   * Scroll to a specific item
   */
  async scrollToItem(params: {
    item: T;
    animated?: boolean;
    viewPosition?: number;
  }): Promise<void> {
    const index = this.data.indexOf(params.item);
    if (index >= 0) {
      await this.scrollToIndex({
        index,
        animated: params.animated,
        viewPosition: params.viewPosition,
      });
    }
  }

  /**
   * Scroll to a specific offset
   */
  async scrollToOffset(params: { offset: number; animated?: boolean }): Promise<void> {
    if (!this.viewId) return;

    await this.bridgeService.send('scrollToOffset', {
      viewId: this.viewId,
      offset: params.offset,
      animated: params.animated ?? true,
    });
  }

  /**
   * Scroll to the end
   */
  async scrollToEnd(params?: { animated?: boolean }): Promise<void> {
    if (!this.viewId) return;

    await this.bridgeService.send('scrollToEnd', {
      viewId: this.viewId,
      animated: params?.animated ?? true,
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

  /**
   * Record interaction (for viewability)
   */
  recordInteraction(): void {
    // Records user interaction for viewability purposes
  }

  getViewId(): string | null {
    return this.viewId;
  }
}
