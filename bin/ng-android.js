#!/usr/bin/env node

/**
 * @pegasusheavy/angular-platform-android CLI
 *
 * Command-line interface for building and running Angular Android apps.
 *
 * Copyright (c) 2026 Pegasus Heavy Industries LLC
 * Licensed under the MIT License
 */

const { Command } = require('commander');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

const program = new Command();

program
  .name('ng-android')
  .description('Angular Platform Android CLI - Build native Android apps with Angular')
  .version('1.0.0');

// Initialize command
program
  .command('init')
  .description('Initialize a new Angular Android project')
  .option('-n, --name <name>', 'Project name')
  .option('-p, --package <package>', 'Android package name (e.g., com.example.app)')
  .option('--min-sdk <version>', 'Minimum SDK version', '24')
  .option('--target-sdk <version>', 'Target SDK version', '34')
  .action(async (options) => {
    console.log(chalk.blue('🚀 Initializing Angular Android project...'));

    try {
      const projectName = options.name || path.basename(process.cwd());
      const packageName = options.package || `com.angular.${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      await initProject({
        name: projectName,
        packageName,
        minSdk: parseInt(options.minSdk),
        targetSdk: parseInt(options.targetSdk),
      });

      console.log(chalk.green('✅ Project initialized successfully!'));
      console.log(chalk.cyan(`\nNext steps:`));
      console.log(chalk.white(`  1. cd android`));
      console.log(chalk.white(`  2. ng-android run`));
    } catch (error) {
      console.error(chalk.red('❌ Failed to initialize project:'), error.message);
      process.exit(1);
    }
  });

// Build command
program
  .command('build')
  .description('Build the Angular Android app')
  .option('--release', 'Build release version')
  .option('--aab', 'Build Android App Bundle instead of APK')
  .option('-o, --output <path>', 'Output directory')
  .action(async (options) => {
    console.log(chalk.blue(`🔨 Building ${options.release ? 'release' : 'debug'} version...`));

    try {
      await buildProject(options);
      console.log(chalk.green('✅ Build completed successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Build failed:'), error.message);
      process.exit(1);
    }
  });

// Run command
program
  .command('run')
  .description('Build and run the app on a device or emulator')
  .option('-d, --device', 'Run on physical device')
  .option('-e, --emulator <name>', 'Run on specific emulator')
  .option('--release', 'Run release version')
  .option('--no-sync', 'Skip syncing with Gradle')
  .action(async (options) => {
    console.log(chalk.blue('📱 Running app...'));

    try {
      await runProject(options);
    } catch (error) {
      console.error(chalk.red('❌ Run failed:'), error.message);
      process.exit(1);
    }
  });

// Start dev server command
program
  .command('start')
  .description('Start the development server with hot reload')
  .option('-p, --port <port>', 'Dev server port', '8081')
  .option('--host <host>', 'Dev server host', 'localhost')
  .action(async (options) => {
    console.log(chalk.blue('🔥 Starting development server with hot reload...'));

    try {
      await startDevServer(options);
    } catch (error) {
      console.error(chalk.red('❌ Dev server failed:'), error.message);
      process.exit(1);
    }
  });

// Clean command
program
  .command('clean')
  .description('Clean build artifacts')
  .action(async () => {
    console.log(chalk.blue('🧹 Cleaning build artifacts...'));

    try {
      await cleanProject();
      console.log(chalk.green('✅ Clean completed!'));
    } catch (error) {
      console.error(chalk.red('❌ Clean failed:'), error.message);
      process.exit(1);
    }
  });

// Log command
program
  .command('log')
  .description('View device logs')
  .option('-f, --filter <tag>', 'Filter by tag')
  .option('--clear', 'Clear logs before starting')
  .action(async (options) => {
    try {
      await viewLogs(options);
    } catch (error) {
      console.error(chalk.red('❌ Failed to view logs:'), error.message);
      process.exit(1);
    }
  });

// Devices command
program
  .command('devices')
  .description('List connected devices and emulators')
  .action(async () => {
    try {
      await listDevices();
    } catch (error) {
      console.error(chalk.red('❌ Failed to list devices:'), error.message);
      process.exit(1);
    }
  });

// Implementation functions
async function initProject(config) {
  const androidDir = path.join(process.cwd(), 'android');

  // Create Android project structure
  await fs.ensureDir(androidDir);
  await fs.ensureDir(path.join(androidDir, 'app/src/main/java', ...config.packageName.split('.')));
  await fs.ensureDir(path.join(androidDir, 'app/src/main/res/layout'));
  await fs.ensureDir(path.join(androidDir, 'app/src/main/res/values'));
  await fs.ensureDir(path.join(androidDir, 'app/src/main/res/drawable'));
  await fs.ensureDir(path.join(androidDir, 'app/src/main/assets'));

  // Copy template files
  const templateDir = path.join(__dirname, '../templates/android');

  // Generate build.gradle
  await fs.writeFile(
    path.join(androidDir, 'build.gradle'),
    generateRootBuildGradle()
  );

  await fs.writeFile(
    path.join(androidDir, 'app/build.gradle'),
    generateAppBuildGradle(config)
  );

  await fs.writeFile(
    path.join(androidDir, 'settings.gradle'),
    generateSettingsGradle(config.name)
  );

  await fs.writeFile(
    path.join(androidDir, 'gradle.properties'),
    generateGradleProperties()
  );

  // Generate AndroidManifest.xml
  await fs.writeFile(
    path.join(androidDir, 'app/src/main/AndroidManifest.xml'),
    generateAndroidManifest(config)
  );

  // Generate MainActivity
  await fs.writeFile(
    path.join(androidDir, 'app/src/main/java', ...config.packageName.split('.'), 'MainActivity.kt'),
    generateMainActivity(config.packageName)
  );

  // Generate MainApplication
  await fs.writeFile(
    path.join(androidDir, 'app/src/main/java', ...config.packageName.split('.'), 'MainApplication.kt'),
    generateMainApplication(config.packageName)
  );

  // Generate AngularBridge
  await fs.writeFile(
    path.join(androidDir, 'app/src/main/java', ...config.packageName.split('.'), 'bridge/AngularBridge.kt'),
    generateAngularBridge(config.packageName)
  );

  // Generate resources
  await fs.writeFile(
    path.join(androidDir, 'app/src/main/res/values/strings.xml'),
    generateStringsXml(config.name)
  );

  await fs.writeFile(
    path.join(androidDir, 'app/src/main/res/values/styles.xml'),
    generateStylesXml()
  );

  await fs.writeFile(
    path.join(androidDir, 'app/src/main/res/values/colors.xml'),
    generateColorsXml()
  );

  // Create ng-android.json config file
  await fs.writeFile(
    path.join(process.cwd(), 'ng-android.json'),
    JSON.stringify({
      name: config.name,
      packageName: config.packageName,
      minSdkVersion: config.minSdk,
      targetSdkVersion: config.targetSdk,
      bundleEntry: './src/main.ts',
      outputPath: './dist/android',
    }, null, 2)
  );

  console.log(chalk.cyan(`\nCreated Android project in ${androidDir}`));
}

async function buildProject(options) {
  const { execSync } = require('child_process');
  const androidDir = path.join(process.cwd(), 'android');

  // Build Angular bundle first
  console.log(chalk.cyan('Building Angular bundle...'));
  execSync('npm run build', { stdio: 'inherit' });

  // Build Android app
  console.log(chalk.cyan('Building Android app...'));
  const gradleCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  const buildTask = options.release
    ? (options.aab ? 'bundleRelease' : 'assembleRelease')
    : 'assembleDebug';

  execSync(`${gradleCmd} ${buildTask}`, {
    cwd: androidDir,
    stdio: 'inherit'
  });

  const outputPath = options.release
    ? 'app/build/outputs/apk/release/app-release.apk'
    : 'app/build/outputs/apk/debug/app-debug.apk';

  console.log(chalk.green(`\nOutput: ${path.join(androidDir, outputPath)}`));
}

async function runProject(options) {
  const { execSync, spawn } = require('child_process');
  const androidDir = path.join(process.cwd(), 'android');

  // Start dev server in background
  console.log(chalk.cyan('Starting dev server...'));
  const devServer = spawn('node', [path.join(__dirname, 'dev-server.js')], {
    detached: true,
    stdio: 'ignore'
  });
  devServer.unref();

  // Build and install
  console.log(chalk.cyan('Building and installing app...'));
  const gradleCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  const installTask = options.release ? 'installRelease' : 'installDebug';

  execSync(`${gradleCmd} ${installTask}`, {
    cwd: androidDir,
    stdio: 'inherit'
  });

  // Launch app
  const config = await fs.readJson(path.join(process.cwd(), 'ng-android.json'));
  execSync(`adb shell am start -n ${config.packageName}/.MainActivity`, {
    stdio: 'inherit'
  });

  console.log(chalk.green('\n✅ App is running!'));
  console.log(chalk.cyan('Press Ctrl+C to stop the dev server'));
}

async function startDevServer(options) {
  const { createServer } = require('http');
  const WebSocket = require('websocket').server;

  const server = createServer((req, res) => {
    res.writeHead(200);
    res.end('Angular Android Dev Server');
  });

  const wsServer = new WebSocket({
    httpServer: server,
    autoAcceptConnections: false,
  });

  wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin);
    console.log(chalk.green('Device connected'));

    connection.on('message', (message) => {
      if (message.type === 'utf8') {
        console.log(chalk.gray(`[Bridge] ${message.utf8Data}`));
      }
    });

    connection.on('close', () => {
      console.log(chalk.yellow('Device disconnected'));
    });
  });

  server.listen(parseInt(options.port), options.host, () => {
    console.log(chalk.green(`\n🔥 Dev server running at http://${options.host}:${options.port}`));
    console.log(chalk.cyan('Waiting for device connection...'));
  });
}

async function cleanProject() {
  const { execSync } = require('child_process');
  const androidDir = path.join(process.cwd(), 'android');

  if (await fs.pathExists(androidDir)) {
    const gradleCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    execSync(`${gradleCmd} clean`, { cwd: androidDir, stdio: 'inherit' });
  }

  await fs.remove(path.join(process.cwd(), 'dist'));
}

async function viewLogs(options) {
  const { spawn } = require('child_process');

  const args = ['logcat'];

  if (options.clear) {
    args.push('-c');
  }

  if (options.filter) {
    args.push(`${options.filter}:V`, '*:S');
  }

  const logcat = spawn('adb', args, { stdio: 'inherit' });

  logcat.on('error', (error) => {
    throw error;
  });
}

async function listDevices() {
  const { execSync } = require('child_process');

  console.log(chalk.cyan('\nConnected devices:'));
  execSync('adb devices -l', { stdio: 'inherit' });

  console.log(chalk.cyan('\nAvailable emulators:'));
  try {
    execSync('emulator -list-avds', { stdio: 'inherit' });
  } catch {
    console.log(chalk.gray('  No emulators found or emulator command not available'));
  }
}

// Template generators
function generateRootBuildGradle() {
  return `// Top-level build file for Angular Platform Android

buildscript {
    ext.kotlin_version = '1.9.22'

    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.0'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
`;
}

function generateAppBuildGradle(config) {
  return `plugins {
    id 'com.android.application'
    id 'kotlin-android'
}

android {
    namespace '${config.packageName}'
    compileSdk ${config.targetSdk}

    defaultConfig {
        applicationId "${config.packageName}"
        minSdk ${config.minSdk}
        targetSdk ${config.targetSdk}
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            debuggable true
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }

    buildFeatures {
        viewBinding true
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'com.google.code.gson:gson:2.10.1'

    // WebSocket for bridge communication
    implementation 'org.java-websocket:Java-WebSocket:1.5.4'

    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
`;
}

function generateSettingsGradle(name) {
  return `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${name}"
include ':app'
`;
}

function generateGradleProperties() {
  return `# Project-wide Gradle settings
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`;
}

function generateAndroidManifest(config) {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:name=".MainApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AngularAndroid"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`;
}

function generateMainActivity(packageName) {
  return `package ${packageName}

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import ${packageName}.bridge.AngularBridge

class MainActivity : AppCompatActivity() {

    private lateinit var angularBridge: AngularBridge

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Angular bridge
        angularBridge = AngularBridge(this)
        angularBridge.initialize()

        // Set the root view from Angular
        setContentView(angularBridge.getRootView())
    }

    override fun onResume() {
        super.onResume()
        angularBridge.onResume()
    }

    override fun onPause() {
        super.onPause()
        angularBridge.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        angularBridge.onDestroy()
    }

    override fun onBackPressed() {
        if (!angularBridge.handleBackPress()) {
            super.onBackPressed()
        }
    }
}
`;
}

function generateMainApplication(packageName) {
  return `package ${packageName}

import android.app.Application

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize global resources here
    }
}
`;
}

function generateAngularBridge(packageName) {
  return `package ${packageName}.bridge

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.*
import kotlinx.coroutines.*
import org.java_websocket.client.WebSocketClient
import org.java_websocket.handshake.ServerHandshake
import org.json.JSONObject
import java.net.URI
import java.util.concurrent.ConcurrentHashMap

class AngularBridge(private val context: Context) {

    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private val views = ConcurrentHashMap<String, View>()
    private var rootView: FrameLayout? = null
    private var webSocket: WebSocketClient? = null
    private var isConnected = false

    fun initialize() {
        // Create root container
        rootView = FrameLayout(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        // Connect to dev server
        connectToDevServer()
    }

    fun getRootView(): View {
        return rootView ?: throw IllegalStateException("Bridge not initialized")
    }

    private fun connectToDevServer() {
        scope.launch(Dispatchers.IO) {
            try {
                val uri = URI("ws://10.0.2.2:8081/bridge")
                webSocket = object : WebSocketClient(uri) {
                    override fun onOpen(handshakedata: ServerHandshake?) {
                        isConnected = true
                        sendMessage(JSONObject().apply {
                            put("type", "connected")
                            put("payload", JSONObject())
                        })
                    }

                    override fun onMessage(message: String?) {
                        message?.let { handleMessage(it) }
                    }

                    override fun onClose(code: Int, reason: String?, remote: Boolean) {
                        isConnected = false
                    }

                    override fun onError(ex: Exception?) {
                        ex?.printStackTrace()
                    }
                }
                webSocket?.connect()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun handleMessage(message: String) {
        scope.launch(Dispatchers.Main) {
            try {
                val json = JSONObject(message)
                val type = json.getString("type")
                val payload = json.optJSONObject("payload") ?: JSONObject()

                when (type) {
                    "createView" -> createView(payload)
                    "updateView" -> updateView(payload)
                    "removeView" -> removeView(payload)
                    "appendChild" -> appendChild(payload)
                    "setRootView" -> setRootViewFromId(payload)
                    "batchOperations" -> handleBatchOperations(payload)
                    else -> println("Unknown message type: $type")
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun createView(payload: JSONObject) {
        val viewId = payload.getString("viewId")
        val viewType = payload.getString("viewType")
        val props = payload.optJSONObject("props") ?: JSONObject()

        val view = when (viewType) {
            "android.view.ViewGroup", "View" -> FrameLayout(context)
            "android.widget.TextView", "Text" -> TextView(context).apply {
                text = props.optString("text", "")
            }
            "android.widget.ImageView", "Image" -> ImageView(context)
            "android.widget.ScrollView", "ScrollView" -> ScrollView(context)
            "android.widget.EditText", "TextInput" -> EditText(context).apply {
                hint = props.optString("placeholder", "")
            }
            "android.widget.Button", "Button" -> Button(context).apply {
                text = props.optString("title", "")
            }
            "android.widget.ProgressBar", "ActivityIndicator" -> ProgressBar(context)
            else -> FrameLayout(context)
        }

        applyStyle(view, props.optJSONObject("style"))
        views[viewId] = view

        // Send response
        sendResponse(payload.optString("id"), true, JSONObject().put("viewId", viewId))
    }

    private fun updateView(payload: JSONObject) {
        val viewId = payload.getString("viewId")
        val props = payload.optJSONObject("props") ?: JSONObject()

        views[viewId]?.let { view ->
            when (view) {
                is TextView -> {
                    props.optString("text", null)?.let { view.text = it }
                }
                is EditText -> {
                    props.optString("value", null)?.let { view.setText(it) }
                    props.optString("placeholder", null)?.let { view.hint = it }
                }
                is Button -> {
                    props.optString("title", null)?.let { view.text = it }
                }
            }
            applyStyle(view, props.optJSONObject("style"))
        }
    }

    private fun removeView(payload: JSONObject) {
        val viewId = payload.getString("viewId")
        views.remove(viewId)?.let { view ->
            (view.parent as? ViewGroup)?.removeView(view)
        }
    }

    private fun appendChild(payload: JSONObject) {
        val parentId = payload.getString("parentId")
        val childId = payload.getString("childId")

        val parent = views[parentId] as? ViewGroup
        val child = views[childId]

        if (parent != null && child != null) {
            child.parent?.let { (it as? ViewGroup)?.removeView(child) }
            parent.addView(child)
        }
    }

    private fun setRootViewFromId(payload: JSONObject) {
        val viewId = payload.getString("viewId")
        views[viewId]?.let { view ->
            rootView?.removeAllViews()
            view.parent?.let { (it as? ViewGroup)?.removeView(view) }
            rootView?.addView(view)
        }
    }

    private fun handleBatchOperations(payload: JSONObject) {
        val operations = payload.optJSONArray("operations") ?: return

        for (i in 0 until operations.length()) {
            val op = operations.getJSONObject(i)
            when (op.getString("type")) {
                "update" -> updateView(op)
                "remove" -> removeView(op)
                "appendChild" -> appendChild(op)
            }
        }
    }

    private fun applyStyle(view: View, style: JSONObject?) {
        if (style == null) return

        val params = view.layoutParams ?: ViewGroup.MarginLayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )

        // Width & Height
        style.optInt("width", -1).takeIf { it > 0 }?.let {
            params.width = dpToPx(it)
        }
        style.optInt("height", -1).takeIf { it > 0 }?.let {
            params.height = dpToPx(it)
        }

        // Flex
        style.optInt("flex", -1).takeIf { it > 0 }?.let {
            params.width = 0
            params.height = ViewGroup.LayoutParams.MATCH_PARENT
        }

        // Margins
        if (params is ViewGroup.MarginLayoutParams) {
            style.optInt("marginTop", 0).let { params.topMargin = dpToPx(it) }
            style.optInt("marginBottom", 0).let { params.bottomMargin = dpToPx(it) }
            style.optInt("marginLeft", 0).let { params.leftMargin = dpToPx(it) }
            style.optInt("marginRight", 0).let { params.rightMargin = dpToPx(it) }
        }

        // Padding
        val paddingTop = dpToPx(style.optInt("paddingTop", 0))
        val paddingBottom = dpToPx(style.optInt("paddingBottom", 0))
        val paddingLeft = dpToPx(style.optInt("paddingLeft", 0))
        val paddingRight = dpToPx(style.optInt("paddingRight", 0))
        view.setPadding(paddingLeft, paddingTop, paddingRight, paddingBottom)

        // Background color
        style.optString("backgroundColor", null)?.let { color ->
            try {
                view.setBackgroundColor(android.graphics.Color.parseColor(color))
            } catch (e: Exception) { }
        }

        // Text specific
        if (view is TextView) {
            style.optString("color", null)?.let { color ->
                try {
                    view.setTextColor(android.graphics.Color.parseColor(color))
                } catch (e: Exception) { }
            }
            style.optInt("fontSize", -1).takeIf { it > 0 }?.let {
                view.textSize = it.toFloat()
            }
        }

        view.layoutParams = params
    }

    private fun dpToPx(dp: Int): Int {
        return (dp * context.resources.displayMetrics.density).toInt()
    }

    private fun sendMessage(json: JSONObject) {
        scope.launch(Dispatchers.IO) {
            webSocket?.send(json.toString())
        }
    }

    private fun sendResponse(id: String?, success: Boolean, data: JSONObject) {
        if (id == null) return
        sendMessage(JSONObject().apply {
            put("id", id)
            put("success", success)
            put("data", data)
        })
    }

    fun handleBackPress(): Boolean {
        sendMessage(JSONObject().apply {
            put("type", "hardwareBackPress")
            put("payload", JSONObject())
        })
        return true
    }

    fun onResume() {
        sendMessage(JSONObject().apply {
            put("type", "appStateChange")
            put("payload", JSONObject().put("state", "active"))
        })
    }

    fun onPause() {
        sendMessage(JSONObject().apply {
            put("type", "appStateChange")
            put("payload", JSONObject().put("state", "background"))
        })
    }

    fun onDestroy() {
        scope.cancel()
        webSocket?.close()
    }
}
`;
}

function generateStringsXml(name) {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${name}</string>
</resources>
`;
}

function generateStylesXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.AngularAndroid" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryVariant">@color/primary_dark</item>
        <item name="colorOnPrimary">@color/white</item>
        <item name="colorSecondary">@color/accent</item>
        <item name="colorSecondaryVariant">@color/accent</item>
        <item name="colorOnSecondary">@color/white</item>
        <item name="android:statusBarColor">@color/primary_dark</item>
    </style>
</resources>
`;
}

function generateColorsXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#3F51B5</color>
    <color name="primary_dark">#303F9F</color>
    <color name="accent">#FF4081</color>
    <color name="white">#FFFFFF</color>
    <color name="black">#000000</color>
</resources>
`;
}

program.parse();
