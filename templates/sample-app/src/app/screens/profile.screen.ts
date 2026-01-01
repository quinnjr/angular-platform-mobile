import { Component, signal } from '@angular/core';
import {
  ViewComponent,
  TextComponent,
  ImageComponent,
  ScrollViewComponent,
  TouchableComponent,
  ToastService,
  ShareService,
  ClipboardService,
} from '@pegasusheavy/angular-platform-android';

@Component({
  selector: 'app-profile-screen',
  standalone: true,
  imports: [
    ViewComponent,
    TextComponent,
    ImageComponent,
    ScrollViewComponent,
    TouchableComponent,
  ],
  template: `
    <android-scroll-view [style]="styles.container">
      <!-- Profile Header -->
      <android-view [style]="styles.header">
        <android-view [style]="styles.avatarContainer">
          <android-text [style]="styles.avatarText">JD</android-text>
        </android-view>
        <android-text [style]="styles.name">John Doe</android-text>
        <android-text [style]="styles.email">john.doe&#64;example.com</android-text>

        <android-view [style]="styles.statsRow">
          <android-view [style]="styles.statItem">
            <android-text [style]="styles.statValue">42</android-text>
            <android-text [style]="styles.statLabel">Projects</android-text>
          </android-view>
          <android-view [style]="styles.statDivider"></android-view>
          <android-view [style]="styles.statItem">
            <android-text [style]="styles.statValue">1.2K</android-text>
            <android-text [style]="styles.statLabel">Followers</android-text>
          </android-view>
          <android-view [style]="styles.statDivider"></android-view>
          <android-view [style]="styles.statItem">
            <android-text [style]="styles.statValue">384</android-text>
            <android-text [style]="styles.statLabel">Following</android-text>
          </android-view>
        </android-view>
      </android-view>

      <!-- Actions -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Quick Actions</android-text>

        <android-touchable
          [style]="styles.menuItem"
          (press)="onShareProfile()">
          <android-text [style]="styles.menuIcon">📤</android-text>
          <android-view [style]="styles.menuContent">
            <android-text [style]="styles.menuTitle">Share Profile</android-text>
            <android-text [style]="styles.menuDescription">Share your profile with others</android-text>
          </android-view>
          <android-text [style]="styles.menuArrow">›</android-text>
        </android-touchable>

        <android-touchable
          [style]="styles.menuItem"
          (press)="onCopyEmail()">
          <android-text [style]="styles.menuIcon">📋</android-text>
          <android-view [style]="styles.menuContent">
            <android-text [style]="styles.menuTitle">Copy Email</android-text>
            <android-text [style]="styles.menuDescription">Copy email to clipboard</android-text>
          </android-view>
          <android-text [style]="styles.menuArrow">›</android-text>
        </android-touchable>

        <android-touchable
          [style]="styles.menuItem"
          (press)="onEditProfile()">
          <android-text [style]="styles.menuIcon">✏️</android-text>
          <android-view [style]="styles.menuContent">
            <android-text [style]="styles.menuTitle">Edit Profile</android-text>
            <android-text [style]="styles.menuDescription">Update your information</android-text>
          </android-view>
          <android-text [style]="styles.menuArrow">›</android-text>
        </android-touchable>
      </android-view>

      <!-- Account -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Account</android-text>

        <android-touchable [style]="styles.menuItem">
          <android-text [style]="styles.menuIcon">🔔</android-text>
          <android-view [style]="styles.menuContent">
            <android-text [style]="styles.menuTitle">Notifications</android-text>
            <android-text [style]="styles.menuDescription">Manage notification settings</android-text>
          </android-view>
          <android-text [style]="styles.menuArrow">›</android-text>
        </android-touchable>

        <android-touchable [style]="styles.menuItem">
          <android-text [style]="styles.menuIcon">🔒</android-text>
          <android-view [style]="styles.menuContent">
            <android-text [style]="styles.menuTitle">Privacy</android-text>
            <android-text [style]="styles.menuDescription">Manage privacy settings</android-text>
          </android-view>
          <android-text [style]="styles.menuArrow">›</android-text>
        </android-touchable>

        <android-touchable [style]="styles.menuItem">
          <android-text [style]="styles.menuIcon">🔑</android-text>
          <android-view [style]="styles.menuContent">
            <android-text [style]="styles.menuTitle">Security</android-text>
            <android-text [style]="styles.menuDescription">Password and authentication</android-text>
          </android-view>
          <android-text [style]="styles.menuArrow">›</android-text>
        </android-touchable>
      </android-view>

      <android-view [style]="{ height: 24 }"></android-view>
    </android-scroll-view>
  `,
})
export class ProfileScreenComponent {
  styles = {
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    header: {
      backgroundColor: '#FFFFFF',
      alignItems: 'center' as const,
      paddingVertical: 24,
      paddingHorizontal: 16,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#1976D2',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: 'bold' as const,
    },
    name: {
      fontSize: 22,
      fontWeight: 'bold' as const,
      color: '#333333',
      marginTop: 12,
    },
    email: {
      fontSize: 14,
      color: '#757575',
      marginTop: 4,
    },
    statsRow: {
      flexDirection: 'row' as const,
      marginTop: 20,
      paddingHorizontal: 20,
    },
    statItem: {
      flex: 1,
      alignItems: 'center' as const,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: '#333333',
    },
    statLabel: {
      fontSize: 12,
      color: '#757575',
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      height: '100%' as const,
      backgroundColor: '#E0E0E0',
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
    menuItem: {
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
    menuDescription: {
      fontSize: 12,
      color: '#757575',
      marginTop: 2,
    },
    menuArrow: {
      fontSize: 24,
      color: '#BDBDBD',
    },
  };

  constructor(
    private readonly toast: ToastService,
    private readonly share: ShareService,
    private readonly clipboard: ClipboardService
  ) {}

  async onShareProfile(): Promise<void> {
    await this.share.share({
      title: 'Check out my profile!',
      message: 'John Doe - Software Developer\nhttps://example.com/johndoe',
    });
  }

  async onCopyEmail(): Promise<void> {
    await this.clipboard.setString('john.doe@example.com');
    this.toast.success('Email copied to clipboard!');
  }

  onEditProfile(): void {
    this.toast.info('Edit profile feature coming soon!');
  }
}
