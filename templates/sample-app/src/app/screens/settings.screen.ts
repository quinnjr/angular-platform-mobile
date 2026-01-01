import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ViewComponent,
  TextComponent,
  ScrollViewComponent,
  TouchableComponent,
  SwitchComponent,
  ToastService,
  AlertService,
  LinkingService,
  StorageService,
} from '@pegasusheavy/angular-platform-android';

@Component({
  selector: 'app-settings-screen',
  standalone: true,
  imports: [
    FormsModule,
    ViewComponent,
    TextComponent,
    ScrollViewComponent,
    TouchableComponent,
    SwitchComponent,
  ],
  template: `
    <android-scroll-view [style]="styles.container">
      <!-- Preferences -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Preferences</android-text>

        <android-view [style]="styles.settingItem">
          <android-view [style]="styles.settingContent">
            <android-text [style]="styles.settingTitle">Dark Mode</android-text>
            <android-text [style]="styles.settingDescription">
              Enable dark theme across the app
            </android-text>
          </android-view>
          <android-switch
            [(ngModel)]="settings.darkMode"
            thumbColor="#1976D2"
            (valueChange)="onSettingChange('darkMode', $event)">
          </android-switch>
        </android-view>

        <android-view [style]="styles.settingItem">
          <android-view [style]="styles.settingContent">
            <android-text [style]="styles.settingTitle">Push Notifications</android-text>
            <android-text [style]="styles.settingDescription">
              Receive push notifications
            </android-text>
          </android-view>
          <android-switch
            [(ngModel)]="settings.pushNotifications"
            thumbColor="#1976D2"
            (valueChange)="onSettingChange('pushNotifications', $event)">
          </android-switch>
        </android-view>

        <android-view [style]="styles.settingItem">
          <android-view [style]="styles.settingContent">
            <android-text [style]="styles.settingTitle">Email Notifications</android-text>
            <android-text [style]="styles.settingDescription">
              Receive email updates
            </android-text>
          </android-view>
          <android-switch
            [(ngModel)]="settings.emailNotifications"
            thumbColor="#1976D2"
            (valueChange)="onSettingChange('emailNotifications', $event)">
          </android-switch>
        </android-view>

        <android-view [style]="styles.settingItem">
          <android-view [style]="styles.settingContent">
            <android-text [style]="styles.settingTitle">Sound Effects</android-text>
            <android-text [style]="styles.settingDescription">
              Play sounds for actions
            </android-text>
          </android-view>
          <android-switch
            [(ngModel)]="settings.soundEffects"
            thumbColor="#1976D2"
            (valueChange)="onSettingChange('soundEffects', $event)">
          </android-switch>
        </android-view>
      </android-view>

      <!-- Support -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Support</android-text>

        <android-touchable
          [style]="styles.menuItem"
          (press)="onOpenDocs()">
          <android-text [style]="styles.menuIcon">📚</android-text>
          <android-view [style]="styles.menuContent">
            <android-text [style]="styles.menuTitle">Documentation</android-text>
            <android-text [style]="styles.menuDescription">Read the docs</android-text>
          </android-view>
          <android-text [style]="styles.menuArrow">›</android-text>
        </android-touchable>

        <android-touchable
          [style]="styles.menuItem"
          (press)="onOpenGitHub()">
          <android-text [style]="styles.menuIcon">💻</android-text>
          <android-view [style]="styles.menuContent">
            <android-text [style]="styles.menuTitle">GitHub</android-text>
            <android-text [style]="styles.menuDescription">View source code</android-text>
          </android-view>
          <android-text [style]="styles.menuArrow">›</android-text>
        </android-touchable>

        <android-touchable
          [style]="styles.menuItem"
          (press)="onContactSupport()">
          <android-text [style]="styles.menuIcon">📧</android-text>
          <android-view [style]="styles.menuContent">
            <android-text [style]="styles.menuTitle">Contact Support</android-text>
            <android-text [style]="styles.menuDescription">Get help from our team</android-text>
          </android-view>
          <android-text [style]="styles.menuArrow">›</android-text>
        </android-touchable>
      </android-view>

      <!-- Data -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Data</android-text>

        <android-touchable
          [style]="styles.menuItem"
          (press)="onClearCache()">
          <android-text [style]="styles.menuIcon">🗑️</android-text>
          <android-view [style]="styles.menuContent">
            <android-text [style]="styles.menuTitle">Clear Cache</android-text>
            <android-text [style]="styles.menuDescription">Free up storage space</android-text>
          </android-view>
          <android-text [style]="styles.menuArrow">›</android-text>
        </android-touchable>

        <android-touchable
          [style]="styles.menuItemDanger"
          (press)="onResetSettings()">
          <android-text [style]="styles.menuIcon">⚠️</android-text>
          <android-view [style]="styles.menuContent">
            <android-text [style]="styles.menuTitleDanger">Reset Settings</android-text>
            <android-text [style]="styles.menuDescription">Restore default settings</android-text>
          </android-view>
          <android-text [style]="styles.menuArrow">›</android-text>
        </android-touchable>
      </android-view>

      <!-- About -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">About</android-text>

        <android-view [style]="styles.aboutItem">
          <android-text [style]="styles.aboutLabel">Version</android-text>
          <android-text [style]="styles.aboutValue">1.0.0</android-text>
        </android-view>

        <android-view [style]="styles.aboutItem">
          <android-text [style]="styles.aboutLabel">Build</android-text>
          <android-text [style]="styles.aboutValue">2026.01.01</android-text>
        </android-view>

        <android-view [style]="styles.aboutItem">
          <android-text [style]="styles.aboutLabel">Platform</android-text>
          <android-text [style]="styles.aboutValue">Angular Platform Android</android-text>
        </android-view>
      </android-view>

      <!-- Footer -->
      <android-view [style]="styles.footer">
        <android-text [style]="styles.footerText">
          © 2026 Pegasus Heavy Industries LLC
        </android-text>
        <android-text [style]="styles.footerSubtext">
          Made with ❤️ using Angular
        </android-text>
      </android-view>

      <android-view [style]="{ height: 24 }"></android-view>
    </android-scroll-view>
  `,
})
export class SettingsScreenComponent {
  settings = {
    darkMode: false,
    pushNotifications: true,
    emailNotifications: true,
    soundEffects: true,
  };

  styles = {
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    section: {
      backgroundColor: '#FFFFFF',
      marginTop: 12,
      paddingVertical: 8,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold' as const,
      color: '#757575',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    settingItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      color: '#333333',
    },
    settingDescription: {
      fontSize: 12,
      color: '#757575',
      marginTop: 2,
    },
    menuItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    menuItemDanger: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    menuIcon: {
      fontSize: 24,
      width: 40,
    },
    menuContent: {
      flex: 1,
    },
    menuTitle: {
      fontSize: 16,
      color: '#333333',
    },
    menuTitleDanger: {
      fontSize: 16,
      color: '#F44336',
    },
    menuDescription: {
      fontSize: 12,
      color: '#757575',
      marginTop: 2,
    },
    menuArrow: {
      fontSize: 24,
      color: '#BDBDBD',
    },
    aboutItem: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    aboutLabel: {
      fontSize: 14,
      color: '#757575',
    },
    aboutValue: {
      fontSize: 14,
      color: '#333333',
    },
    footer: {
      alignItems: 'center' as const,
      paddingVertical: 24,
    },
    footerText: {
      fontSize: 12,
      color: '#757575',
    },
    footerSubtext: {
      fontSize: 12,
      color: '#BDBDBD',
      marginTop: 4,
    },
  };

  constructor(
    private readonly toast: ToastService,
    private readonly alert: AlertService,
    private readonly linking: LinkingService,
    private readonly storage: StorageService
  ) {}

  async onSettingChange(setting: string, value: boolean): Promise<void> {
    await this.storage.setItem(`setting_${setting}`, value);
    this.toast.short(`${setting} ${value ? 'enabled' : 'disabled'}`);
  }

  async onOpenDocs(): Promise<void> {
    await this.linking.openURL('https://github.com/PegasusHeavyIndustries/angular-platform-android');
  }

  async onOpenGitHub(): Promise<void> {
    await this.linking.openURL('https://github.com/PegasusHeavyIndustries/angular-platform-android');
  }

  async onContactSupport(): Promise<void> {
    await this.linking.email({
      to: ['support@pegasusheavy.io'],
      subject: 'Support Request',
    });
  }

  async onClearCache(): Promise<void> {
    const confirmed = await this.alert.confirm(
      'Clear Cache',
      'This will clear all cached data. Continue?'
    );

    if (confirmed) {
      await this.storage.clear();
      this.toast.success('Cache cleared!');
    }
  }

  async onResetSettings(): Promise<void> {
    const confirmed = await this.alert.confirm(
      'Reset Settings',
      'This will reset all settings to default. This action cannot be undone.'
    );

    if (confirmed) {
      this.settings = {
        darkMode: false,
        pushNotifications: true,
        emailNotifications: true,
        soundEffects: true,
      };
      await this.storage.clear();
      this.toast.success('Settings reset to defaults!');
    }
  }
}
