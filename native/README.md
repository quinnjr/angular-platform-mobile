# Native Runtimes for Angular Platform Mobile

This directory contains the native runtime implementations for iOS and Android that power Angular Platform Mobile.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Application                        │
│                   (TypeScript/Angular)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      JavaScript Bridge                        │
│                   (NativeBridge.ts)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Native Bridge Layer                        │
│  ┌─────────────────────┐       ┌─────────────────────────┐  │
│  │   Android (Kotlin)   │       │      iOS (Swift)         │  │
│  │   JSInterface        │       │   WKScriptMessageHandler │  │
│  └─────────────────────┘       └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Native View Layer                           │
│  ┌─────────────────────┐       ┌─────────────────────────┐  │
│  │   ViewGroup          │       │      UIView               │  │
│  │   TextView           │       │      UILabel              │  │
│  │   ImageView          │       │      UIImageView          │  │
│  │   EditText           │       │      UITextField          │  │
│  │   RecyclerView       │       │      UITableView          │  │
│  │   etc.               │       │      etc.                 │  │
│  └─────────────────────┘       └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Android

### Location
`android/runtime/`

### Key Components

- **AngularMobileRuntime.kt** - Main runtime class that hosts the WebView and processes bridge messages
- **ViewRegistry.kt** - Manages mapping between view IDs and native Android Views
- **ViewFactory.kt** - Creates and updates native Android views based on JS commands
- **EventDispatcher.kt** - Routes events from native views back to JavaScript
- **FlexboxLayout.kt** - Custom ViewGroup implementing CSS Flexbox layout

### Integration

Add to your app's `build.gradle`:

```kotlin
dependencies {
    implementation("com.pegasusheavy:angular-mobile-runtime:0.1.0")
}
```

### Usage

```kotlin
class MainActivity : AppCompatActivity() {
    private lateinit var runtime: AngularMobileRuntime

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val container = FrameLayout(this)
        setContentView(container)

        runtime = AngularMobileRuntime(this, RuntimeConfig(debug = true))
        runtime.initialize(container)
        runtime.loadBundleFromAssets()
    }

    override fun onDestroy() {
        super.onDestroy()
        runtime.destroy()
    }
}
```

## iOS

### Location
`ios/AngularMobile/`

### Key Components

- **AngularMobileRuntime.swift** - Main runtime class that hosts WKWebView and processes bridge messages
- **ViewRegistry.swift** - Manages mapping between view IDs and native UIViews
- **ViewFactory.swift** - Creates and updates native iOS views based on JS commands
- **EventDispatcher.swift** - Routes events from native views back to JavaScript
- **FlexboxView.swift** - Custom UIView implementing CSS Flexbox layout

### Integration

#### Swift Package Manager

Add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/PegasusHeavyIndustries/angular-platform-mobile.git", from: "0.1.0")
]
```

#### CocoaPods

Add to your `Podfile`:

```ruby
pod 'AngularMobile', '~> 0.1.0'
```

### Usage

```swift
import AngularMobile

class ViewController: UIViewController {
    private var runtime: AngularMobileRuntime!

    override func viewDidLoad() {
        super.viewDidLoad()

        runtime = AngularMobileRuntime(config: RuntimeConfig(debug: true))
        runtime.initialize(rootContainer: view)
        runtime.loadBundleFromBundle()
    }

    deinit {
        runtime.destroy()
    }
}
```

## Bridge Protocol

The JavaScript and native layers communicate using JSON messages:

### Message Format

```json
{
  "id": "msg_123",
  "type": "createView",
  "payload": {
    "viewId": "view_1",
    "viewType": "Text",
    "props": {
      "text": "Hello, World!",
      "style": {
        "fontSize": 16,
        "color": "#333333"
      }
    }
  }
}
```

### Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `createView` | JS → Native | Create a new native view |
| `updateView` | JS → Native | Update view properties |
| `removeView` | JS → Native | Remove a view |
| `appendChild` | JS → Native | Add child to parent |
| `insertChild` | JS → Native | Insert child at index |
| `removeChild` | JS → Native | Remove child from parent |
| `setRootView` | JS → Native | Set the root view |
| `measureView` | JS → Native | Measure view dimensions |
| `focus` | JS → Native | Focus a view |
| `blur` | JS → Native | Blur a view |
| `batch` | JS → Native | Batch multiple operations |
| `viewEvent` | Native → JS | View event (press, change, etc.) |

### Response Format

```json
{
  "id": "msg_123",
  "success": true,
  "data": { ... }
}
```

Or for errors:

```json
{
  "id": "msg_123",
  "success": false,
  "error": "View not found: view_1"
}
```

## Building

### Android

```bash
cd android/runtime
./gradlew build
./gradlew publishToMavenLocal
```

### iOS

```bash
cd ios/AngularMobile
swift build
```

## Testing

### Android

```bash
cd android/runtime
./gradlew test
./gradlew connectedAndroidTest
```

### iOS

```bash
cd ios/AngularMobile
swift test
```

## License

MIT License - Pegasus Heavy Industries LLC
