import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  title: string;
  path: string;
  icon?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected sidebarOpen = true;

  protected readonly navigation: NavItem[] = [
    { title: 'Home', path: '/', icon: '🏠' },
    { title: 'Getting Started', path: '/getting-started', icon: '🚀' },
    {
      title: 'Components',
      path: '/components',
      icon: '📦',
      children: [
        { title: 'View', path: '/components/view' },
        { title: 'Text', path: '/components/text' },
        { title: 'Image', path: '/components/image' },
        { title: 'Button', path: '/components/button' },
        { title: 'TextInput', path: '/components/text-input' },
        { title: 'ScrollView', path: '/components/scroll-view' },
        { title: 'FlatList', path: '/components/flat-list' },
        { title: 'Modal', path: '/components/modal' },
        { title: 'WebView', path: '/components/webview' },
        { title: 'Switch', path: '/components/switch' },
        { title: 'Slider', path: '/components/slider' },
        { title: 'StatusBar', path: '/components/status-bar' },
      ],
    },
    {
      title: 'Services',
      path: '/services',
      icon: '⚙️',
      children: [
        { title: 'NavigationService', path: '/services/navigation' },
        { title: 'StorageService', path: '/services/storage' },
        { title: 'DeviceService', path: '/services/device' },
        { title: 'PermissionsService', path: '/services/permissions' },
        { title: 'AlertService', path: '/services/alert' },
        { title: 'LinkingService', path: '/services/linking' },
        { title: 'ClipboardService', path: '/services/clipboard' },
        { title: 'ShareService', path: '/services/share' },
        { title: 'ToastService', path: '/services/toast' },
        { title: 'HapticService', path: '/services/haptic' },
        { title: 'BiometricService', path: '/services/biometric' },
      ],
    },
    { title: 'Styling', path: '/styling', icon: '🎨' },
    { title: 'Animation', path: '/animation', icon: '✨' },
    { title: 'Platform APIs', path: '/platform', icon: '📱' },
    { title: 'Native Bridge', path: '/bridge', icon: '🔌' },
    { title: 'CLI Reference', path: '/cli', icon: '💻' },
  ];

  protected expandedSections = new Set<string>(['Components', 'Services']);

  toggleSection(title: string): void {
    if (this.expandedSections.has(title)) {
      this.expandedSections.delete(title);
    } else {
      this.expandedSections.add(title);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
