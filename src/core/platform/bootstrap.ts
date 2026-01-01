import { Type, NgModuleRef, ApplicationRef, PlatformRef, Provider } from '@angular/core';
import { AndroidPlatform, AndroidPlatformConfig } from './platform-android';

/**
 * Global interface for error handler
 */
interface GlobalWithErrorHandler {
  __androidErrorHandler?: (error: Error) => void;
}

/**
 * Bootstrap options for Android platform
 */
export interface AndroidBootstrapOptions {
  /** Platform configuration */
  config?: AndroidPlatformConfig;
  /** Enable production mode */
  production?: boolean;
  /** Custom error handler */
  errorHandler?: (error: Error) => void;
}

/**
 * Extended bootstrap options with providers
 */
export interface ExtendedBootstrapOptions extends AndroidBootstrapOptions {
  /** Additional providers */
  providers?: Provider[];
}

/**
 * Bootstrap an Angular application for Android
 *
 * This function initializes the Android platform and bootstraps
 * the root Angular module for native rendering.
 *
 * @example
 * ```typescript
 * import { bootstrapAndroid } from '@pegasusheavy/angular-platform-mobile';
 * import { AppModule } from './app/app.module';
 *
 * bootstrapAndroid(AppModule, {
 *   config: {
 *     debug: true,
 *     packageName: 'com.myapp.android'
 *   }
 * }).catch(err => console.error(err));
 * ```
 */
export async function bootstrapAndroid<M>(
  moduleType: Type<M>,
  options: AndroidBootstrapOptions = {}
): Promise<NgModuleRef<M>> {
  const { config = {}, production = false, errorHandler } = options;

  // Set up global error handling
  if (errorHandler) {
    const global = globalThis as GlobalWithErrorHandler;
    global.__androidErrorHandler = errorHandler;
  }

  // Initialize the Android platform
  const platform = AndroidPlatform.getInstance(config);
  await platform.initialize();

  // Create Angular platform
  const ngPlatform = createAndroidNgPlatform(platform);

  try {
    // Bootstrap the module
    const moduleRef = await bootstrapModule(ngPlatform, moduleType);

    // Set up hot reload if enabled
    if (config.hotReload && !production) {
      setupHotReload(platform, moduleRef);
    }

    // Notify native side that app is ready
    await platform.getBridge().send({
      type: 'appReady',
      payload: { timestamp: Date.now() },
    });

    console.log('[Angular Platform Mobile] Application bootstrapped successfully');
    return moduleRef;
  } catch (error) {
    console.error('[Angular Platform Mobile] Bootstrap failed:', error);
    if (errorHandler && error instanceof Error) {
      errorHandler(error);
    }
    throw error;
  }
}

/**
 * Create the Angular platform reference for Android
 */
function createAndroidNgPlatform(_androidPlatform: AndroidPlatform): PlatformRef {
  // Create a simple platform - createPlatform expects Injector but we use platformBrowser
  // This is a placeholder that returns a minimal platform ref
  const { platformBrowser } = require('@angular/platform-browser');
  return platformBrowser() as PlatformRef;
}

/**
 * Bootstrap an Angular module
 */
async function bootstrapModule<M>(
  _platform: PlatformRef,
  moduleType: Type<M>
): Promise<NgModuleRef<M>> {
  // Dynamic import to support lazy loading
  const { platformBrowser } = await import('@angular/platform-browser');
  const browserPlatform = platformBrowser();

  return browserPlatform.bootstrapModule(moduleType);
}

/**
 * Set up hot reload functionality for development
 */
function setupHotReload<M>(platform: AndroidPlatform, moduleRef: NgModuleRef<M>): void {
  const bridge = platform.getBridge();

  bridge.on('hotReload', async (_data: { bundleUrl: string }) => {
    console.log('[HotReload] Reloading application...');

    try {
      // Destroy current module
      moduleRef.destroy();

      // Notify ready for reload
      await bridge.send({
        type: 'hotReloadReady',
        payload: {},
      });
    } catch (error) {
      console.error('[HotReload] Failed:', error);
    }
  });

  console.log('[HotReload] Enabled');
}

/**
 * Standalone component bootstrap for Angular 17+
 */
export async function bootstrapAndroidApplication<T>(
  rootComponent: Type<T>,
  options: ExtendedBootstrapOptions = {}
): Promise<ApplicationRef> {
  const { config = {}, providers = [] } = options;

  // Initialize the Android platform
  const platform = AndroidPlatform.getInstance(config);
  await platform.initialize();

  // Use standalone bootstrap
  const { bootstrapApplication } = await import('@angular/platform-browser');

  const appRef = await bootstrapApplication(rootComponent, {
    providers: [
      { provide: AndroidPlatform, useValue: platform },
      ...providers,
    ],
  });

  // Notify native side
  await platform.getBridge().send({
    type: 'appReady',
    payload: { timestamp: Date.now() },
  });

  return appRef;
}

/**
 * Bootstrap for mobile platform (cross-platform)
 */
export async function bootstrapMobileApplication<T>(
  rootComponent: Type<T>,
  options: ExtendedBootstrapOptions = {}
): Promise<ApplicationRef> {
  // For now, delegate to Android bootstrap
  // iOS bootstrap would be added here with platform detection
  return bootstrapAndroidApplication(rootComponent, options);
}
