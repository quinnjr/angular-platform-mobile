# Contributing to Angular Platform Mobile

First off, thank you for considering contributing to Angular Platform Mobile! It's people like you that make this project better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/angular-platform-mobile.git
   cd angular-platform-mobile
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/PegasusHeavyIndustries/angular-platform-mobile.git
   ```

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+ (we use pnpm, not npm or yarn)
- TypeScript 5.3+

### Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint
```

### Project Structure

```
angular-platform-mobile/
├── src/
│   ├── components/     # Native UI components
│   ├── core/
│   │   ├── animation/  # Animation system
│   │   ├── benchmark/  # Performance benchmarks
│   │   ├── bridge/     # Native bridge communication
│   │   ├── cache/      # Caching utilities
│   │   ├── platform/   # Platform abstraction
│   │   └── runtime/    # View rendering
│   ├── decorators/     # TypeScript decorators
│   ├── platforms/      # Platform-specific code
│   │   ├── android/
│   │   └── ios/
│   ├── services/       # Angular services
│   └── types/          # TypeScript type definitions
├── bin/                # CLI scripts
├── templates/          # Project templates
└── docs/               # Documentation
```

## Making Changes

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b fix/my-bugfix
   ```

2. **Make your changes** following our [coding standards](#coding-standards)

3. **Test your changes**:
   ```bash
   pnpm test
   pnpm lint
   pnpm build
   ```

4. **Commit your changes** using conventional commits:
   ```bash
   git commit -m "feat: add new component"
   git commit -m "fix: resolve rendering issue"
   git commit -m "docs: update README"
   ```

## Coding Standards

### TypeScript

- **NO `any` types** - Use proper typing or `unknown` with type guards
- Use strict TypeScript configuration
- Prefer `interface` over `type` for object shapes
- Use `readonly` where appropriate
- Document public APIs with JSDoc comments

```typescript
// ✅ Good
interface ViewProps {
  readonly style?: ViewStyle;
  accessible?: boolean;
}

// ❌ Bad
type ViewProps = any;
```

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `view-registry.ts`)
- **Classes**: `PascalCase` (e.g., `NativeBridge`)
- **Interfaces**: `PascalCase` with `I` prefix for abstractions (e.g., `IPlatform`)
- **Types**: `PascalCase` (e.g., `ViewStyle`)
- **Functions/Methods**: `camelCase` (e.g., `transformStyle`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `NATIVE_COMPONENT_METADATA`)

### Component Patterns

```typescript
@Component({
  selector: 'mobile-example',  // Use 'mobile-' prefix
  standalone: true,
  imports: [CommonModule],
  template: `...`,
})
export class ExampleComponent implements OnInit, OnDestroy {
  // Inputs first
  @Input() style?: ViewStyle;

  // Outputs second
  @Output() press = new EventEmitter<void>();

  // Private fields
  private readonly bridge = inject(BridgeService);

  // Lifecycle methods
  ngOnInit(): void { }
  ngOnDestroy(): void { }

  // Public methods
  // Private methods
}
```

### Service Patterns

```typescript
@Injectable({ providedIn: 'root' })
export class ExampleService {
  private readonly bridge = inject(BridgeService);

  // Use Observable for async data
  getData(): Observable<Data> {
    return from(this.bridge.request('getData', {}));
  }

  // Use Promise for one-time operations
  async performAction(): Promise<void> {
    await this.bridge.send({ type: 'action', payload: {} });
  }
}
```

## Testing

We use [Vitest](https://vitest.dev/) for testing.

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run benchmarks
pnpm benchmark
```

### Writing Tests

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('MyClass', () => {
  let instance: MyClass;

  beforeEach(() => {
    instance = new MyClass();
  });

  it('should do something', () => {
    expect(instance.method()).toBe(expected);
  });

  it('should handle async operations', async () => {
    const result = await instance.asyncMethod();
    expect(result).toBeDefined();
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Focus on testing public APIs and edge cases
- Mock external dependencies

## Submitting Changes

### Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features or bug fixes
3. **Ensure all tests pass**: `pnpm test`
4. **Ensure linting passes**: `pnpm lint`
5. **Update CHANGELOG.md** with your changes under `[Unreleased]`
6. **Create a Pull Request** with a clear description

### PR Title Format

Use conventional commit format:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `refactor: improve code structure`
- `test: add tests`
- `perf: improve performance`
- `chore: update dependencies`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] CHANGELOG updated
```

## Issue Guidelines

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Platform (iOS/Android) and version
- Angular version
- Code snippet or reproduction repo

### Feature Requests

Include:
- Clear description of the feature
- Use case / motivation
- Proposed API (if applicable)
- Willingness to contribute

---

## Questions?

Feel free to open an issue for questions or join our community discussions.

Thank you for contributing! 🎉
