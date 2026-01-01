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
