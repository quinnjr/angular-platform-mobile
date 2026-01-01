import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { NativeBridge, BridgeConnectionState, JsonValue, BridgePayload } from './native-bridge';

/**
 * View properties type
 */
export type ViewProps = Record<string, JsonValue>;

/**
 * Native method arguments
 */
export type NativeMethodArgs = JsonValue[];

/**
 * View measurement result
 */
export interface ViewMeasurement {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Angular service wrapper for the Native Bridge
 *
 * Provides dependency injection and Angular lifecycle integration
 * for native bridge communication.
 */
@Injectable()
export class BridgeService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly bridge: NativeBridge) {}

  /**
   * Get current connection state
   */
  get connectionState$(): Observable<BridgeConnectionState> {
    return this.bridge.connectionState.pipe(takeUntil(this.destroy$));
  }

  /**
   * Check if bridge is connected
   */
  get isConnected(): boolean {
    return true; // This would check actual state in real implementation
  }

  /**
   * Send a message to native side
   */
  async send(type: string, payload: BridgePayload = {}): Promise<void> {
    return this.bridge.send({ type, payload: payload as JsonValue });
  }

  /**
   * Request data from native side
   */
  async request<T = unknown>(type: string, payload: BridgePayload = {}): Promise<T> {
    return this.bridge.request<T>(type, payload);
  }

  /**
   * Subscribe to native events of a specific type
   */
  on<T = unknown>(eventType: string): Observable<T> {
    return this.bridge.messages.pipe(
      takeUntil(this.destroy$),
      filter((msg) => msg.type === eventType),
      map((msg) => msg.payload as T)
    );
  }

  /**
   * Register a callback for a native event (returns unsubscribe function)
   */
  registerCallback(callback: () => void): string {
    const callbackId = `callback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.bridge.on(callbackId, callback);
    return callbackId;
  }

  /**
   * Call a native module method
   */
  async callNativeMethod<T = unknown>(
    moduleName: string,
    methodName: string,
    args: NativeMethodArgs = []
  ): Promise<T> {
    return this.request<T>('callNativeMethod', {
      module: moduleName,
      method: methodName,
      args,
    });
  }

  /**
   * Create a native view
   */
  async createView(viewType: string, props: ViewProps): Promise<string> {
    return this.request<string>('createView', { viewType, props });
  }

  /**
   * Update a native view's properties
   */
  async updateView(viewId: string, props: ViewProps): Promise<void> {
    return this.send('updateView', { viewId, props });
  }

  /**
   * Remove a native view
   */
  async removeView(viewId: string): Promise<void> {
    return this.send('removeView', { viewId });
  }

  /**
   * Append a child view to a parent
   */
  async appendChild(parentId: string, childId: string): Promise<void> {
    return this.send('appendChild', { parentId, childId });
  }

  /**
   * Insert a child view at a specific index
   */
  async insertChild(parentId: string, childId: string, index: number): Promise<void> {
    return this.send('insertChild', { parentId, childId, index });
  }

  /**
   * Remove a child view from its parent
   */
  async removeChild(parentId: string, childId: string): Promise<void> {
    return this.send('removeChild', { parentId, childId });
  }

  /**
   * Measure a view's layout
   */
  async measureView(viewId: string): Promise<ViewMeasurement> {
    return this.request<ViewMeasurement>('measureView', { viewId });
  }

  /**
   * Set the root view for the application
   */
  async setRootView(viewId: string): Promise<void> {
    return this.send('setRootView', { viewId });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
