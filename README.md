# Angular Platform Mobile

> Build native iOS and Android apps using Angular

[![npm version](https://img.shields.io/npm/v/angular-platform-mobile.svg)](https://www.npmjs.com/package/angular-platform-mobile)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-18+-dd0031.svg)](https://angular.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178c6.svg)](https://www.typescriptlang.org)

**Copyright © 2026 Joseph R. Quinn**

---

## Overview

Angular Platform Mobile enables you to build native iOS and Android applications using Angular. Similar to React Native, this platform provides a bridge between Angular components and native mobile views, allowing you to write your UI logic in TypeScript while rendering actual native components.

## ✨ Features

- 🚀 **Native Performance** - Renders actual native views, not web views
- 📱 **Cross-Platform** - Single codebase for iOS and Android
- 🎨 **Familiar Angular** - Use Angular components, services, and dependency injection
- 🔄 **Hot Reload** - Fast development with hot reload support
- 🎯 **TypeScript** - Full TypeScript support with strict type checking
- 📦 **Angular 18+** - Supports standalone components and signals
- ⚡ **Optimized** - Built-in performance optimizations (style caching, easing LUTs)
- 🛡️ **Type-Safe** - No `any` types - fully typed codebase

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add angular-platform-mobile

# Using npm
npm install angular-platform-mobile

# Using yarn
yarn add angular-platform-mobile
```

## 🚀 Quick Start

### 1. Initialize a new project

```bash
npx ng-mobile init my-app --platform both
cd my-app
```

### 2. Create your Angular app

```typescript
// src/app/app.component.ts
import { Component } from '@angular/core';
import { ViewComponent, TextComponent, ButtonComponent } from 'angular-platform-mobile';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ViewComponent, TextComponent, ButtonComponent],
  template: `
    <mobile-view [style]="containerStyle">
      <mobile-text [style]="titleStyle">Welcome to Angular Mobile!</mobile-text>
      <mobile-button
        title="Get Started"
        color="#007AFF"
        (press)="onPress()">
      </mobile-button>
    </mobile-view>
  `
})
export class AppComponent {
  containerStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  };

  titleStyle = {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  };

  onPress() {
    console.log('Button pressed!');
  }
}
```

### 3. Bootstrap the app

```typescript
// src/main.ts
import { bootstrapMobileApplication } from 'angular-platform-mobile';
import { AppComponent } from './app/app.component';

bootstrapMobileApplication(AppComponent, {
  config: {
    debug: true,
    appId: 'com.mycompany.myapp',
  },
}).catch(err => console.error(err));
```

### 4. Run on device

```bash
# Run on Android
npx ng-mobile run android

# Run on iOS
npx ng-mobile run ios
```

## 📱 Components

### Core Components

| Component | iOS | Android | Description |
|-----------|-----|---------|-------------|
| `<mobile-view>` | UIView | ViewGroup | Basic container view |
| `<mobile-text>` | UILabel | TextView | Text display |
| `<mobile-image>` | UIImageView | ImageView | Image display |
| `<mobile-scroll-view>` | UIScrollView | ScrollView | Scrollable container |
| `<mobile-text-input>` | UITextField | EditText | Text input field |
| `<mobile-button>` | UIButton | Button | Native button |
| `<mobile-touchable>` | - | - | Touchable wrapper |
| `<mobile-flat-list>` | UITableView | RecyclerView | Virtualized list |
| `<mobile-modal>` | UIViewController | Dialog | Modal dialog |
| `<mobile-switch>` | UISwitch | Switch | Toggle switch |
| `<mobile-slider>` | UISlider | SeekBar | Slider control |
| `<mobile-webview>` | WKWebView | WebView | Web content |
| `<mobile-safe-area-view>` | - | - | Safe area container |
| `<mobile-status-bar>` | - | - | Status bar control |
| `<mobile-activity-indicator>` | UIActivityIndicatorView | ProgressBar | Loading spinner |

### Example Usage

```typescript
import { Component } from '@angular/core';
import {
  ViewComponent,
  TextComponent,
  ImageComponent,
  ScrollViewComponent,
  TextInputComponent
} from 'angular-platform-mobile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ViewComponent,
    TextComponent,
    ImageComponent,
    ScrollViewComponent,
    TextInputComponent
  ],
  template: `
    <mobile-scroll-view [style]="{ flex: 1 }">
      <mobile-view [style]="containerStyle">
        <mobile-image
          [source]="{ uri: 'https://example.com/avatar.jpg' }"
          [style]="avatarStyle">
        </mobile-image>

        <mobile-text [style]="nameStyle">{{ userName }}</mobile-text>

        <mobile-text-input
          [(ngModel)]="bio"
          placeholder="Enter your bio"
          [style]="inputStyle"
          multiline>
        </mobile-text-input>
      </mobile-view>
    </mobile-scroll-view>
  `
})
export class ProfileComponent {
  userName = 'John Doe';
  bio = '';

  containerStyle = { padding: 20, alignItems: 'center' };
  avatarStyle = { width: 100, height: 100, borderRadius: 50 };
  nameStyle = { fontSize: 20, fontWeight: 'bold', marginTop: 16 };
  inputStyle = { width: '100%', marginTop: 20, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 };
}
```

## 🎨 Styling

Style properties follow React Native conventions:

```typescript
const styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
};
```

## 🔧 Services

### NavigationService

```typescript
import { NavigationService } from 'angular-platform-mobile';

@Component({ ... })
export class HomeComponent {
  constructor(private nav: NavigationService) {}

  goToProfile() {
    this.nav.navigate('Profile', { userId: '123' });
  }

  goBack() {
    this.nav.goBack();
  }
}
```

### StorageService

```typescript
import { StorageService } from 'angular-platform-mobile';

@Component({ ... })
export class SettingsComponent {
  constructor(private storage: StorageService) {}

  async saveSettings() {
    await this.storage.setItem('theme', 'dark');
  }

  async loadSettings() {
    const theme = await this.storage.getItem('theme');
  }
}
```

### DeviceService

```typescript
import { DeviceService } from 'angular-platform-mobile';

@Component({ ... })
export class AppComponent {
  constructor(private device: DeviceService) {
    console.log('Platform:', device.platform);
    console.log('Is iOS:', device.isIOS);
    console.log('Is Android:', device.isAndroid);
  }
}
```

### PermissionsService

```typescript
import { PermissionsService } from 'angular-platform-mobile';

@Component({ ... })
export class CameraComponent {
  constructor(private permissions: PermissionsService) {}

  async requestCamera() {
    const status = await this.permissions.request('camera');
    if (status === 'granted') {
      // Access camera
    }
  }
}
```

### AlertService

```typescript
import { AlertService } from 'angular-platform-mobile';

@Component({ ... })
export class MyComponent {
  constructor(private alert: AlertService) {}

  showAlert() {
    this.alert.alert('Title', 'Message', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: () => console.log('OK pressed') },
    ]);
  }
}
```

## 🖥️ CLI Commands

```bash
# Initialize a new project
ng-mobile init my-app --platform both

# Start development server
ng-mobile start

# Build the app
ng-mobile build android
ng-mobile build ios
ng-mobile build android --release

# Run on device/emulator
ng-mobile run android
ng-mobile run ios
ng-mobile run android --device
ng-mobile run ios --release

# View device logs
ng-mobile logs android
ng-mobile logs ios

# List connected devices
ng-mobile devices

# Clean build artifacts
ng-mobile clean

# Link native dependencies
ng-mobile link
```

## 📁 Project Structure

```
my-app/
├── android/                  # Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/        # Kotlin/Java source
│   │   │   ├── res/         # Android resources
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   └── settings.gradle
├── ios/                      # iOS project
│   ├── App/
│   │   ├── AppDelegate.swift
│   │   └── Info.plist
│   ├── App.xcodeproj
│   └── Podfile
├── src/                      # Angular source
│   ├── app/
│   │   └── app.component.ts
│   └── main.ts
├── assets/                   # Shared assets
├── ng-mobile.json           # Project config
├── package.json
└── tsconfig.json
```

## ⚙️ Configuration

### ng-mobile.json

```json
{
  "name": "MyApp",
  "displayName": "My App",
  "appId": "com.example.myapp",
  "platforms": {
    "android": {
      "minSdkVersion": 24,
      "targetSdkVersion": 34
    },
    "ios": {
      "deploymentTarget": "15.0"
    }
  },
  "bundleEntry": "./src/main.ts",
  "outputPath": "./dist"
}
```

## 📋 Requirements

- **Node.js** 18+
- **Angular** 18+
- **TypeScript** 5.3+

### For Android Development
- Android Studio
- Android SDK (API 24+)
- Java 17+

### For iOS Development
- macOS
- Xcode 15+
- CocoaPods

## ⚡ Performance

Angular Platform Mobile includes built-in performance optimizations:

- **Style Caching** - ~20x faster style transformations
- **Easing LUTs** - ~79x faster animation easing calculations
- **Message Batching** - Reduced bridge overhead
- **Diff-based Updates** - Only send changed properties

Run benchmarks:
```bash
pnpm benchmark
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - Copyright © 2026 Joseph R. Quinn

See [LICENSE](LICENSE) for details.

## 💖 Support

If you find this project useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
