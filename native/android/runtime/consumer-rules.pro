# Consumer ProGuard rules for Angular Mobile Runtime
# These rules will be applied to the consumer app

# Keep the public API
-keep public class dev.quinnjr.angularmobile.** { public *; }

# Keep JavaScript interface methods
-keepclassmembers class dev.quinnjr.angularmobile.AngularMobileRuntime$AngularMobileBridge {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep event listener interfaces
-keep interface dev.quinnjr.angularmobile.EventDispatcher$EventListener { *; }
