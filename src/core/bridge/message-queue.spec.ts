import { describe, it, expect, beforeEach } from 'vitest';
import { MessageQueue, MessagePriority, createBatchMessage } from './message-queue';
import { BridgeMessage } from './native-bridge';

describe('MessageQueue', () => {
  let queue: MessageQueue;

  beforeEach(() => {
    queue = new MessageQueue({ batchSize: 10, flushInterval: 1 });
  });

  describe('enqueue', () => {
    it('should add messages to the queue', () => {
      queue.enqueue('test', { foo: 'bar' });
      expect(queue.pendingCount).toBe(1);
    });

    it('should support different priorities', () => {
      queue.enqueue('normal', {}, MessagePriority.Normal);
      queue.enqueue('high', {}, MessagePriority.High);
      queue.enqueue('low', {}, MessagePriority.Low);

      expect(queue.pendingCount).toBe(3);
    });
  });

  describe('enqueueHigh', () => {
    it('should enqueue with high priority', () => {
      queue.enqueueHigh('urgent', { data: 'important' });
      expect(queue.pendingCount).toBe(1);
    });
  });

  describe('enqueueLow', () => {
    it('should enqueue with low priority', () => {
      queue.enqueueLow('background', { data: 'not urgent' });
      expect(queue.pendingCount).toBe(1);
    });
  });

  describe('flush', () => {
    it('should flush messages when callback is set', async () => {
      const sentTypes: string[] = [];

      queue.setSendCallback(async (messages) => {
        // Capture types before messages are released to pool
        sentTypes.push(...messages.map((m) => m.type));
      });

      queue.enqueue('test1', { id: 1 });
      queue.enqueue('test2', { id: 2 });

      await queue.flushImmediate();

      expect(sentTypes).toHaveLength(2);
      expect(sentTypes[0]).toBe('test1');
      expect(sentTypes[1]).toBe('test2');
    });

    it('should prioritize high-priority messages', async () => {
      const sentTypes: string[] = [];

      queue.setSendCallback(async (messages) => {
        // Capture types before messages are released to pool
        sentTypes.push(...messages.map((m) => m.type));
      });

      queue.enqueue('low', {}, MessagePriority.Low);
      queue.enqueue('normal', {}, MessagePriority.Normal);
      queue.enqueue('high', {}, MessagePriority.High);

      await queue.flushImmediate();

      expect(sentTypes[0]).toBe('high');
      expect(sentTypes[1]).toBe('normal');
      expect(sentTypes[2]).toBe('low');
    });

    it('should respect batch size', async () => {
      const batches: BridgeMessage[][] = [];

      queue.setSendCallback(async (messages) => {
        batches.push([...messages]);
      });

      // Add 25 messages (batch size is 10)
      for (let i = 0; i < 25; i++) {
        queue.enqueue(`msg${i}`, { i });
      }

      // Flush until empty
      while (queue.pendingCount > 0) {
        await queue.flushImmediate();
      }

      expect(batches.length).toBe(3);
      expect(batches[0].length).toBe(10);
      expect(batches[1].length).toBe(10);
      expect(batches[2].length).toBe(5);
    });

    it('should do nothing without callback', async () => {
      queue.enqueue('test', {});

      // Should not throw
      await queue.flushImmediate();

      expect(queue.pendingCount).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all pending messages', () => {
      queue.enqueue('test1', {});
      queue.enqueue('test2', {});
      queue.enqueue('test3', {});

      expect(queue.pendingCount).toBe(3);

      queue.clear();

      expect(queue.pendingCount).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should re-queue messages on error', async () => {
      let errorThrown = false;

      queue.setSendCallback(async () => {
        if (!errorThrown) {
          errorThrown = true;
          throw new Error('Send failed');
        }
      });

      queue.enqueue('test', { id: 1 });

      // First flush fails
      await expect(queue.flushImmediate()).rejects.toThrow('Send failed');

      // Messages should be re-queued at high priority
      expect(queue.pendingCount).toBe(1);

      // Second flush succeeds
      await queue.flushImmediate();
      expect(queue.pendingCount).toBe(0);
    });
  });

  describe('auto scheduling', () => {
    it('should schedule flush automatically', async () => {
      const sentMessages: BridgeMessage[] = [];

      queue.setSendCallback(async (messages) => {
        sentMessages.push(...messages);
      });

      queue.enqueue('auto', { scheduled: true });

      // Wait for auto flush
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(sentMessages).toHaveLength(1);
    });
  });
});

describe('createBatchMessage', () => {
  it('should create a batch message', () => {
    const operations = [
      { type: 'updateView', payload: { viewId: 'v1' } },
      { type: 'updateView', payload: { viewId: 'v2' } },
    ];

    const batch = createBatchMessage(operations);

    expect(batch.type).toBe('batch');
    expect(batch.payload).toHaveProperty('operations');
    expect(batch.timestamp).toBeDefined();
  });
});
