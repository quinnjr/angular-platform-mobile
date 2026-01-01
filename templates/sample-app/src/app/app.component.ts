import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ViewComponent,
  TextComponent,
  ButtonComponent,
  ScrollViewComponent,
  SafeAreaViewComponent,
  StatusBarComponent,
  NavigationService,
  ToastService,
  AlertService,
  StyleService,
} from '@pegasusheavy/angular-platform-android';

// Screen components
import { HomeScreenComponent } from './screens/home.screen';
import { ProfileScreenComponent } from './screens/profile.screen';
import { SettingsScreenComponent } from './screens/settings.screen';
import { ComponentsScreenComponent } from './screens/components.screen';

type Screen = 'home' | 'profile' | 'settings' | 'components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ViewComponent,
    TextComponent,
    ButtonComponent,
    ScrollViewComponent,
    SafeAreaViewComponent,
    StatusBarComponent,
    HomeScreenComponent,
    ProfileScreenComponent,
    SettingsScreenComponent,
    ComponentsScreenComponent,
  ],
  template: `
    <android-status-bar
      barStyle="light-content"
      backgroundColor="#1976D2">
    </android-status-bar>

    <android-safe-area-view [style]="styles.container">
      <!-- Header -->
      <android-view [style]="styles.header">
        <android-text [style]="styles.headerTitle">
          {{ getScreenTitle() }}
        </android-text>
      </android-view>

      <!-- Content -->
      <android-view [style]="styles.content">
        @switch (currentScreen()) {
          @case ('home') {
            <app-home-screen
              (navigate)="navigateTo($event)">
            </app-home-screen>
          }
          @case ('profile') {
            <app-profile-screen>
            </app-profile-screen>
          }
          @case ('settings') {
            <app-settings-screen>
            </app-settings-screen>
          }
          @case ('components') {
            <app-components-screen>
            </app-components-screen>
          }
        }
      </android-view>

      <!-- Bottom Navigation -->
      <android-view [style]="styles.bottomNav">
        <android-touchable
          [style]="getTabStyle('home')"
          (press)="navigateTo('home')">
          <android-text [style]="getTabTextStyle('home')">🏠 Home</android-text>
        </android-touchable>

        <android-touchable
          [style]="getTabStyle('components')"
          (press)="navigateTo('components')">
          <android-text [style]="getTabTextStyle('components')">📦 Components</android-text>
        </android-touchable>

        <android-touchable
          [style]="getTabStyle('profile')"
          (press)="navigateTo('profile')">
          <android-text [style]="getTabTextStyle('profile')">👤 Profile</android-text>
        </android-touchable>

        <android-touchable
          [style]="getTabStyle('settings')"
          (press)="navigateTo('settings')">
          <android-text [style]="getTabTextStyle('settings')">⚙️ Settings</android-text>
        </android-touchable>
      </android-view>
    </android-safe-area-view>
  `,
})
export class AppComponent {
  currentScreen = signal<Screen>('home');

  styles = {
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    header: {
      backgroundColor: '#1976D2',
      paddingVertical: 16,
      paddingHorizontal: 20,
      elevation: 4,
    },
    headerTitle: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold' as const,
    },
    content: {
      flex: 1,
    },
    bottomNav: {
      flexDirection: 'row' as const,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
      paddingVertical: 8,
      elevation: 8,
    },
    tab: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: 8,
    },
    tabActive: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: 8,
      backgroundColor: '#E3F2FD',
      borderRadius: 8,
      marginHorizontal: 4,
    },
    tabText: {
      fontSize: 12,
      color: '#757575',
    },
    tabTextActive: {
      fontSize: 12,
      color: '#1976D2',
      fontWeight: 'bold' as const,
    },
  };

  constructor(
    private readonly navigation: NavigationService,
    private readonly toast: ToastService,
    private readonly alert: AlertService
  ) {}

  navigateTo(screen: Screen): void {
    this.currentScreen.set(screen);
    this.navigation.navigate(screen);
  }

  getScreenTitle(): string {
    const titles: Record<Screen, string> = {
      home: 'Angular Android Demo',
      profile: 'Profile',
      settings: 'Settings',
      components: 'Components',
    };
    return titles[this.currentScreen()];
  }

  getTabStyle(screen: Screen): object {
    return this.currentScreen() === screen ? this.styles.tabActive : this.styles.tab;
  }

  getTabTextStyle(screen: Screen): object {
    return this.currentScreen() === screen ? this.styles.tabTextActive : this.styles.tabText;
  }
}
