# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-01

### Added

#### Core Platform
- Initial release of Angular Platform Mobile
- Cross-platform support for iOS and Android
- Native bridge for communication between Angular and native layers
- WebSocket-based development bridge with hot reload support
- Native JSInterface bridge for Android production builds
- WKWebView/JavaScriptCore bridge for iOS production builds

#### Components
- `ViewComponent` - Basic container view
- `TextComponent` - Text display
- `ImageComponent` - Image display with caching
- `ScrollViewComponent` - Scrollable container
- `TextInputComponent` - Text input with ngModel support
- `ButtonComponent` - Native button
- `TouchableComponent` - Touchable wrapper with opacity feedback
- `FlatListComponent` - Virtualized list for large datasets
- `ModalComponent` - Modal dialog presentation
- `SwitchComponent` - Toggle switch
- `SliderComponent` - Slider control
- `WebViewComponent` - Embedded web content
- `SafeAreaViewComponent` - Safe area insets handling
- `StatusBarComponent` - Status bar customization
- `ActivityIndicatorComponent` - Loading spinner

#### Services
- `NavigationService` - Screen navigation with params
- `StorageService` - Async key-value storage
- `DeviceService` - Device info and dimensions
- `PermissionsService` - Runtime permission requests
- `AlertService` - Native alerts and action sheets
- `LinkingService` - URL handling and deep links
- `ClipboardService` - Clipboard access
- `ShareService` - Native share sheet
- `ToastService` - Toast notifications
- `StyleService` - Style creation and management
- `HapticService` - Haptic feedback
- `BiometricService` - Biometric authentication

#### Animation System
- `Animated.Value` - Animated values
- `Animated.ValueXY` - 2D animated values
- `Animated.timing()` - Timing-based animations
- `Animated.spring()` - Spring physics animations
- `Animated.sequence()` - Sequential animations
- `Animated.parallel()` - Parallel animations
- `Animated.stagger()` - Staggered animations
- `Animated.loop()` - Looped animations
- Interpolation support with color blending
- `FastEasing` - Pre-computed easing LUTs (79x faster)

#### Styling
- React Native-compatible style properties
- Flexbox layout support
- Shadow and elevation support
- Transform animations
- Style caching with LRU eviction (20x faster)

#### CLI (`ng-mobile`)
- `init` - Initialize new projects
- `run` - Run on device/emulator
- `build` - Build for production
- `start` - Start development server
- `devices` - List connected devices
- `logs` - View device logs
- `clean` - Clean build artifacts
- `link` - Link native dependencies

#### Developer Experience
- Full TypeScript support with strict type checking
- No `any` types in codebase
- Comprehensive decorators (`@NativeComponent`, `@NativeProp`, `@NativeEvent`)
- Hot reload support
- Debug logging

#### Performance
- Message queue with batching and priority
- Object pooling for bridge messages
- Diff-based view updates
- Style transformation caching
- Easing function lookup tables

### Platform Support
- **Android**: API 24+ (Android 7.0+)
- **iOS**: iOS 15.0+
- **Angular**: 18.0+
- **Node.js**: 18.0+

---

## Version History

- `0.1.0` - Initial public release
