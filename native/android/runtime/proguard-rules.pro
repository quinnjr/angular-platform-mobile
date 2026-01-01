# ProGuard rules for Angular Mobile Runtime

# Keep Kotlin metadata
-keep class kotlin.Metadata { *; }

# Keep data classes
-keepclassmembers class com.pegasusheavy.angularmobile.** {
    <init>(...);
    <fields>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable implementations
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Don't warn about missing optional dependencies
-dontwarn io.coil.kt.**
-dontwarn com.bumptech.glide.**
