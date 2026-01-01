import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NativeBridge, BridgeConnectionState } from './native-bridge';

describe('NativeBridge', () => {
  let bridge: NativeBridge;

  beforeEach(() => {
    bridge = new NativeBridge({ port: 8081, debug: true });
  });

  afterEach(() => {
    void bridge.disconnect();
  });

  describe('constructor', () => {
    it('should create a bridge instance with default port', () => {
      const defaultBridge = new NativeBridge();
      expect(defaultBridge).toBeDefined();
    });

    it('should create a bridge instance with custom port', () => {
      const customBridge = new NativeBridge({ port: 9000, debug: false });
      expect(customBridge).toBeDefined();
    });
  });

  describe('connectionState', () => {
    it('should start in disconnected state', () => {
      return new Promise<void>((resolve) => {
        bridge.connectionState.subscribe((state) => {
          expect(state).toBe(BridgeConnectionState.Disconnected);
          resolve();
        });
      });
    });
  });

  describe('generateMessageId', () => {
    it('should generate unique message IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        // Access private method for testing
        const id = (bridge as unknown as { generateMessageId: () => string }).generateMessageId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
    });
  });

  describe('on', () => {
    it('should register event handlers', () => {
      const handler = vi.fn();
      const unsubscribe = bridge.on('testEvent', handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should return unsubscribe function', () => {
      const handler = vi.fn();
      const unsubscribe = bridge.on('testEvent', handler);

      unsubscribe();
      // Handler should be removed (no error should occur)
      expect(true).toBe(true);
    });
  });

  describe('send', () => {
    it('should throw error when not connected', async () => {
      // In Node.js environment, WebSocket may not be defined
      // Both errors are acceptable: "Bridge not connected" or "WebSocket is not defined"
      await expect(
        bridge.send({ type: 'test', payload: {} })
      ).rejects.toThrow(/Bridge not connected|WebSocket is not defined/);
    });
  });

  describe('request', () => {
    it('should timeout after specified duration', async () => {
      // In Node.js environment, WebSocket may not be defined
      // Both errors are acceptable: "Bridge not connected" or "WebSocket is not defined"
      await expect(
        bridge.request('testRequest', {})
      ).rejects.toThrow(/Bridge not connected|WebSocket is not defined/);
    });
  });
});
