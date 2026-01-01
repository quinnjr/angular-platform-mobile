import { benchmark, formatResult, BenchmarkResult } from './benchmark';
import { BridgeMessage, JsonValue } from '../bridge/native-bridge';

/**
 * Bridge performance benchmarks
 */

/**
 * Benchmark message ID generation
 */
function benchmarkMessageIdGeneration(): BenchmarkResult {
  let counter = 0;

  return benchmark(
    'Message ID Generation',
    () => {
      // Access private method via any
      counter++;
      `msg_${counter}_${Date.now()}`;
    },
    { iterations: 100000 }
  );
}

/**
 * Benchmark JSON serialization of messages
 */
function benchmarkMessageSerialization(): BenchmarkResult {
  const smallMessage: BridgeMessage = {
    id: 'msg_1_1234567890',
    type: 'updateView',
    payload: { viewId: 'view_1', props: { text: 'Hello' } },
    timestamp: Date.now(),
  };

  const mediumMessage: BridgeMessage = {
    id: 'msg_1_1234567890',
    type: 'updateView',
    payload: {
      viewId: 'view_1',
      props: {
        text: 'Hello World',
        style: {
          flex: 1,
          backgroundColor: '#ffffff',
          padding: 16,
          margin: 8,
          borderRadius: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
      },
    },
    timestamp: Date.now(),
  };

  const largePayload: JsonValue = {
    viewId: 'view_1',
    operations: Array.from({ length: 100 }, (_, i) => ({
      type: 'update',
      viewId: `view_${i}`,
      props: { text: `Item ${i}`, index: i },
    })),
  };

  const largeMessage: BridgeMessage = {
    id: 'msg_1_1234567890',
    type: 'batchOperations',
    payload: largePayload,
    timestamp: Date.now(),
  };

  const smallResult = benchmark(
    'JSON Serialize (small message)',
    () => {
      JSON.stringify(smallMessage);
    },
    { iterations: 50000 }
  );

  const mediumResult = benchmark(
    'JSON Serialize (medium message)',
    () => {
      JSON.stringify(mediumMessage);
    },
    { iterations: 50000 }
  );

  const largeResult = benchmark(
    'JSON Serialize (large message)',
    () => {
      JSON.stringify(largeMessage);
    },
    { iterations: 10000 }
  );

  console.log(formatResult(smallResult));
  console.log(formatResult(mediumResult));
  console.log(formatResult(largeResult));

  return mediumResult;
}

/**
 * Benchmark JSON parsing of messages
 */
function benchmarkMessageParsing(): BenchmarkResult {
  const messageJson = JSON.stringify({
    id: 'msg_1_1234567890',
    success: true,
    data: {
      viewId: 'view_1',
      measurement: { x: 0, y: 100, width: 375, height: 44 },
    },
  });

  return benchmark(
    'JSON Parse (response)',
    () => {
      JSON.parse(messageJson);
    },
    { iterations: 50000 }
  );
}

/**
 * Benchmark event handler dispatch
 */
function benchmarkEventDispatch(): BenchmarkResult {
  const handlers = new Map<string, Set<(data: unknown) => void>>();

  // Register 10 handlers for an event type
  const eventType = 'viewEvent';
  handlers.set(eventType, new Set());
  for (let i = 0; i < 10; i++) {
    handlers.get(eventType)!.add(() => {
      // No-op handler
    });
  }

  const payload = { viewId: 'view_1', eventType: 'press', data: {} };

  return benchmark(
    'Event Handler Dispatch (10 handlers)',
    () => {
      const eventHandlers = handlers.get(eventType);
      if (eventHandlers) {
        eventHandlers.forEach((handler) => handler(payload));
      }
    },
    { iterations: 50000 }
  );
}

/**
 * Benchmark pending request management
 */
function benchmarkPendingRequests(): BenchmarkResult {
  const pendingRequests = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();

  let id = 0;

  return benchmark(
    'Pending Request Add/Remove',
    () => {
      const requestId = `msg_${++id}`;
      pendingRequests.set(requestId, {
        resolve: () => {},
        reject: () => {},
      });
      pendingRequests.delete(requestId);
    },
    { iterations: 50000 }
  );
}

/**
 * Run all bridge benchmarks
 */
export async function runBridgeBenchmarks(): Promise<BenchmarkResult[]> {
  console.log('\n🌉 Bridge Performance Benchmarks\n');
  console.log('='.repeat(50));

  const results: BenchmarkResult[] = [];

  results.push(benchmarkMessageIdGeneration());
  console.log(formatResult(results[results.length - 1]));
  console.log();

  benchmarkMessageSerialization(); // Logs internally
  console.log();

  results.push(benchmarkMessageParsing());
  console.log(formatResult(results[results.length - 1]));
  console.log();

  results.push(benchmarkEventDispatch());
  console.log(formatResult(results[results.length - 1]));
  console.log();

  results.push(benchmarkPendingRequests());
  console.log(formatResult(results[results.length - 1]));

  return results;
}
