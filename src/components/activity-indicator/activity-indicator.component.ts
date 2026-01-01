import {
  Component,
  Input,
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
 * Activity indicator size
 */
export type ActivityIndicatorSize = 'small' | 'large' | number;

/**
 * ActivityIndicator Component
 *
 * Displays a circular loading indicator.
 * Maps to Android's ProgressBar.
 *
 * @example
 * ```html
 * <android-activity-indicator
 *   [animating]="isLoading"
 *   size="large"
 *   color="#2196F3">
 * </android-activity-indicator>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.widget.ProgressBar',
  hasChildren: false,
  events: [],
})
@Component({
  selector: 'android-activity-indicator',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ActivityIndicatorComponent implements OnInit, OnDestroy, OnChanges {
  private viewId: string | null = null;

  // Animation
  @Input() animating?: boolean;

  // Appearance
  @Input() color?: string;
  @Input() size?: ActivityIndicatorSize;

  // Style
  @Input() style?: ViewStyle;

  // Visibility
  @Input() hidesWhenStopped?: boolean;

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;

  // Test
  @Input() testID?: string;

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    this.viewId = await this.bridgeService.createView('ActivityIndicator', this.getProps());
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
      void this.bridgeService.removeView(this.viewId);
    }
  }

  private getProps(): ViewProps {
    const sizeValue = this.getSizeValue();

    return {
      animating: this.animating ?? true,
      color: this.color ?? '#999999',
      size: sizeValue,
      style: {
        ...this.style,
        width: sizeValue,
        height: sizeValue,
      },
      hidesWhenStopped: this.hidesWhenStopped ?? true,
      accessible: this.accessible ?? true,
      accessibilityLabel: this.accessibilityLabel ?? 'Loading',
      testID: this.testID,
    };
  }

  private getSizeValue(): number {
    if (typeof this.size === 'number') {
      return this.size;
    }

    switch (this.size) {
      case 'large':
        return 36;
      case 'small':
      default:
        return 20;
    }
  }

  getViewId(): string | null {
    return this.viewId;
  }
}
