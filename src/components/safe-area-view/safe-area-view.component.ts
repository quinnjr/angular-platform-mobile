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
import { LayoutEvent } from '../../types/event.types';
import { EdgeInsets } from '../../types/native.types';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService, ViewProps } from '../../core/bridge/bridge.service';

/**
 * Safe area edges
 */
export type SafeAreaEdge = 'top' | 'right' | 'bottom' | 'left';

/**
 * SafeAreaView Component
 *
 * A view that respects the safe area boundaries (status bar, navigation bar, etc.).
 * Automatically applies padding to avoid system UI elements.
 *
 * @example
 * ```html
 * <android-safe-area-view [style]="{ flex: 1, backgroundColor: '#ffffff' }">
 *   <android-view>
 *     <android-text>Content in safe area</android-text>
 *   </android-view>
 * </android-safe-area-view>
 * ```
 *
 * @example
 * ```html
 * <!-- Only apply safe area to specific edges -->
 * <android-safe-area-view
 *   [edges]="['top', 'bottom']"
 *   [style]="containerStyle">
 *   <ng-content></ng-content>
 * </android-safe-area-view>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.view.ViewGroup',
  hasChildren: true,
  events: ['insetsChange', 'layout'],
})
@Component({
  selector: 'android-safe-area-view',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SafeAreaViewComponent implements OnInit, OnDestroy, OnChanges {
  private viewId: string | null = null;
  private currentInsets: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };

  // Style
  @Input() style?: ViewStyle;

  // Which edges to apply safe area padding to
  @Input() edges?: SafeAreaEdge[];

  // Mode: 'padding' adds padding, 'margin' adds margin
  @Input() mode?: 'padding' | 'margin';

  // Minimum insets (if system insets are less, use these)
  @Input() minInsets?: Partial<EdgeInsets>;

  // Emit changes when safe area is used
  @Input() emitInsetChanges?: boolean;

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;

  // Test
  @Input() testID?: string;
  @Input() nativeID?: string;

  // Events
  @Output() insetsChange = new EventEmitter<EdgeInsets>();
  @Output() layout = new EventEmitter<LayoutEvent>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    // Get initial safe area insets
    await this.fetchSafeAreaInsets();

    this.viewId = await this.bridgeService.createView('SafeAreaView', this.getProps());
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
      void this.bridgeService.updateView(this.viewId, this.getProps());
    }
  }

  ngOnDestroy(): void {
    if (this.viewId) {
      void this.bridgeService.removeView(this.viewId);
    }
  }

  private async fetchSafeAreaInsets(): Promise<void> {
    try {
      this.currentInsets = await this.bridgeService.request<EdgeInsets>('getSafeAreaInsets', {});
    } catch (error) {
      console.warn('[SafeAreaView] Failed to get safe area insets, using defaults');
      this.currentInsets = { top: 24, right: 0, bottom: 0, left: 0 }; // Default for status bar
    }
  }

  private getProps(): ViewProps {
    const insets = this.getAppliedInsets();
    const mode = this.mode ?? 'padding';

    const styleWithInsets: ViewStyle = {
      ...this.style,
    };

    if (mode === 'padding') {
      if (insets.top > 0) styleWithInsets.paddingTop = (this.style?.paddingTop as number || 0) + insets.top;
      if (insets.right > 0) styleWithInsets.paddingRight = (this.style?.paddingRight as number || 0) + insets.right;
      if (insets.bottom > 0) styleWithInsets.paddingBottom = (this.style?.paddingBottom as number || 0) + insets.bottom;
      if (insets.left > 0) styleWithInsets.paddingLeft = (this.style?.paddingLeft as number || 0) + insets.left;
    } else {
      if (insets.top > 0) styleWithInsets.marginTop = (this.style?.marginTop as number || 0) + insets.top;
      if (insets.right > 0) styleWithInsets.marginRight = (this.style?.marginRight as number || 0) + insets.right;
      if (insets.bottom > 0) styleWithInsets.marginBottom = (this.style?.marginBottom as number || 0) + insets.bottom;
      if (insets.left > 0) styleWithInsets.marginLeft = (this.style?.marginLeft as number || 0) + insets.left;
    }

    return {
      style: styleWithInsets,
      accessible: this.accessible,
      accessibilityLabel: this.accessibilityLabel,
      testID: this.testID,
      nativeID: this.nativeID,
    };
  }

  private getAppliedInsets(): EdgeInsets {
    const edges = this.edges ?? ['top', 'right', 'bottom', 'left'];
    const minInsets = this.minInsets ?? {};

    return {
      top: edges.includes('top')
        ? Math.max(this.currentInsets.top, minInsets.top ?? 0)
        : 0,
      right: edges.includes('right')
        ? Math.max(this.currentInsets.right, minInsets.right ?? 0)
        : 0,
      bottom: edges.includes('bottom')
        ? Math.max(this.currentInsets.bottom, minInsets.bottom ?? 0)
        : 0,
      left: edges.includes('left')
        ? Math.max(this.currentInsets.left, minInsets.left ?? 0)
        : 0,
    };
  }

  private registerEventListeners(): void {
    if (!this.viewId) return;

    // Listen for safe area inset changes
    this.bridgeService.on<EdgeInsets>('safeAreaInsetsChange').subscribe((insets) => {
      const previousInsets = this.currentInsets;
      this.currentInsets = insets;

      // Update view if insets changed
      if (
        previousInsets.top !== insets.top ||
        previousInsets.right !== insets.right ||
        previousInsets.bottom !== insets.bottom ||
        previousInsets.left !== insets.left
      ) {
        void this.bridgeService.updateView(this.viewId!, this.getProps());

        if (this.emitInsetChanges) {
          this.insetsChange.emit(this.getAppliedInsets());
        }
      }
    });

    this.bridgeService.on<LayoutEvent>('layout').subscribe((event) => {
      if (event.target === this.viewId) {
        this.layout.emit(event);
      }
    });
  }

  /**
   * Get current safe area insets
   */
  getInsets(): EdgeInsets {
    return this.getAppliedInsets();
  }

  /**
   * Force refresh of safe area insets
   */
  async refresh(): Promise<void> {
    await this.fetchSafeAreaInsets();
    if (this.viewId) {
      void this.bridgeService.updateView(this.viewId, this.getProps());
    }
  }

  getViewId(): string | null {
    return this.viewId;
  }
}
