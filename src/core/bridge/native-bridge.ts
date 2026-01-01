import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { PlatformType, Platform } from '../platform/platform';

/**
 * Generic JSON-serializable value
 */
export type JsonPrimitive = string | number | boolean | null | undefined;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue | undefined }
export type JsonArray = JsonValue[];

/**
 * Generic payload type (more flexible than JsonValue)
 */
export type BridgePayload = Record<string, unknown>;

/**
 * Message structure for bridge communication
 */
export interface BridgeMessage<T = JsonValue> {
  id?: string;
  type: string;
  payload: T;
  timestamp?: number;
}

/**
 * Response from native side
 */
export interface BridgeResponse<T = JsonValue> {
  id: string;
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Connection state for the bridge
 */
export enum BridgeConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error',
}

/**
 * Bridge transport type
 */
export type BridgeTransport = 'websocket' | 'native-android' | 'native-ios';

/**
 * Bridge configuration
 */
export interface BridgeConfig {
  port?: number;
  debug?: boolean;
  platform?: PlatformType;
  transport?: BridgeTransport;
}

/**
 * Native bridge interface for iOS
 */
interface IOSNativeBridge {
  registerCallback: (callback: (message: string) => void) => void;
  postMessage: (data: string) => void;
}

/**
 * Native bridge interface for Android
 */
interface AndroidNativeBridge {
  registerCallback: (callback: (message: string) => void) => void;
  postMessage: (data: string) => void;
}

/**
 * WKWebView message handler interface
 */
interface WKWebViewMessageHandler {
  postMessage: (data: string) => void;
}

/**
 * WebKit interface with message handlers
 */
interface WebKitInterface {
  messageHandlers?: {
    nativeBridge?: WKWebViewMessageHandler;
  };
}

/**
 * Extended global interface for native bridges
 */
interface NativeGlobal {
  __IOS_BRIDGE__?: IOSNativeBridge;
  __ANDROID_BRIDGE__?: AndroidNativeBridge;
  __handleNativeMessage?: (messageJson: string) => void;
  webkit?: WebKitInterface;
  navigator?: { userAgent?: string };
}

/**
 * Get typed global object
 */
function getNativeGlobal(): NativeGlobal {
  return globalThis as unknown as NativeGlobal;
}

/**
 * Event handler function type
 */
export type EventHandler<T = unknown> = (data: T) => void;

/**
 * Native Bridge for communication between Angular and native runtime
 *
 * This class handles all bidirectional communication with the native
 * layer (iOS or Android) using platform-appropriate protocols:
 * - iOS: JavaScriptCore bridge or WKWebView message handlers
 * - Android: WebSocket or native JSInterface
 */
export class NativeBridge {
  private socket: WebSocket | null = null;
  private messageId = 0;
  private readonly port: number;
  private readonly debug: boolean;
  private readonly platform: PlatformType;
  private transport: BridgeTransport = 'websocket';

  private readonly messages$ = new Subject<BridgeMessage>();
  private readonly responses$ = new Subject<BridgeResponse>();
  private readonly connectionState$ = new BehaviorSubject<BridgeConnectionState>(
    BridgeConnectionState.Disconnected
  );

  private readonly eventHandlers = new Map<string, Set<EventHandler<unknown>>>();
  private readonly pendingRequests = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();

  constructor(config: BridgeConfig = {}) {
    this.port = config.port ?? 8081;
    this.debug = config.debug ?? false;
    this.platform = config.platform ?? Platform.detect();
    this.transport = config.transport ?? this.detectTransport();
  }

  /**
   * Detect the appropriate transport for the current platform
   */
  private detectTransport(): BridgeTransport {
    const global = getNativeGlobal();

    // Check for iOS native bridge
    if (global.__IOS_BRIDGE__ !== undefined ||
        global.webkit?.messageHandlers?.nativeBridge !== undefined) {
      return 'native-ios';
    }

    // Check for Android native bridge
    if (global.__ANDROID_BRIDGE__ !== undefined) {
      return 'native-android';
    }

    // Fallback to WebSocket for development
    return 'websocket';
  }

  /**
   * Get the current platform
   */
  get currentPlatform(): PlatformType {
    return this.platform;
  }

  /**
   * Get the current transport
   */
  get currentTransport(): BridgeTransport {
    return this.transport;
  }

  /**
   * Get the current connection state
   */
  get connectionState(): Observable<BridgeConnectionState> {
    return this.connectionState$.asObservable();
  }

  /**
   * Get all incoming messages
   */
  get messages(): Observable<BridgeMessage> {
    return this.messages$.asObservable();
  }

  /**
   * Connect to the native runtime
   */
  async connect(): Promise<void> {
    this.connectionState$.next(BridgeConnectionState.Connecting);
    this.log(`Connecting via ${this.transport}...`);

    try {
      switch (this.transport) {
        case 'native-ios':
          await this.connectIOSNative();
          break;
        case 'native-android':
          await this.connectAndroidNative();
          break;
        case 'websocket':
        default:
          await this.connectWebSocket();
          break;
      }

      this.connectionState$.next(BridgeConnectionState.Connected);
      this.log('Connected to native bridge');
    } catch (error) {
      this.connectionState$.next(BridgeConnectionState.Error);
      throw error;
    }
  }

  /**
   * Connect via iOS native bridge (JavaScriptCore or WKWebView)
   */
  private async connectIOSNative(): Promise<void> {
    const global = getNativeGlobal();

    // Check for WKWebView message handlers first (preferred)
    const wkWebView = global.webkit?.messageHandlers?.nativeBridge;
    if (wkWebView) {
      this.setupWKWebViewBridge();
      return;
    }

    // Check for JavaScriptCore bridge
    const iosBridge = global.__IOS_BRIDGE__;
    if (iosBridge) {
      this.setupIOSJSCoreBridge(iosBridge);
      return;
    }

    throw new Error('iOS native bridge not available');
  }

  /**
   * Setup WKWebView message handler bridge
   */
  private setupWKWebViewBridge(): void {
    const global = getNativeGlobal();

    // Register global callback for native -> JS messages
    global.__handleNativeMessage = (messageJson: string) => {
      this.handleMessage(messageJson);
    };

    this.log('WKWebView bridge initialized');
  }

  /**
   * Setup JavaScriptCore bridge (for React Native-style integration)
   */
  private setupIOSJSCoreBridge(iosBridge: IOSNativeBridge): void {
    // Register callback for native -> JS messages
    iosBridge.registerCallback((message: string) => {
      this.handleMessage(message);
    });

    this.log('JavaScriptCore bridge initialized');
  }

  /**
   * Connect via Android native bridge
   */
  private async connectAndroidNative(): Promise<void> {
    const global = getNativeGlobal();
    const androidBridge = global.__ANDROID_BRIDGE__;

    if (!androidBridge) {
      throw new Error('Android native bridge not available');
    }

    // Register callback for native -> JS messages
    androidBridge.registerCallback((message: string) => {
      this.handleMessage(message);
    });

    this.log('Android native bridge initialized');
  }

  /**
   * Connect via WebSocket (development mode)
   */
  private async connectWebSocket(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `ws://localhost:${this.port}/bridge`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          this.log('WebSocket connected');
          resolve();
        };

        this.socket.onmessage = (event: MessageEvent<string>) => {
          this.handleMessage(event.data);
        };

        this.socket.onerror = () => {
          this.log('WebSocket connection error');
          reject(new Error('Failed to connect to native bridge'));
        };

        this.socket.onclose = () => {
          this.log('WebSocket connection closed');
          this.connectionState$.next(BridgeConnectionState.Disconnected);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming message from native side
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data) as BridgeMessage | BridgeResponse;
      this.log(`Received: ${'type' in message ? message.type : 'response'}`);

      // Check if it's a response to a pending request
      if ('success' in message && message.id) {
        const pending = this.pendingRequests.get(message.id);
        if (pending) {
          this.pendingRequests.delete(message.id);
          if (message.success) {
            pending.resolve(message.data);
          } else {
            pending.reject(new Error(message.error ?? 'Unknown error'));
          }
        }
        this.responses$.next(message);
        return;
      }

      // It's an event from native side
      const bridgeMessage = message as BridgeMessage;
      this.messages$.next(bridgeMessage);

      // Dispatch to registered handlers
      const handlers = this.eventHandlers.get(bridgeMessage.type);
      if (handlers) {
        handlers.forEach((handler) => handler(bridgeMessage.payload));
      }
    } catch (error) {
      console.error('[NativeBridge] Failed to parse message:', error);
    }
  }

  /**
   * Send a message to the native side
   */
  async send<T = JsonValue>(message: BridgeMessage<T>): Promise<void> {
    const fullMessage: BridgeMessage<T> = {
      ...message,
      id: message.id ?? this.generateMessageId(),
      timestamp: Date.now(),
    };

    const data = JSON.stringify(fullMessage);
    this.log(`Sending: ${message.type}`);

    switch (this.transport) {
      case 'native-ios':
        this.sendToIOS(data);
        break;
      case 'native-android':
        this.sendToAndroid(data);
        break;
      case 'websocket':
      default:
        this.sendToWebSocket(data);
        break;
    }
  }

  /**
   * Send message to iOS native
   */
  private sendToIOS(data: string): void {
    const global = getNativeGlobal();

    // Try WKWebView first
    const wkWebView = global.webkit?.messageHandlers?.nativeBridge;
    if (wkWebView) {
      wkWebView.postMessage(data);
      return;
    }

    // Try JavaScriptCore bridge
    const iosBridge = global.__IOS_BRIDGE__;
    if (iosBridge) {
      iosBridge.postMessage(data);
      return;
    }

    throw new Error('iOS bridge not connected');
  }

  /**
   * Send message to Android native
   */
  private sendToAndroid(data: string): void {
    const global = getNativeGlobal();
    const androidBridge = global.__ANDROID_BRIDGE__;

    if (androidBridge) {
      androidBridge.postMessage(data);
      return;
    }

    throw new Error('Android bridge not connected');
  }

  /**
   * Send message via WebSocket
   */
  private sendToWebSocket(data: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(data);
      return;
    }

    throw new Error('Bridge not connected');
  }

  /**
   * Send a request and wait for response
   */
  async request<T = unknown, P = BridgePayload>(type: string, payload: P): Promise<T> {
    const id = this.generateMessageId();

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${type}`));
      }, 30000);

      // Register pending request
      this.pendingRequests.set(id, {
        resolve: (value: unknown) => {
          clearTimeout(timeout);
          resolve(value as T);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      // Send the request
      this.send({ id, type, payload: payload as unknown as JsonValue }).catch(reject);
    });
  }

  /**
   * Register an event handler for native events
   */
  on<T = unknown>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.add(handler as EventHandler<unknown>);
    }

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(eventType)?.delete(handler as EventHandler<unknown>);
    };
  }

  /**
   * Wait for a specific event once
   */
  once<T = unknown>(eventType: string): Promise<T> {
    return new Promise((resolve) => {
      const unsubscribe = this.on<T>(eventType, (data) => {
        unsubscribe();
        resolve(data);
      });
    });
  }

  /**
   * Disconnect from native bridge
   */
  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connectionState$.next(BridgeConnectionState.Disconnected);
    this.log('Disconnected from native bridge');
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${++this.messageId}_${Date.now()}`;
  }

  private log(message: string): void {
    if (this.debug) {
      console.log(`[NativeBridge] ${message}`);
    }
  }
}
