plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("maven-publish")
}

android {
    namespace = "com.pegasusheavy.angularmobile"
    compileSdk = 34

    defaultConfig {
        minSdk = 24

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("androidx.webkit:webkit:1.9.0")

    // Image loading (optional - apps can use their preferred library)
    compileOnly("io.coil-kt:coil:2.5.0")
    compileOnly("com.github.bumptech.glide:glide:4.16.0")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}

publishing {
    publications {
        register<MavenPublication>("release") {
            groupId = "com.pegasusheavy"
            artifactId = "angular-mobile-runtime"
            version = "0.1.0"

            afterEvaluate {
                from(components["release"])
            }

            pom {
                name.set("Angular Mobile Runtime")
                description.set("Native Android runtime for Angular Platform Mobile")
                url.set("https://github.com/PegasusHeavyIndustries/angular-platform-mobile")

                licenses {
                    license {
                        name.set("MIT License")
                        url.set("https://opensource.org/licenses/MIT")
                    }
                }

                developers {
                    developer {
                        id.set("pegasusheavy")
                        name.set("Pegasus Heavy Industries")
                        email.set("dev@pegasusheavy.com")
                    }
                }

                scm {
                    connection.set("scm:git:git://github.com/PegasusHeavyIndustries/angular-platform-mobile.git")
                    developerConnection.set("scm:git:ssh://github.com:PegasusHeavyIndustries/angular-platform-mobile.git")
                    url.set("https://github.com/PegasusHeavyIndustries/angular-platform-mobile")
                }
            }
        }
    }
}
