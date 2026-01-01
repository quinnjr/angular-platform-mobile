import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ViewComponent,
  TextComponent,
  ButtonComponent,
  TextInputComponent,
  SwitchComponent,
  SliderComponent,
  ScrollViewComponent,
  TouchableComponent,
  ActivityIndicatorComponent,
  ImageComponent,
  ToastService,
  AlertService,
} from '@pegasusheavy/angular-platform-android';

@Component({
  selector: 'app-components-screen',
  standalone: true,
  imports: [
    FormsModule,
    ViewComponent,
    TextComponent,
    ButtonComponent,
    TextInputComponent,
    SwitchComponent,
    SliderComponent,
    ScrollViewComponent,
    TouchableComponent,
    ActivityIndicatorComponent,
    ImageComponent,
  ],
  template: `
    <android-scroll-view [style]="styles.container">
      <!-- Buttons Section -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Buttons</android-text>

        <android-view [style]="styles.row">
          <android-button
            title="Primary"
            color="#1976D2"
            (press)="onButtonPress('Primary')">
          </android-button>

          <android-button
            title="Success"
            color="#4CAF50"
            (press)="onButtonPress('Success')">
          </android-button>

          <android-button
            title="Danger"
            color="#F44336"
            (press)="onButtonPress('Danger')">
          </android-button>
        </android-view>

        <android-touchable
          [style]="styles.customButton"
          (press)="onButtonPress('Custom Touchable')">
          <android-text [style]="styles.customButtonText">
            Custom Touchable Button
          </android-text>
        </android-touchable>
      </android-view>

      <!-- Text Inputs Section -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Text Inputs</android-text>

        <android-text-input
          [(ngModel)]="textValue"
          placeholder="Enter text..."
          [style]="styles.input"
          (changeText)="onTextChange($event)">
        </android-text-input>

        <android-text-input
          placeholder="Email address"
          keyboardType="email-address"
          [style]="styles.input">
        </android-text-input>

        <android-text-input
          placeholder="Password"
          [secureTextEntry]="true"
          [style]="styles.input">
        </android-text-input>

        <android-text-input
          placeholder="Multiline input..."
          [multiline]="true"
          [numberOfLines]="4"
          [style]="styles.multilineInput">
        </android-text-input>
      </android-view>

      <!-- Switch & Slider Section -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Switch & Slider</android-text>

        <android-view [style]="styles.switchRow">
          <android-text [style]="styles.label">Dark Mode</android-text>
          <android-switch
            [(ngModel)]="darkMode"
            thumbColor="#1976D2"
            (valueChange)="onSwitchChange($event)">
          </android-switch>
        </android-view>

        <android-view [style]="styles.switchRow">
          <android-text [style]="styles.label">Notifications</android-text>
          <android-switch
            [(ngModel)]="notifications"
            thumbColor="#4CAF50">
          </android-switch>
        </android-view>

        <android-view [style]="styles.sliderContainer">
          <android-text [style]="styles.label">
            Volume: {{ Math.round(volume) }}%
          </android-text>
          <android-slider
            [(ngModel)]="volume"
            [minimumValue]="0"
            [maximumValue]="100"
            [step]="1"
            minimumTrackTintColor="#1976D2"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#1976D2">
          </android-slider>
        </android-view>

        <android-view [style]="styles.sliderContainer">
          <android-text [style]="styles.label">
            Brightness: {{ Math.round(brightness) }}%
          </android-text>
          <android-slider
            [(ngModel)]="brightness"
            [minimumValue]="0"
            [maximumValue]="100"
            minimumTrackTintColor="#FF9800"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#FF9800">
          </android-slider>
        </android-view>
      </android-view>

      <!-- Loading Indicators -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Activity Indicators</android-text>

        <android-view [style]="styles.indicatorRow">
          <android-view [style]="styles.indicatorItem">
            <android-activity-indicator
              size="small"
              color="#1976D2">
            </android-activity-indicator>
            <android-text [style]="styles.indicatorLabel">Small</android-text>
          </android-view>

          <android-view [style]="styles.indicatorItem">
            <android-activity-indicator
              size="large"
              color="#4CAF50">
            </android-activity-indicator>
            <android-text [style]="styles.indicatorLabel">Large</android-text>
          </android-view>

          <android-view [style]="styles.indicatorItem">
            <android-activity-indicator
              [size]="48"
              color="#F44336">
            </android-activity-indicator>
            <android-text [style]="styles.indicatorLabel">Custom</android-text>
          </android-view>
        </android-view>
      </android-view>

      <!-- Alerts & Dialogs -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Alerts & Dialogs</android-text>

        <android-view [style]="styles.row">
          <android-button
            title="Alert"
            color="#1976D2"
            (press)="showAlert()">
          </android-button>

          <android-button
            title="Confirm"
            color="#FF9800"
            (press)="showConfirm()">
          </android-button>

          <android-button
            title="Prompt"
            color="#4CAF50"
            (press)="showPrompt()">
          </android-button>
        </android-view>
      </android-view>

      <!-- Toasts -->
      <android-view [style]="styles.section">
        <android-text [style]="styles.sectionTitle">Toasts</android-text>

        <android-view [style]="styles.row">
          <android-button
            title="Success"
            color="#4CAF50"
            (press)="showSuccessToast()">
          </android-button>

          <android-button
            title="Error"
            color="#F44336"
            (press)="showErrorToast()">
          </android-button>

          <android-button
            title="Info"
            color="#2196F3"
            (press)="showInfoToast()">
          </android-button>
        </android-view>
      </android-view>

      <android-view [style]="{ height: 40 }"></android-view>
    </android-scroll-view>
  `,
})
export class ComponentsScreenComponent {
  textValue = '';
  darkMode = false;
  notifications = true;
  volume = 50;
  brightness = 75;

  Math = Math;

  styles = {
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    section: {
      backgroundColor: '#FFFFFF',
      marginHorizontal: 12,
      marginTop: 12,
      borderRadius: 12,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: '#333333',
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row' as const,
      justifyContent: 'space-around' as const,
      alignItems: 'center' as const,
    },
    customButton: {
      backgroundColor: '#673AB7',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 12,
      alignItems: 'center' as const,
    },
    customButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold' as const,
    },
    input: {
      backgroundColor: '#F5F5F5',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      marginBottom: 12,
    },
    multilineInput: {
      backgroundColor: '#F5F5F5',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      minHeight: 100,
      textAlignVertical: 'top' as const,
    },
    switchRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    sliderContainer: {
      marginTop: 12,
    },
    label: {
      fontSize: 16,
      color: '#333333',
    },
    indicatorRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-around' as const,
      paddingVertical: 16,
    },
    indicatorItem: {
      alignItems: 'center' as const,
    },
    indicatorLabel: {
      marginTop: 8,
      fontSize: 12,
      color: '#757575',
    },
  };

  constructor(
    private readonly toast: ToastService,
    private readonly alert: AlertService
  ) {}

  onButtonPress(name: string): void {
    this.toast.short(`${name} button pressed!`);
  }

  onTextChange(text: string): void {
    console.log('Text changed:', text);
  }

  onSwitchChange(value: boolean): void {
    this.toast.short(`Dark mode: ${value ? 'enabled' : 'disabled'}`);
  }

  async showAlert(): Promise<void> {
    await this.alert.alert('Hello!', 'This is a simple alert dialog.');
  }

  async showConfirm(): Promise<void> {
    const confirmed = await this.alert.confirm(
      'Confirm Action',
      'Are you sure you want to proceed?'
    );
    this.toast.short(confirmed ? 'Confirmed!' : 'Cancelled');
  }

  async showPrompt(): Promise<void> {
    const result = await this.alert.prompt(
      'Enter Name',
      'What is your name?'
    );
    if (result.text) {
      this.toast.success(`Hello, ${result.text}!`);
    }
  }

  showSuccessToast(): void {
    this.toast.success('Operation completed successfully!');
  }

  showErrorToast(): void {
    this.toast.error('An error occurred!');
  }

  showInfoToast(): void {
    this.toast.info('Here is some information.');
  }
}
