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
import { ModalRequestCloseEvent, LayoutEvent } from '../../types/event.types';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService } from '../../core/bridge/bridge.service';

/**
 * Animation type for modal
 */
export type ModalAnimationType = 'none' | 'slide' | 'fade';

/**
 * Presentation style for modal
 */
export type ModalPresentationStyle =
  | 'fullScreen'
  | 'pageSheet'
  | 'formSheet'
  | 'overFullScreen';

/**
 * Modal Component
 *
 * A basic modal dialog. Maps to Android's Dialog.
 * Content is rendered above the enclosing view.
 *
 * @example
 * ```html
 * <android-modal
 *   [visible]="showModal"
 *   animationType="slide"
 *   transparent
 *   (requestClose)="closeModal()">
 *
 *   <android-view [style]="modalContainer">
 *     <android-view [style]="modalContent">
 *       <android-text>Modal Content</android-text>
 *       <android-button title="Close" (press)="closeModal()">
 *       </android-button>
 *     </android-view>
 *   </android-view>
 * </android-modal>
 * ```
 */
@NativeComponent({
  nativeViewClass: 'android.app.Dialog',
  hasChildren: true,
  events: ['requestClose', 'show', 'dismiss'],
})
@Component({
  selector: 'android-modal',
  template: '<ng-content *ngIf="visible"></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ModalComponent implements OnInit, OnDestroy, OnChanges {
  private viewId: string | null = null;

  // Visibility
  @Input() visible: boolean = false;

  // Animation
  @Input() animationType?: ModalAnimationType;

  // Appearance
  @Input() transparent?: boolean;
  @Input() presentationStyle?: ModalPresentationStyle;
  @Input() statusBarTranslucent?: boolean;
  @Input() hardwareAccelerated?: boolean;

  // Style
  @Input() style?: ViewStyle;

  // Behavior
  @Input() supportedOrientations?: Array<
    | 'portrait'
    | 'portrait-upside-down'
    | 'landscape'
    | 'landscape-left'
    | 'landscape-right'
  >;

  // Accessibility
  @Input() accessible?: boolean;
  @Input() accessibilityLabel?: string;
  @Input() accessibilityViewIsModal?: boolean;

  // Test
  @Input() testID?: string;

  // Events
  @Output() requestClose = new EventEmitter<ModalRequestCloseEvent>();
  @Output() show = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();
  @Output() orientationChange = new EventEmitter<{ orientation: string }>();
  @Output() layout = new EventEmitter<LayoutEvent>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    if (this.visible) {
      await this.showModal();
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['visible']) {
      if (this.visible) {
        await this.showModal();
      } else {
        await this.hideModal();
      }
    } else if (this.viewId) {
      const props: Record<string, any> = {};

      for (const [key, change] of Object.entries(changes)) {
        if (!change.firstChange && key !== 'visible') {
          props[key] = change.currentValue;
        }
      }

      if (Object.keys(props).length > 0) {
        await this.bridgeService.updateView(this.viewId, props);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.viewId) {
      this.hideModal();
    }
  }

  private async showModal(): Promise<void> {
    if (this.viewId) return;

    this.viewId = await this.bridgeService.createView('Modal', this.getProps());
    this.registerEventListeners();

    await this.bridgeService.send('showModal', { viewId: this.viewId });
    this.show.emit();
  }

  private async hideModal(): Promise<void> {
    if (!this.viewId) return;

    await this.bridgeService.send('hideModal', { viewId: this.viewId });
    await this.bridgeService.removeView(this.viewId);
    this.viewId = null;
    this.dismiss.emit();
  }

  private getProps(): Record<string, any> {
    return {
      visible: this.visible,
      animationType: this.animationType ?? 'none',
      transparent: this.transparent ?? false,
      presentationStyle: this.presentationStyle ?? 'fullScreen',
      statusBarTranslucent: this.statusBarTranslucent ?? false,
      hardwareAccelerated: this.hardwareAccelerated ?? true,
      style: this.style,
      supportedOrientations: this.supportedOrientations ?? ['portrait'],
      accessible: this.accessible ?? true,
      accessibilityLabel: this.accessibilityLabel,
      accessibilityViewIsModal: this.accessibilityViewIsModal ?? true,
      testID: this.testID,
    };
  }

  private registerEventListeners(): void {
    if (!this.viewId) return;

    this.bridgeService.on<ModalRequestCloseEvent>('requestClose').subscribe((event) => {
      if (event.target === this.viewId) {
        this.requestClose.emit(event);
      }
    });

    this.bridgeService.on<{ orientation: string }>('orientationChange').subscribe((event) => {
      this.orientationChange.emit(event);
    });
  }

  /**
   * Dismiss the modal programmatically
   */
  async close(): Promise<void> {
    if (this.visible) {
      await this.hideModal();
    }
  }

  getViewId(): string | null {
    return this.viewId;
  }
}
