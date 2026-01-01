import { InjectionToken, StaticProvider } from '@angular/core';
import { NativeBridge } from '../bridge/native-bridge';
import { AndroidRenderer } from '../runtime/renderer';
import { ViewRegistry } from '../runtime/view-registry';
import { EventDispatcher } from '../runtime/event-dispatcher';

/**
 * Token for the Android platform configuration
 */
export const ANDROID_PLATFORM_CONFIG = new InjectionToken<AndroidPlatformConfig>(
  'ANDROID_PLATFORM_CONFIG'
);

/**
 * Configuration options for the Android platform
 */
export interface AndroidPlatformConfig {
  /** Enable debug mode with verbose logging */
  debug?: boolean;
  /** WebSocket port for bridge communication */
  bridgePort?: number;
  /** Application package name */
  packageName?: string;
  /** Minimum Android SDK version */
  minSdkVersion?: number;
  /** Target Android SDK version */
  targetSdkVersion?: number;
  /** Enable hot reload during development */
  hotReload?: boolean;
  /** Custom native modules to register */
  nativeModules?: NativeModuleConfig[];
}

/**
 * Configuration for custom native modules
 */
export interface NativeModuleConfig {
  name: string;
  className: string;
  methods: string[];
}

/**
 * Default platform configuration
 */
export const DEFAULT_ANDROID_CONFIG: AndroidPlatformConfig = {
  debug: false,
  bridgePort: 8081,
  minSdkVersion: 24,
  targetSdkVersion: 34,
  hotReload: true,
  nativeModules: [],
};

/**
 * Android Platform class that manages the native runtime
 */
export class AndroidPlatform {
  private static instance: AndroidPlatform | null = null;
  private bridge: NativeBridge | null = null;
  private renderer: AndroidRenderer | null = null;
  private viewRegistry: ViewRegistry | null = null;
  private eventDispatcher: EventDispatcher | null = null;
  private config: AndroidPlatformConfig;
  private isInitialized = false;

  private constructor(config: AndroidPlatformConfig) {
    this.config = { ...DEFAULT_ANDROID_CONFIG, ...config };
  }

  /**
   * Get or create the singleton platform instance
   */
  static getInstance(config?: AndroidPlatformConfig): AndroidPlatform {
    if (!AndroidPlatform.instance) {
      AndroidPlatform.instance = new AndroidPlatform(config || DEFAULT_ANDROID_CONFIG);
    }
    return AndroidPlatform.instance;
  }

  /**
   * Initialize the Android platform
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.log('Initializing Angular Platform Android...');

    // Initialize core services
    this.viewRegistry = new ViewRegistry();
    this.eventDispatcher = new EventDispatcher();
    this.bridge = new NativeBridge({ port: this.config.bridgePort!, debug: this.config.debug });
    this.renderer = new AndroidRenderer(this.bridge, this.viewRegistry, this.eventDispatcher);

    // Connect to native runtime
    await this.bridge.connect();

    // Register native modules
    for (const module of this.config.nativeModules || []) {
      await this.registerNativeModule(module);
    }

    this.isInitialized = true;
    this.log('Platform initialized successfully');
  }

  /**
   * Register a custom native module
   */
  async registerNativeModule(module: NativeModuleConfig): Promise<void> {
    if (!this.bridge) {
      throw new Error('Platform not initialized');
    }

    await this.bridge.send({
      type: 'registerModule',
      payload: module,
    });

    this.log(`Registered native module: ${module.name}`);
  }

  /**
   * Get the native bridge instance
   */
  getBridge(): NativeBridge {
    if (!this.bridge) {
      throw new Error('Platform not initialized');
    }
    return this.bridge;
  }

  /**
   * Get the renderer instance
   */
  getRenderer(): AndroidRenderer {
    if (!this.renderer) {
      throw new Error('Platform not initialized');
    }
    return this.renderer;
  }

  /**
   * Get the view registry instance
   */
  getViewRegistry(): ViewRegistry {
    if (!this.viewRegistry) {
      throw new Error('Platform not initialized');
    }
    return this.viewRegistry;
  }

  /**
   * Get the event dispatcher instance
   */
  getEventDispatcher(): EventDispatcher {
    if (!this.eventDispatcher) {
      throw new Error('Platform not initialized');
    }
    return this.eventDispatcher;
  }

  /**
   * Get platform configuration
   */
  getConfig(): AndroidPlatformConfig {
    return this.config;
  }

  /**
   * Shutdown the platform
   */
  async destroy(): Promise<void> {
    if (this.bridge) {
      await this.bridge.disconnect();
    }
    this.isInitialized = false;
    AndroidPlatform.instance = null;
    this.log('Platform destroyed');
  }

  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[AndroidPlatform] ${message}`);
    }
  }
}

/**
 * Create platform providers for dependency injection
 */
export function createAndroidPlatformProviders(
  config: AndroidPlatformConfig = {}
): StaticProvider[] {
  const platform = AndroidPlatform.getInstance(config);

  return [
    { provide: ANDROID_PLATFORM_CONFIG, useValue: config },
    { provide: AndroidPlatform, useValue: platform },
    { provide: NativeBridge, useFactory: () => platform.getBridge() },
    { provide: AndroidRenderer, useFactory: () => platform.getRenderer() },
    { provide: ViewRegistry, useFactory: () => platform.getViewRegistry() },
    { provide: EventDispatcher, useFactory: () => platform.getEventDispatcher() },
  ];
}
