# Agent Guidelines for Angular Platform Mobile

This document provides guidance for AI agents working on this codebase.

## Project Overview

Angular Platform Mobile is a React Native-like framework for building native iOS and Android applications using Angular. It provides a bridge between Angular components and native mobile views.

## Architecture

```
src/
├── components/          # Native UI components (View, Text, Image, etc.)
├── core/
│   ├── animation/       # Animation system (Animated API, Easing)
│   ├── benchmark/       # Performance benchmarking tools
│   ├── bridge/          # Native bridge communication
│   ├── cache/           # Performance caching (styles, etc.)
│   ├── platform/        # Platform abstraction layer
│   └── runtime/         # View rendering and registry
├── decorators/          # TypeScript decorators (@NativeComponent, etc.)
├── platforms/
│   ├── android/         # Android-specific implementations
│   └── ios/             # iOS-specific implementations
├── services/            # Angular services (Navigation, Storage, etc.)
└── types/               # TypeScript type definitions
```

## Key Principles

### 1. No `any` Types
This codebase enforces strict typing. Never use `any`. Use:
- Specific types or interfaces
- `unknown` with type guards
- Generic type parameters
- Union types

```typescript
// ❌ Bad
function process(data: any): any { }

// ✅ Good
function process<T extends JsonValue>(data: T): ProcessedData<T> { }
```

### 2. Platform Abstraction
All platform-specific code must go through the platform abstraction layer:

```typescript
// ❌ Bad - Direct platform check
if (navigator.userAgent.includes('Android')) { }

// ✅ Good - Use Platform API
import { Platform } from './core/platform/platform';
if (Platform.OS === 'android') { }
```

### 3. Bridge Communication
All native communication goes through the `NativeBridge` or `BridgeService`:

```typescript
// Send message to native
await bridge.send({ type: 'updateView', payload: { viewId, props } });

// Request with response
const result = await bridge.request<MeasureResult>('measureView', { viewId });
```

### 4. Component Patterns
Native components follow this structure:

```typescript
@Component({
  selector: 'mobile-example',  // Always use 'mobile-' prefix
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ExampleComponent implements OnInit, OnDestroy {
  // Inputs with decorators
  @Input() style?: ViewStyle;
  @Input() accessible?: boolean;

  // Outputs for events
  @Output() press = new EventEmitter<void>();

  // Inject services
  private readonly bridge = inject(BridgeService);

  // Lifecycle
  ngOnInit(): void { this.createNativeView(); }
  ngOnDestroy(): void { this.destroyNativeView(); }
}
```

### 5. Service Patterns
Services use RxJS for reactive data:

```typescript
@Injectable({ providedIn: 'root' })
export class ExampleService {
  private readonly bridge = inject(BridgeService);

  // Observable for streams
  getData$(): Observable<Data> {
    return this.bridge.on<Data>('dataEvent');
  }

  // Promise for one-time operations
  async performAction(): Promise<void> {
    await this.bridge.send({ type: 'action', payload: {} });
  }
}
```

## Common Tasks

### Adding a New Component

1. Create component file in `src/components/<name>/<name>.component.ts`
2. Follow the component pattern above
3. Export from `src/components/components.module.ts`
4. Export from `src/index.ts`
5. Add to README documentation

### Adding a New Service

1. Create service file in `src/services/<name>.service.ts`
2. Use `@Injectable({ providedIn: 'root' })`
3. Inject `BridgeService` for native communication
4. Export from `src/index.ts`
5. Add to README documentation

### Adding Platform-Specific Code

1. Add to `src/platforms/android/` or `src/platforms/ios/`
2. Create unified interface in `src/core/platform/`
3. Use platform detection for runtime branching

## Testing

We use Vitest for testing:

```bash
pnpm test           # Run all tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # With coverage
```

Test file naming: `*.spec.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('MyClass', () => {
  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

## Performance

### Use Cached Style Transforms
```typescript
import { cachedTransformStyle } from './core/cache/style-cache';
const transformed = cachedTransformStyle(style); // 20x faster
```

### Use Fast Easing
```typescript
import { FastEasing } from './core/animation/easing-lut';
const eased = FastEasing.ease(t); // 79x faster than Easing.ease
```

### Run Benchmarks
```bash
pnpm benchmark
```

## Build & Lint

```bash
pnpm build      # Compile TypeScript
pnpm lint       # Run ESLint
pnpm typecheck  # Type check only
```

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | `kebab-case.component.ts` | `text-input.component.ts` |
| Services | `kebab-case.service.ts` | `navigation.service.ts` |
| Types | `kebab-case.types.ts` | `style.types.ts` |
| Tests | `*.spec.ts` | `bridge.spec.ts` |
| Modules | `kebab-case.module.ts` | `components.module.ts` |

## Code Style

- Use `readonly` for injected dependencies
- Prefer `inject()` over constructor injection
- Use `void` for ignored promise returns
- Prefix unused parameters with `_`
- Use explicit return types on public methods

## JSON-Compatible Types

For bridge communication, use JSON-compatible types:

```typescript
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
interface JsonObject { [key: string]: JsonValue | undefined }
type JsonArray = JsonValue[];
```

## Important Notes

1. **Don't modify native code** - This package only contains the Angular/TypeScript side
2. **Check platform support** - Not all features work on both iOS and Android
3. **Run tests before committing** - `pnpm test`
4. **Update CHANGELOG.md** - For user-facing changes
5. **Use conventional commits** - `feat:`, `fix:`, `docs:`, etc.

## Getting Help

- Check existing code for patterns
- Read the Cursor rules in `.cursor/rules/`
- Look at test files for usage examples
- Run benchmarks to verify performance

---

<!-- converted from Cursor rules -->

## Cursor rule: `.cursor/rules/animation-system.mdc`

# Animation System

## Animated API

The animation system mirrors React Native's Animated API.

### Creating Animated Values

```typescript
import { Animated } from 'angular-platform-mobile';

// Single value
const opacity = new Animated.Value(0);

// XY value (for position)
const position = new Animated.ValueXY({ x: 0, y: 0 });
```

### Timing Animation

```typescript
Animated.timing(opacity, {
  toValue: 1,
  duration: 300,
  delay: 100,
  useNativeDriver: true,
}).start((result) => {
  if (result.finished) {
    console.log('Animation completed');
  }
});
```

### Spring Animation

```typescript
Animated.spring(scale, {
  toValue: 1,
  stiffness: 100,
  damping: 10,
  mass: 1,
  useNativeDriver: true,
}).start();
```

### Easing Functions

```typescript
import { Easing } from 'angular-platform-mobile';

Animated.timing(value, {
  toValue: 100,
  duration: 500,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}).start();

// Available easings:
Easing.linear
Easing.ease        // Default ease
Easing.easeIn
Easing.easeOut
Easing.easeInOut
Easing.quad        // Quadratic
Easing.cubic       // Cubic
Easing.poly(n)     // Polynomial
Easing.sin         // Sinusoidal
Easing.circle      // Circular
Easing.exp         // Exponential
Easing.elastic(bounciness)
Easing.back(s)     // Overshoot
Easing.bounce      // Bouncy
Easing.bezier(x1, y1, x2, y2)  // Custom curve
```

### Interpolation

```typescript
const rotation = opacity.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'],
});

const backgroundColor = progress.interpolate({
  inputRange: [0, 0.5, 1],
  outputRange: ['#ff0000', '#00ff00', '#0000ff'],
  extrapolate: 'clamp',
});
```

### Composition

```typescript
// Sequential
Animated.sequence([
  Animated.timing(value1, { toValue: 100, duration: 200 }),
  Animated.timing(value2, { toValue: 100, duration: 200 }),
]).start();

// Parallel
Animated.parallel([
  Animated.timing(opacity, { toValue: 1, duration: 300 }),
  Animated.timing(scale, { toValue: 1, duration: 300 }),
]).start();

// Staggered
Animated.stagger(100, [
  Animated.timing(item1, { toValue: 1, duration: 200 }),
  Animated.timing(item2, { toValue: 1, duration: 200 }),
  Animated.timing(item3, { toValue: 1, duration: 200 }),
]).start();

// Delay
Animated.sequence([
  Animated.delay(500),
  Animated.timing(value, { toValue: 1, duration: 300 }),
]).start();

// Loop
Animated.loop(
  Animated.timing(rotation, { toValue: 1, duration: 1000 }),
  { iterations: 3 }  // -1 for infinite
).start();
```

### Value Operations

```typescript
// Get current value
const currentValue = animatedValue.getValue();

// Set value directly (no animation)
animatedValue.setValue(100);

// Offset handling
animatedValue.setOffset(50);
animatedValue.flattenOffset();
animatedValue.extractOffset();

// Listeners
const listenerId = animatedValue.addListener(({ value }) => {
  console.log('Value changed:', value);
});
animatedValue.removeListener(listenerId);
animatedValue.removeAllListeners();

// Stop animation
animatedValue.stopAnimation((value) => {
  console.log('Stopped at:', value);
});
```

### Observable Integration

```typescript
// AnimatedValue exposes value$ observable
animatedValue.value$.subscribe((value) => {
  // React to value changes
});

// AnimatedInterpolation also has value$
interpolation.value$.subscribe((interpolatedValue) => {
  // React to interpolated values
});
```


## Cursor rule: `.cursor/rules/bridge-communication.mdc`

# Native Bridge Communication

## Bridge Architecture

The native bridge supports three transport modes:
1. **WebSocket** - Development mode
2. **Android JSInterface** - Android native
3. **iOS WKWebView/JSCore** - iOS native

## Sending Messages

### Fire-and-forget
```typescript
await this.bridgeService.send('eventType', {
  viewId: this.viewId,
  action: 'someAction',
});
```

### Request/Response
```typescript
interface ResponseType {
  success: boolean;
  data: SomeData;
}

const result = await this.bridgeService.request<ResponseType>('requestType', {
  param1: 'value',
  param2: 123,
});
```

## Receiving Events

### Component Events
```typescript
// With target filtering
this.bridgeService.on<{ value: number; target?: string }>('valueChange')
  .pipe(takeUntil(this.destroy$))
  .subscribe((event) => {
    if (event.target === this.viewId) {
      this.change.emit(event.value);
    }
  });
```

### Global Events
```typescript
// Platform-wide events (no target filtering needed)
this.bridgeService.on<{ isConnected: boolean }>('networkChange')
  .pipe(takeUntil(this.destroy$))
  .subscribe(({ isConnected }) => {
    this.handleNetworkChange(isConnected);
  });
```

## Message Types

### View Operations
```typescript
// Create view
await bridge.send('createView', { viewId, viewType, props });

// Update view
await bridge.send('updateView', { viewId, props });

// Remove view
await bridge.send('removeView', { viewId });

// View hierarchy
await bridge.send('appendChild', { parentId, childId });
await bridge.send('insertChild', { parentId, childId, index });
await bridge.send('removeChild', { parentId, childId });
```

### Native Module Calls
```typescript
const result = await this.bridgeService.request<T>('callNativeMethod', {
  module: 'ModuleName',
  method: 'methodName',
  args: [arg1, arg2],
});
```

## Type-Safe Payloads

Always use typed payloads, never `any`:

```typescript
// ❌ Don't do this
await bridge.send('action', data as any);

// ✅ Define proper types
interface ActionPayload {
  viewId: string;
  action: string;
  params?: Record<string, unknown>;
}

await bridge.send('action', payload satisfies ActionPayload);
```

## Error Handling

```typescript
try {
  const result = await this.bridgeService.request<ResponseType>('riskyAction', {});
  return result;
} catch (error: unknown) {
  const err = error as { message?: string; code?: string };

  if (err.code === 'TIMEOUT') {
    // Handle timeout
  } else {
    // Handle other errors
  }

  throw error;
}
```

## Platform Detection in Bridge

```typescript
const bridge = new NativeBridge({
  port: 8081,
  debug: true,
  platform: 'ios', // Force platform (optional)
});

// Auto-detected transport
console.log(bridge.currentTransport); // 'native-ios' | 'native-android' | 'websocket'
console.log(bridge.currentPlatform);  // 'ios' | 'android'
```


## Cursor rule: `.cursor/rules/component-patterns.mdc`

# Component Development Patterns

## Creating Native Components

### Basic Structure
```typescript
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { NativeComponent } from '../../decorators/native-component';
import { BridgeService, ViewProps } from '../../core/bridge/bridge.service';
import { ViewStyle } from '../../types/style.types';

@NativeComponent({
  nativeViewClass: 'android.widget.WidgetName', // Android class
  hasChildren: false,
  events: ['press', 'change'],
})
@Component({
  selector: 'mobile-widget-name',
  template: `<ng-content></ng-content>`,
  standalone: true,
})
export class WidgetComponent implements OnInit, OnDestroy {
  private viewId: string | null = null;

  @Input() style?: ViewStyle;
  @Output() press = new EventEmitter<void>();

  constructor(private readonly bridgeService: BridgeService) {}

  async ngOnInit(): Promise<void> {
    this.viewId = await this.bridgeService.createView('Widget', this.getProps());
    this.registerEventListeners();
  }

  ngOnDestroy(): void {
    if (this.viewId) {
      void this.bridgeService.removeView(this.viewId);
    }
  }

  private getProps(): ViewProps {
    return {
      style: this.style as unknown as JsonValue,
      // ... other props
    };
  }

  private registerEventListeners(): void {
    if (!this.viewId) return;
    // Register bridge event listeners
  }
}
```

### Component Selectors
All component selectors use the `mobile-` prefix:
- `mobile-view`, `mobile-text`, `mobile-image`
- `mobile-button`, `mobile-scroll-view`, `mobile-flat-list`

### Props Pattern
```typescript
// Style props
@Input() style?: ViewStyle;
@Input() contentContainerStyle?: ViewStyle;

// Behavior props
@Input() disabled?: boolean;
@Input() accessible?: boolean;

// Test props
@Input() testID?: string;
```

### Event Pattern
```typescript
// Define event type with target
interface WidgetEvent {
  target?: string;
  value: number;
}

// Register typed event listener
this.bridgeService.on<WidgetEvent>('widgetChange').subscribe((event) => {
  if (event.target === this.viewId) {
    this.change.emit(event);
  }
});
```

## ControlValueAccessor Implementation

For form-compatible components:
```typescript
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextInputComponent),
    multi: true,
  }],
})
export class TextInputComponent implements ControlValueAccessor {
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.editable = !isDisabled;
  }
}
```

## Platform-Specific Code

Use Platform.select for platform differences:
```typescript
import { Platform } from '../../core/platform/platform';

const buttonStyle = Platform.select({
  ios: { borderRadius: 8 },
  android: { elevation: 2 },
  default: {},
});
```


## Cursor rule: `.cursor/rules/development-workflow.mdc`

# Development Workflow

## Package Manager

This project uses **pnpm** (not npm or yarn).

```bash
# Install dependencies
pnpm install

# Add dependency
pnpm add <package>

# Add dev dependency
pnpm add -D <package>
```

## Build Commands

```bash
# Build TypeScript
pnpm build

# Build with watch
pnpm build:watch

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm lint

# Fix lint issues
pnpm lint:fix
```

## CLI Usage

```bash
# Create new project
ng-mobile init my-app --platform both

# Run on platforms
ng-mobile run android
ng-mobile run ios

# Build for platforms
ng-mobile build android --release
ng-mobile build ios --release

# Start dev server
ng-mobile start --port 8081

# View logs
ng-mobile logs android
ng-mobile logs ios

# List devices
ng-mobile devices

# Clean build artifacts
ng-mobile clean
```

## Project Structure Guidelines

### Adding a New Component

1. Create component file: `src/components/my-widget/my-widget.component.ts`
2. Export from: `src/components/components.module.ts`
3. Export from: `src/index.ts`

### Adding a New Service

1. Create service file: `src/services/my-service.service.ts`
2. Export from: `src/index.ts`
3. Add to module providers if not `providedIn: 'root'`

### Adding Platform-Specific Code

- Android: `src/platforms/android/`
- iOS: `src/platforms/ios/`
- Shared: `src/core/platform/`

## Code Quality

### Pre-commit Hooks (Husky)

The project uses Husky for pre-commit hooks:
- Runs linting on staged files
- Enforces conventional commits

### Commit Message Format

Follow conventional commits:
```
feat: add new animation type
fix: resolve bridge connection issue
docs: update component documentation
chore: update dependencies
refactor: simplify event handling
test: add animation tests
```

## Debugging

### Development Mode

```typescript
// Enable debug logging in bridge
const bridge = new NativeBridge({
  debug: true,
  port: 8081,
});
```

### Platform Detection

```typescript
import { Platform } from 'angular-platform-mobile';

console.log('Platform:', Platform.detect()); // 'ios' | 'android'
console.log('Is iOS:', Platform.isIOS);
console.log('Is Android:', Platform.isAndroid);
```

## Release Process

1. Update version in `package.json`
2. Run `pnpm build`
3. Run `pnpm test`
4. Commit with `chore: release vX.Y.Z`
5. Create git tag
6. Publish to npm: `pnpm publish`


## Cursor rule: `.cursor/rules/project-overview.mdc`

# Angular Platform Mobile - Project Overview

## Project Description

Angular Platform Mobile (`angular-platform-mobile`) is a React Native-like framework for building native iOS and Android applications using Angular. It provides a bridge between Angular components and native mobile views.

## Key Architecture

### Platform Abstraction
- `Platform` - Static utilities for platform detection (iOS/Android)
- `BasePlatform` - Abstract base class for platform implementations
- `AndroidPlatform` / `IOSPlatform` - Platform-specific implementations
- `PLATFORM` / `PLATFORM_TYPE` - Injection tokens for DI

### Native Bridge
- `NativeBridge` - WebSocket/native bridge for JS-to-native communication
- `BridgeService` - Angular service wrapper with lifecycle management
- Supports: WebSocket (dev), Android JSInterface, iOS WKWebView/JavaScriptCore

### Renderer
- `AndroidRenderer` - Translates Angular updates to native view operations
- `ViewRegistry` - Manages native view hierarchy
- `EventDispatcher` - Routes native events to Angular handlers

### Components
All components use the `mobile-` prefix selector:
- `mobile-view`, `mobile-text`, `mobile-image`
- `mobile-button`, `mobile-text-input`, `mobile-scroll-view`
- `mobile-flat-list`, `mobile-modal`, `mobile-webview`
- `mobile-switch`, `mobile-slider`, `mobile-activity-indicator`

## File Structure

```
src/
├── components/       # Native component wrappers
├── core/
│   ├── animation/   # Animated API
│   ├── bridge/      # Native bridge communication
│   ├── platform/    # Platform abstraction
│   └── runtime/     # Renderer and event system
├── decorators/      # @NativeComponent, @NativeProp, etc.
├── platforms/
│   ├── android/     # Android-specific code
│   └── ios/         # iOS-specific code
├── services/        # Native API services
├── types/           # Type definitions
└── index.ts         # Public API exports
```

## CLI Tool

The `ng-mobile` CLI provides:
- `ng-mobile init` - Create new project
- `ng-mobile run <platform>` - Run on device/emulator
- `ng-mobile build <platform>` - Build for platform
- `ng-mobile start` - Start dev server


## Cursor rule: `.cursor/rules/service-patterns.mdc`

# Service Development Patterns

## Creating Native Services

### Basic Structure
```typescript
import { Injectable, OnDestroy, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BridgeService } from '../core/bridge/bridge.service';
import { PLATFORM, IPlatform } from '../core/platform/platform';

@Injectable({
  providedIn: 'root', // Or omit for module-scoped
})
export class MyNativeService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly bridgeService: BridgeService,
    @Inject(PLATFORM) private readonly platform: IPlatform
  ) {
    this.initialize();
  }

  private initialize(): void {
    // Subscribe to native events
    this.bridgeService
      .on<SomeEventType>('someNativeEvent')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        // Handle event
      });
  }

  /**
   * Public API method
   */
  async doSomething(param: string): Promise<ResultType> {
    return this.bridgeService.request<ResultType>('nativeMethod', { param });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Platform-Specific Logic
```typescript
@Injectable()
export class DeviceService {
  constructor(@Inject(PLATFORM) private readonly platform: IPlatform) {}

  getStatusBarHeight(): number {
    return this.platform.select({
      ios: this.platform.getSafeAreaInsets().top,
      android: 24, // Standard Android status bar
      default: 0,
    }) ?? 0;
  }

  supportsHaptics(): boolean {
    if (this.platform.isIOS) {
      return this.platform.isVersionAtLeast(10);
    }
    return this.platform.isVersionAtLeast(26); // Android O
  }
}
```

### Observable Patterns
```typescript
@Injectable()
export class NetworkService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly connectionState$ = new BehaviorSubject<boolean>(true);

  get isConnected$(): Observable<boolean> {
    return this.connectionState$.asObservable();
  }

  get isConnected(): boolean {
    return this.connectionState$.getValue();
  }

  private initialize(): void {
    this.bridgeService
      .on<{ isConnected: boolean }>('networkChange')
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ isConnected }) => {
        this.connectionState$.next(isConnected);
      });
  }
}
```

## Available Services

| Service | Purpose |
|---------|---------|
| `StyleService` | Style creation and transformation |
| `NavigationService` | Native navigation |
| `DeviceService` | Device info and dimensions |
| `StorageService` | AsyncStorage wrapper |
| `PermissionsService` | Permission requests |
| `AlertService` | Native alerts and action sheets |
| `LinkingService` | URL handling and deep links |
| `ClipboardService` | Clipboard operations |
| `ShareService` | Native share sheet |
| `ToastService` | Toast notifications |
| `HapticService` | Haptic feedback |
| `BiometricService` | Face ID/Touch ID/Fingerprint |

## Error Handling Pattern
```typescript
async performAction(): Promise<void> {
  try {
    await this.bridgeService.request('riskyAction', {});
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    console.error('[ServiceName] Action failed:', err.message);
    // Handle gracefully
  }
}
```


## Cursor rule: `.cursor/rules/styling-system.mdc`

# Styling System

## Style Types

### ViewStyle
```typescript
const containerStyle: ViewStyle = {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#ffffff',
  padding: 16,
  margin: 8,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#cccccc',

  // Shadows (iOS)
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,

  // Shadows (Android)
  elevation: 5,
};
```

### TextStyle
```typescript
const textStyle: TextStyle = {
  fontSize: 16,
  fontWeight: 'bold',
  fontFamily: 'Roboto',
  color: '#333333',
  textAlign: 'center',
  lineHeight: 24,
  letterSpacing: 0.5,
  textDecorationLine: 'underline',
  textTransform: 'uppercase',
};
```

### ImageStyle
```typescript
const imageStyle: ImageStyle = {
  width: 100,
  height: 100,
  resizeMode: 'cover',
  borderRadius: 50, // Circular
  tintColor: '#007AFF',
};
```

## StyleService

```typescript
import { StyleService } from 'angular-platform-mobile';

@Component({...})
export class MyComponent {
  constructor(private styleService: StyleService) {}

  // Create stylesheet
  styles = this.styleService.create({
    container: { flex: 1 },
    title: { fontSize: 24 },
  });

  // Merge styles
  mergedStyle = this.styleService.flatten(
    this.styles.container,
    isActive && this.styles.active,
    customStyle
  );

  // Conditional composition
  buttonStyle = this.styleService.compose(
    this.styles.button,
    [
      [this.disabled, this.styles.buttonDisabled],
      [this.loading, this.styles.buttonLoading],
    ]
  );
}
```

## Style Presets

```typescript
// Available via styleService.presets
const { presets } = this.styleService;

// Layout
presets.row          // { flexDirection: 'row' }
presets.column       // { flexDirection: 'column' }
presets.center       // { justifyContent: 'center', alignItems: 'center' }
presets.flex1        // { flex: 1 }

// Shadows
presets.shadow       // Standard shadow
presets.shadowLight  // Light shadow
presets.shadowMedium // Medium shadow
presets.shadowHeavy  // Heavy shadow

// Spacing
presets.p1 - presets.p6  // padding 4-24
presets.m1 - presets.m6  // margin 4-24

// Border radius
presets.rounded      // { borderRadius: 8 }
presets.roundedSm    // { borderRadius: 4 }
presets.roundedLg    // { borderRadius: 16 }
presets.roundedFull  // { borderRadius: 9999 }
```

## Responsive Styles

```typescript
const responsiveStyle = this.styleService.responsive(
  { fontSize: 14 },  // Base
  {
    sm: { fontSize: 16 },   // >= 320px
    md: { fontSize: 18 },   // >= 480px
    lg: { fontSize: 20 },   // >= 768px
    xl: { fontSize: 24 },   // >= 1024px
  }
);

// Usage with device width
const finalStyle = responsiveStyle(this.deviceWidth);
```

## Themed Styles

```typescript
const themedStyles = this.styleService.themed(
  // Light theme
  {
    container: { backgroundColor: '#ffffff' },
    text: { color: '#000000' },
  },
  // Dark theme overrides
  {
    container: { backgroundColor: '#1a1a1a' },
    text: { color: '#ffffff' },
  }
);

// Usage
const styles = themedStyles(this.isDarkMode);
```

## Platform-Specific Styles

```typescript
import { Platform } from 'angular-platform-mobile';

const buttonStyle: ViewStyle = {
  padding: 12,
  ...Platform.select({
    ios: {
      borderRadius: 8,
      backgroundColor: '#007AFF',
    },
    android: {
      borderRadius: 4,
      backgroundColor: '#6200EE',
      elevation: 2,
    },
  }),
};
```


## Cursor rule: `.cursor/rules/testing-guidelines.mdc`

# Testing Guidelines

## Test Framework

This project uses **Vitest** (not Jest). Always use Vitest imports and APIs.

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
```

## Test File Location

Tests are co-located with source files:
```
src/
├── core/
│   ├── bridge/
│   │   ├── native-bridge.ts
│   │   └── native-bridge.spec.ts  ✓
│   └── animation/
│       ├── animated.ts
│       └── animated.spec.ts  ✓
```

## Test Structure

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SomeClass } from './some-class';

describe('SomeClass', () => {
  let instance: SomeClass;

  beforeEach(() => {
    vi.useFakeTimers();
    instance = new SomeClass();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('methodName', () => {
    it('should do expected behavior', () => {
      const result = instance.methodName();
      expect(result).toBe(expectedValue);
    });

    it('should handle edge case', async () => {
      await expect(instance.asyncMethod()).resolves.toBeDefined();
    });
  });
});
```

## Mocking Patterns

### Mock Functions
```typescript
const mockCallback = vi.fn();
instance.onEvent(mockCallback);
instance.triggerEvent();
expect(mockCallback).toHaveBeenCalledWith({ type: 'event' });
```

### Spy on Methods
```typescript
vi.spyOn(instance, 'privateMethod');
instance.publicMethod();
expect(instance.privateMethod).toHaveBeenCalled();
```

### Mock Timers
```typescript
vi.useFakeTimers();

const callback = vi.fn();
setTimeout(callback, 1000);

vi.advanceTimersByTime(1000);
expect(callback).toHaveBeenCalled();
```

### Mock Modules
```typescript
vi.mock('./some-dependency', () => ({
  SomeDependency: vi.fn().mockImplementation(() => ({
    method: vi.fn().mockResolvedValue('mocked'),
  })),
}));
```

## Async Testing

```typescript
// Use async/await (NOT done callback)
it('should handle async operations', async () => {
  const result = await instance.asyncMethod();
  expect(result).toBeDefined();
});

// For promises
it('should resolve correctly', async () => {
  await expect(instance.asyncMethod()).resolves.toBe('value');
});

// For rejections
it('should reject on error', async () => {
  await expect(instance.failingMethod()).rejects.toThrow('error');
});
```

## Animation Testing

```typescript
import { Animated } from './animated';

describe('Animation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should animate value over time', () => {
    const value = new Animated.Value(0);
    Animated.timing(value, { toValue: 100, duration: 100 }).start();

    vi.advanceTimersByTime(50);
    expect(value.getValue()).toBeCloseTo(50);

    vi.advanceTimersByTime(50);
    expect(value.getValue()).toBe(100);
  });
});
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```


## Cursor rule: `.cursor/rules/typescript-conventions.mdc`

# TypeScript Conventions

## Strict Type Safety

This project enforces strict TypeScript with NO `any` types allowed.

### Forbidden Patterns
```typescript
// ❌ NEVER use any
let data: any;
const result = value as any;
function process<T = any>(): T;

// ✅ Use proper types instead
let data: unknown;
const result = value as SpecificType;
function process<T = unknown>(): T;
```

### Type Definitions

**For JSON-serializable data:**
```typescript
import { JsonValue, JsonObject, BridgePayload } from './core/bridge/native-bridge';

// Use JsonValue for strict JSON
const config: JsonValue = { key: 'value' };

// Use BridgePayload for flexible objects
const payload: BridgePayload = { anyKey: someValue };
```

**For native bridge communication:**
```typescript
// Generic request/response
async request<T = unknown>(type: string, payload: BridgePayload): Promise<T>

// Typed events
on<T = unknown>(eventType: string, handler: EventHandler<T>): () => void
```

### Error Handling
```typescript
// ❌ Don't use any for errors
catch (error: any) {
  console.log(error.message);
}

// ✅ Use unknown and type guards
catch (error: unknown) {
  const err = error as { message?: string };
  console.log(err.message ?? 'Unknown error');
}
```

### Unused Parameters
Prefix with underscore:
```typescript
function callback(_event: Event, _index: number): void {
  // Parameters intentionally unused
}
```

## Import Organization

```typescript
// 1. Angular core
import { Component, Injectable } from '@angular/core';

// 2. RxJS
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

// 3. Internal imports (relative)
import { BridgeService } from '../../core/bridge/bridge.service';
import { ViewStyle } from '../../types/style.types';
```

## Naming Conventions

- **Classes**: PascalCase (`AndroidPlatform`, `NativeBridge`)
- **Interfaces**: PascalCase, no `I` prefix (`PlatformOS`, `BridgeConfig`)
- **Types**: PascalCase (`PlatformType`, `JsonValue`)
- **Functions**: camelCase (`createView`, `transformStyle`)
- **Constants**: SCREAMING_SNAKE_CASE (`PLATFORM_TYPE`, `NATIVE_COMPONENT_METADATA`)
- **Files**: kebab-case (`native-bridge.ts`, `platform-android.ts`)

