import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ComponentDoc {
  name: string;
  path: string;
  description: string;
  icon: string;
  platforms: ('android' | 'ios')[];
}

@Component({
  selector: 'app-components',
  imports: [RouterLink],
  templateUrl: './components.html',
  styleUrl: './components.scss',
})
export class ComponentsPage {
  protected readonly components: ComponentDoc[] = [
    {
      name: 'View',
      path: 'view',
      description: 'The fundamental building block for UI. Maps to native ViewGroup/UIView.',
      icon: '📦',
      platforms: ['android', 'ios'],
    },
    {
      name: 'Text',
      path: 'text',
      description: 'Display text content. Supports styling, nesting, and accessibility.',
      icon: '📝',
      platforms: ['android', 'ios'],
    },
    {
      name: 'Image',
      path: 'image',
      description: 'Display images from various sources with caching and loading states.',
      icon: '🖼️',
      platforms: ['android', 'ios'],
    },
    {
      name: 'Button',
      path: 'button',
      description: 'Touchable button with press feedback and accessibility support.',
      icon: '🔘',
      platforms: ['android', 'ios'],
    },
    {
      name: 'TextInput',
      path: 'text-input',
      description: 'Text input field with keyboard handling and validation.',
      icon: '⌨️',
      platforms: ['android', 'ios'],
    },
    {
      name: 'ScrollView',
      path: 'scroll-view',
      description: 'Scrollable container for content that exceeds screen bounds.',
      icon: '📜',
      platforms: ['android', 'ios'],
    },
    {
      name: 'FlatList',
      path: 'flat-list',
      description: 'High-performance list for large datasets with virtualization.',
      icon: '📋',
      platforms: ['android', 'ios'],
    },
    {
      name: 'Modal',
      path: 'modal',
      description: 'Present content above the current view as an overlay.',
      icon: '🪟',
      platforms: ['android', 'ios'],
    },
    {
      name: 'WebView',
      path: 'webview',
      description: 'Embed web content within your native app.',
      icon: '🌐',
      platforms: ['android', 'ios'],
    },
    {
      name: 'Switch',
      path: 'switch',
      description: 'Toggle switch for boolean values.',
      icon: '🔀',
      platforms: ['android', 'ios'],
    },
    {
      name: 'Slider',
      path: 'slider',
      description: 'Slider for selecting values from a range.',
      icon: '🎚️',
      platforms: ['android', 'ios'],
    },
    {
      name: 'StatusBar',
      path: 'status-bar',
      description: 'Control the device status bar appearance.',
      icon: '📶',
      platforms: ['android', 'ios'],
    },
    {
      name: 'ActivityIndicator',
      path: 'activity-indicator',
      description: 'Loading spinner for indicating progress.',
      icon: '⏳',
      platforms: ['android', 'ios'],
    },
  ];
}
