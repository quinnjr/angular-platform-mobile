import { benchmark, formatResult, BenchmarkResult } from './benchmark';
import { ViewRegistry, ViewNode } from '../runtime/view-registry';
import { EventDispatcher } from '../runtime/event-dispatcher';
import { transformStyle } from '../../types/style.types';

/**
 * Renderer performance benchmarks
 */

/**
 * Benchmark view registry operations
 */
function benchmarkViewRegistry(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  // Benchmark view ID generation
  const registry = new ViewRegistry();
  results.push(
    benchmark(
      'View ID Generation',
      () => {
        registry.generateViewId();
      },
      { iterations: 100000 }
    )
  );

  // Benchmark view registration
  let viewCounter = 0;
  results.push(
    benchmark(
      'View Registration',
      () => {
        const node: ViewNode = {
          id: `view_${++viewCounter}`,
          type: 'View',
          props: {},
          children: [],
          parent: null,
        };
        registry.register(node);
      },
      { iterations: 50000 }
    )
  );

  // Benchmark view lookup
  const registryWithViews = new ViewRegistry();
  for (let i = 0; i < 1000; i++) {
    registryWithViews.register({
      id: `view_${i}`,
      type: 'View',
      props: {},
      children: [],
      parent: null,
    });
  }

  results.push(
    benchmark(
      'View Lookup (1000 views)',
      () => {
        registryWithViews.get('view_500');
      },
      { iterations: 100000 }
    )
  );

  // Benchmark view hierarchy traversal
  const parentId = 'view_0';
  for (let i = 1; i < 100; i++) {
    const parentNode = registryWithViews.get(parentId);
    if (parentNode) {
      parentNode.children.push(`view_${i}`);
    }
    const childNode = registryWithViews.get(`view_${i}`);
    if (childNode) {
      childNode.parent = parentId;
    }
  }

  results.push(
    benchmark(
      'View Hierarchy Query',
      () => {
        const parent = registryWithViews.get('view_0');
        if (parent) {
          parent.children.map((id) => registryWithViews.get(id));
        }
      },
      { iterations: 10000 }
    )
  );

  return results;
}

/**
 * Benchmark event dispatcher
 */
function benchmarkEventDispatcher(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];
  const dispatcher = new EventDispatcher();

  // Register handlers
  for (let i = 0; i < 100; i++) {
    dispatcher.register(`view_${i}`, 'press', () => {});
    dispatcher.register(`view_${i}`, 'longPress', () => {});
  }

  // Benchmark event dispatch
  results.push(
    benchmark(
      'Event Dispatch (single handler)',
      () => {
        dispatcher.dispatch('view_50', 'press', {});
      },
      { iterations: 50000 }
    )
  );

  // Benchmark with multiple handlers per view
  for (let i = 0; i < 10; i++) {
    dispatcher.register('view_0', 'press', () => {});
  }

  results.push(
    benchmark(
      'Event Dispatch (10 handlers)',
      () => {
        dispatcher.dispatch('view_0', 'press', {});
      },
      { iterations: 50000 }
    )
  );

  // Benchmark global handler dispatch
  for (let i = 0; i < 5; i++) {
    dispatcher.registerGlobal('scroll', () => {});
  }

  results.push(
    benchmark(
      'Global Event Dispatch (5 handlers)',
      () => {
        dispatcher.dispatch('view_0', 'scroll', { x: 0, y: 100 });
      },
      { iterations: 50000 }
    )
  );

  return results;
}

/**
 * Benchmark style transformation
 */
function benchmarkStyleTransform(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  // Simple style
  const simpleStyle = {
    flex: 1,
    backgroundColor: '#ffffff',
  };

  results.push(
    benchmark(
      'Style Transform (simple)',
      () => {
        transformStyle(simpleStyle);
      },
      { iterations: 50000 }
    )
  );

  // Complex style
  const complexStyle = {
    flex: 1,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#ffffff',
    padding: 16,
    paddingTop: 20,
    paddingBottom: 20,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  };

  results.push(
    benchmark(
      'Style Transform (complex)',
      () => {
        transformStyle(complexStyle);
      },
      { iterations: 50000 }
    )
  );

  // Style with transforms
  const transformedStyle = {
    ...complexStyle,
    transform: [
      { translateX: 10 },
      { translateY: 20 },
      { rotate: '45deg' },
      { scale: 1.2 },
    ],
  };

  results.push(
    benchmark(
      'Style Transform (with transforms)',
      () => {
        transformStyle(transformedStyle);
      },
      { iterations: 50000 }
    )
  );

  return results;
}

/**
 * Benchmark operation batching
 */
function benchmarkOperationBatching(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  // Simulate operation queue
  type Operation = { type: string; viewId: string; props?: Record<string, unknown> };
  const operations: Operation[] = [];

  results.push(
    benchmark(
      'Queue Operation',
      () => {
        operations.push({
          type: 'update',
          viewId: 'view_1',
          props: { text: 'Hello' },
        });
      },
      { iterations: 100000 }
    )
  );

  // Fill queue
  for (let i = 0; i < 100; i++) {
    operations.push({
      type: 'update',
      viewId: `view_${i}`,
      props: { text: `Item ${i}` },
    });
  }

  results.push(
    benchmark(
      'Flush Operations (100 ops)',
      () => {
        const batch = operations.splice(0, 100);
        JSON.stringify({ operations: batch });
      },
      { iterations: 10000 }
    )
  );

  return results;
}

/**
 * Run all renderer benchmarks
 */
export async function runRendererBenchmarks(): Promise<BenchmarkResult[]> {
  console.log('\n🎨 Renderer Performance Benchmarks\n');
  console.log('='.repeat(50));

  const allResults: BenchmarkResult[] = [];

  console.log('\n📦 View Registry:\n');
  const registryResults = benchmarkViewRegistry();
  registryResults.forEach((r) => {
    console.log(formatResult(r));
    console.log();
  });
  allResults.push(...registryResults);

  console.log('\n📡 Event Dispatcher:\n');
  const dispatcherResults = benchmarkEventDispatcher();
  dispatcherResults.forEach((r) => {
    console.log(formatResult(r));
    console.log();
  });
  allResults.push(...dispatcherResults);

  console.log('\n🎨 Style Transform:\n');
  const styleResults = benchmarkStyleTransform();
  styleResults.forEach((r) => {
    console.log(formatResult(r));
    console.log();
  });
  allResults.push(...styleResults);

  console.log('\n📦 Operation Batching:\n');
  const batchResults = benchmarkOperationBatching();
  batchResults.forEach((r) => {
    console.log(formatResult(r));
    console.log();
  });
  allResults.push(...batchResults);

  return allResults;
}
