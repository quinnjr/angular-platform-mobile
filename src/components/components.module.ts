import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Components
import { ViewComponent } from './view/view.component';
import { TextComponent } from './text/text.component';
import { ScrollViewComponent } from './scroll-view/scroll-view.component';
import { ImageComponent } from './image/image.component';
import { ButtonComponent } from './button/button.component';
import { TextInputComponent } from './text-input/text-input.component';
import {
  TouchableComponent,
  TouchableHighlightComponent,
  TouchableWithoutFeedbackComponent,
} from './touchable/touchable.component';
import { FlatListComponent } from './flat-list/flat-list.component';
import { ModalComponent } from './modal/modal.component';
import { ActivityIndicatorComponent } from './activity-indicator/activity-indicator.component';
import { SwitchComponent } from './switch/switch.component';
import { SliderComponent } from './slider/slider.component';
import { WebViewComponent } from './webview/webview.component';
import { SafeAreaViewComponent } from './safe-area-view/safe-area-view.component';
import { StatusBarComponent } from './status-bar/status-bar.component';

/**
 * All native components for export
 */
const COMPONENTS = [
  ViewComponent,
  TextComponent,
  ScrollViewComponent,
  ImageComponent,
  ButtonComponent,
  TextInputComponent,
  TouchableComponent,
  TouchableHighlightComponent,
  TouchableWithoutFeedbackComponent,
  FlatListComponent,
  ModalComponent,
  ActivityIndicatorComponent,
  SwitchComponent,
  SliderComponent,
  WebViewComponent,
  SafeAreaViewComponent,
  StatusBarComponent,
];

/**
 * Components Module
 *
 * Contains all native Android components for Angular.
 * Import this module to use the native components in your templates.
 *
 * @example
 * ```typescript
 * @NgModule({
 *   imports: [ComponentsModule]
 * })
 * export class FeatureModule {}
 * ```
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...COMPONENTS,
  ],
  exports: COMPONENTS,
})
export class ComponentsModule {}

/**
 * Export all components for standalone usage
 */
export {
  ViewComponent,
  TextComponent,
  ScrollViewComponent,
  ImageComponent,
  ButtonComponent,
  TextInputComponent,
  TouchableComponent,
  TouchableHighlightComponent,
  TouchableWithoutFeedbackComponent,
  FlatListComponent,
  ModalComponent,
  ActivityIndicatorComponent,
  SwitchComponent,
  SliderComponent,
  WebViewComponent,
  SafeAreaViewComponent,
  StatusBarComponent,
};
