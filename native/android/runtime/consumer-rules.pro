# Consumer ProGuard rules for Angular Mobile Runtime
# These rules will be applied to the consumer app

# Keep the public API
-keep public class com.pegasusheavy.angularmobile.** { public *; }

# Keep JavaScript interface methods
-keepclassmembers class com.pegasusheavy.angularmobile.AngularMobileRuntime$AngularMobileBridge {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep event listener interfaces
-keep interface com.pegasusheavy.angularmobile.EventDispatcher$EventListener { *; }
