import { Component, Output, EventEmitter } from '@angular/core';
import {
  ViewComponent,
  TextComponent,
  ButtonComponent,
  ImageComponent,
  ScrollViewComponent,
  TouchableComponent,
  ToastService,
} from '@pegasusheavy/angular-platform-android';

@Component({
  selector: 'app-home-screen',
  standalone: true,
  imports: [
    ViewComponent,
    TextComponent,
    ButtonComponent,
    ImageComponent,
    ScrollViewComponent,
    TouchableComponent,
  ],
  template: `
    <android-scroll-view [style]="styles.container">
      <!-- Hero Section -->
      <android-view [style]="styles.hero">
        <android-text [style]="styles.heroTitle">
          Welcome to Angular Android! 🚀
        </android-text>
        <android-text [style]="styles.heroSubtitle">
          Build native Android apps with Angular
        </android-text>
      </android-view>

      <!-- Quick Actions -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Quick Actions</android-text>

        <android-view [style]="styles.cardRow">
          <android-touchable
            [style]="styles.card"
            (press)="onShowComponents()">
            <android-text [style]="styles.cardEmoji">📦</android-text>
            <android-text [style]="styles.cardTitle">Components</android-text>
            <android-text [style]="styles.cardDescription">
              Explore UI components
            </android-text>
          </android-touchable>

          <android-touchable
            [style]="styles.card"
            (press)="onShowToast()">
            <android-text [style]="styles.cardEmoji">🔔</android-text>
            <android-text [style]="styles.cardTitle">Toast</android-text>
            <android-text [style]="styles.cardDescription">
              Show notifications
            </android-text>
          </android-touchable>
        </android-view>

        <android-view [style]="styles.cardRow">
          <android-touchable
            [style]="styles.card"
            (press)="onShowAnimation()">
            <android-text [style]="styles.cardEmoji">✨</android-text>
            <android-text [style]="styles.cardTitle">Animation</android-text>
            <android-text [style]="styles.cardDescription">
              Smooth animations
            </android-text>
          </android-touchable>

          <android-touchable
            [style]="styles.card"
            (press)="onShowServices()">
            <android-text [style]="styles.cardEmoji">⚡</android-text>
            <android-text [style]="styles.cardTitle">Services</android-text>
            <android-text [style]="styles.cardDescription">
              Native APIs
            </android-text>
          </android-touchable>
        </android-view>
      </android-view>

      <!-- Features -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Features</android-text>

        <android-view [style]="styles.featureItem">
          <android-text [style]="styles.featureIcon">✅</android-text>
          <android-view [style]="styles.featureContent">
            <android-text [style]="styles.featureTitle">Native Performance</android-text>
            <android-text [style]="styles.featureDescription">
              Renders actual Android views, not web views
            </android-text>
          </android-view>
        </android-view>

        <android-view [style]="styles.featureItem">
          <android-text [style]="styles.featureIcon">✅</android-text>
          <android-view [style]="styles.featureContent">
            <android-text [style]="styles.featureTitle">Angular Powered</android-text>
            <android-text [style]="styles.featureDescription">
              Use components, services, and dependency injection
            </android-text>
          </android-view>
        </android-view>

        <android-view [style]="styles.featureItem">
          <android-text [style]="styles.featureIcon">✅</android-text>
          <android-view [style]="styles.featureContent">
            <android-text [style]="styles.featureTitle">Hot Reload</android-text>
            <android-text [style]="styles.featureDescription">
              Fast development with instant updates
            </android-text>
          </android-view>
        </android-view>

        <android-view [style]="styles.featureItem">
          <android-text [style]="styles.featureIcon">✅</android-text>
          <android-view [style]="styles.featureContent">
            <android-text [style]="styles.featureTitle">TypeScript</android-text>
            <android-text [style]="styles.featureDescription">
              Full TypeScript support with type definitions
            </android-text>
          </android-view>
        </android-view>
      </android-view>

      <!-- CTA -->
      <android-view [style]="styles.ctaSection">
        <android-button
          title="View Components"
          color="#1976D2"
          (press)="onShowComponents()">
        </android-button>
      </android-view>
    </android-scroll-view>
  `,
})
export class HomeScreenComponent {
  @Output() navigate = new EventEmitter<string>();

  styles = {
    container: {
      flex: 1,
    },
    hero: {
      backgroundColor: '#1976D2',
      padding: 24,
      alignItems: 'center' as const,
    },
    heroTitle: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: 'bold' as const,
      textAlign: 'center' as const,
    },
    heroSubtitle: {
      color: '#BBDEFB',
      fontSize: 16,
      marginTop: 8,
      textAlign: 'center' as const,
    },
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: '#333333',
      marginBottom: 12,
    },
    cardRow: {
      flexDirection: 'row' as const,
      marginBottom: 12,
    },
    card: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
      alignItems: 'center' as const,
      elevation: 2,
    },
    cardEmoji: {
      fontSize: 32,
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 'bold' as const,
      color: '#333333',
    },
    cardDescription: {
      fontSize: 12,
      color: '#757575',
      textAlign: 'center' as const,
      marginTop: 4,
    },
    featureItem: {
      flexDirection: 'row' as const,
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      alignItems: 'center' as const,
    },
    featureIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 14,
      fontWeight: 'bold' as const,
      color: '#333333',
    },
    featureDescription: {
      fontSize: 12,
      color: '#757575',
      marginTop: 2,
    },
    ctaSection: {
      padding: 24,
      alignItems: 'center' as const,
    },
  };

  constructor(private readonly toast: ToastService) {}

  onShowComponents(): void {
    this.navigate.emit('components');
  }

  onShowToast(): void {
    this.toast.success('Hello from Angular Android! 🎉');
  }

  onShowAnimation(): void {
    this.toast.info('Animations coming soon!');
  }

  onShowServices(): void {
    this.toast.info('Explore native APIs in the Components tab');
  }
}
