/**
 * High-performance message queue for bridge communication
 *
 * Features:
 * - Object pooling to reduce GC pressure
 * - Batched message sending
 * - Priority-based scheduling
 * - Lazy serialization
 */

import { BridgeMessage, JsonValue } from './native-bridge';

/**
 * Message priority levels
 */
export enum MessagePriority {
  /** UI updates that affect visual appearance */
  High = 0,
  /** Standard operations */
  Normal = 1,
  /** Background operations */
  Low = 2,
}

/**
 * Queued message with metadata
 */
interface QueuedMessage {
  message: BridgeMessage;
  priority: MessagePriority;
  timestamp: number;
}

/**
 * Message pool for object reuse
 */
class MessagePool {
  private readonly pool: BridgeMessage[] = [];
  private readonly maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  acquire(): BridgeMessage {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return { type: '', payload: null };
  }

  release(message: BridgeMessage): void {
    if (this.pool.length < this.maxSize) {
      // Reset message for reuse
      message.id = undefined;
      message.type = '';
      message.payload = null;
      message.timestamp = undefined;
      this.pool.push(message);
    }
  }

  get size(): number {
    return this.pool.length;
  }
}

/**
 * High-performance message queue
 */
export class MessageQueue {
  private readonly queues: QueuedMessage[][] = [[], [], []]; // One per priority
  private readonly pool = new MessagePool(100);
  private isFlushScheduled = false;
  private readonly batchSize: number;
  private readonly flushInterval: number;

  private sendCallback: ((messages: BridgeMessage[]) => Promise<void>) | null = null;

  constructor(options: { batchSize?: number; flushInterval?: number } = {}) {
    this.batchSize = options.batchSize ?? 50;
    this.flushInterval = options.flushInterval ?? 16; // ~60fps
  }

  /**
   * Set the callback for sending batched messages
   */
  setSendCallback(callback: (messages: BridgeMessage[]) => Promise<void>): void {
    this.sendCallback = callback;
  }

  /**
   * Enqueue a message for sending
   */
  enqueue(
    type: string,
    payload: JsonValue,
    priority: MessagePriority = MessagePriority.Normal
  ): void {
    const message = this.pool.acquire();
    message.type = type;
    message.payload = payload;
    message.timestamp = Date.now();

    this.queues[priority].push({
      message,
      priority,
      timestamp: Date.now(),
    });

    this.scheduleFlush();
  }

  /**
   * Enqueue a high-priority message (UI updates)
   */
  enqueueHigh(type: string, payload: JsonValue): void {
    this.enqueue(type, payload, MessagePriority.High);
  }

  /**
   * Enqueue a low-priority message (background tasks)
   */
  enqueueLow(type: string, payload: JsonValue): void {
    this.enqueue(type, payload, MessagePriority.Low);
  }

  /**
   * Schedule a flush of the queue
   */
  private scheduleFlush(): void {
    if (this.isFlushScheduled) {
      return;
    }

    this.isFlushScheduled = true;

    // Use setTimeout for consistent timing (could use requestAnimationFrame in browser)
    setTimeout(() => {
      void this.flush();
    }, this.flushInterval);
  }

  /**
   * Flush queued messages
   */
  async flush(): Promise<void> {
    this.isFlushScheduled = false;

    if (!this.sendCallback) {
      return;
    }

    const messagesToSend: BridgeMessage[] = [];

    // Process queues by priority (high first)
    for (let priority = 0; priority < this.queues.length; priority++) {
      const queue = this.queues[priority];

      while (queue.length > 0 && messagesToSend.length < this.batchSize) {
        const queued = queue.shift()!;
        messagesToSend.push(queued.message);
      }
    }

    if (messagesToSend.length === 0) {
      return;
    }

    try {
      await this.sendCallback(messagesToSend);

      // Return messages to pool
      for (const message of messagesToSend) {
        this.pool.release(message);
      }
    } catch (error) {
      // On error, re-queue messages at high priority
      for (const message of messagesToSend) {
        this.queues[MessagePriority.High].unshift({
          message,
          priority: MessagePriority.High,
          timestamp: Date.now(),
        });
      }
      throw error;
    }

    // If there are more messages, schedule another flush
    if (this.queues.some((q) => q.length > 0)) {
      this.scheduleFlush();
    }
  }

  /**
   * Force an immediate flush
   */
  async flushImmediate(): Promise<void> {
    this.isFlushScheduled = false;
    await this.flush();
  }

  /**
   * Get total pending message count
   */
  get pendingCount(): number {
    return this.queues.reduce((sum, q) => sum + q.length, 0);
  }

  /**
   * Clear all pending messages
   */
  clear(): void {
    for (const queue of this.queues) {
      while (queue.length > 0) {
        const queued = queue.pop()!;
        this.pool.release(queued.message);
      }
    }
    this.isFlushScheduled = false;
  }
}

/**
 * Create a batched message for multiple operations
 */
export function createBatchMessage(
  operations: Array<{ type: string; payload: JsonValue }>
): BridgeMessage {
  return {
    type: 'batch',
    payload: { operations },
    timestamp: Date.now(),
  };
}
