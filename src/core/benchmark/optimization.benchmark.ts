import { benchmark, formatResult, compareResults } from './benchmark';
import { transformStyle } from '../../types/style.types';
import { cachedTransformStyle, cachedMergeStyles, StyleCache } from '../cache/style-cache';
import { FastEasing } from '../animation/easing-lut';
import { Easing } from '../animation/animated';

/**
 * Benchmarks comparing optimized vs original implementations
 */

/**
 * Benchmark style caching optimization
 */
function benchmarkStyleCaching(): void {
  console.log('\n🎨 Style Caching Optimization\n');

  // Clear cache for accurate comparison
  StyleCache.clear();

  const complexStyle = {
    flex: 1,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#ffffff',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
  };

  // Original without cache
  const originalResult = benchmark(
    'transformStyle (no cache)',
    () => {
      transformStyle(complexStyle);
    },
    { iterations: 50000 }
  );
  console.log(formatResult(originalResult));

  // First run - cache miss
  StyleCache.clear();
  const cacheMissResult = benchmark(
    'cachedTransformStyle (cache miss)',
    () => {
      StyleCache.clear();
      cachedTransformStyle(complexStyle);
    },
    { iterations: 10000 }
  );
  console.log(formatResult(cacheMissResult));

  // Cache hit scenario - same object
  cachedTransformStyle(complexStyle); // Prime cache
  const cacheHitResult = benchmark(
    'cachedTransformStyle (cache hit)',
    () => {
      cachedTransformStyle(complexStyle);
    },
    { iterations: 100000 }
  );
  console.log(formatResult(cacheHitResult));

  console.log('\n' + compareResults(originalResult, cacheHitResult));
  console.log(`\nCache stats: ${JSON.stringify(StyleCache.stats)}`);
}

/**
 * Benchmark merged style optimization
 */
function benchmarkMergedStyles(): void {
  console.log('\n🔀 Merged Styles Optimization\n');

  const baseStyle = { flex: 1, backgroundColor: '#fff' };
  const overrideStyle = { padding: 16, margin: 8 };
  const activeStyle = { borderColor: '#007AFF', borderWidth: 2 };

  // Original approach - manual merge + transform
  const originalResult = benchmark(
    'Manual merge + transform',
    () => {
      const merged = { ...baseStyle, ...overrideStyle, ...activeStyle };
      transformStyle(merged);
    },
    { iterations: 50000 }
  );
  console.log(formatResult(originalResult));

  // Optimized approach
  StyleCache.clear();
  const optimizedResult = benchmark(
    'cachedMergeStyles',
    () => {
      cachedMergeStyles(baseStyle, overrideStyle, activeStyle);
    },
    { iterations: 50000 }
  );
  console.log(formatResult(optimizedResult));

  console.log('\n' + compareResults(originalResult, optimizedResult));
}

/**
 * Benchmark easing LUT optimization
 */
function benchmarkEasingLUT(): void {
  console.log('\n📈 Easing LUT Optimization\n');

  const testValue = 0.5;

  // Original bezier implementation
  const originalEase = Easing.ease;
  const originalResult = benchmark(
    'Easing.ease (original)',
    () => {
      originalEase(testValue);
    },
    { iterations: 100000 }
  );
  console.log(formatResult(originalResult));

  // Fast LUT-based implementation
  const fastResult = benchmark(
    'FastEasing.ease (LUT)',
    () => {
      FastEasing.ease(testValue);
    },
    { iterations: 100000 }
  );
  console.log(formatResult(fastResult));

  console.log('\n' + compareResults(originalResult, fastResult));

  // Custom bezier comparison
  console.log('\n📐 Custom Bezier Comparison\n');

  const customOriginal = Easing.bezier(0.4, 0.0, 0.2, 1);
  const customOriginalResult = benchmark(
    'Easing.bezier (custom, original)',
    () => {
      customOriginal(testValue);
    },
    { iterations: 100000 }
  );
  console.log(formatResult(customOriginalResult));

  const customFast = FastEasing.bezier(0.4, 0.0, 0.2, 1);
  const customFastResult = benchmark(
    'FastEasing.bezier (custom, LUT)',
    () => {
      customFast(testValue);
    },
    { iterations: 100000 }
  );
  console.log(formatResult(customFastResult));

  console.log('\n' + compareResults(customOriginalResult, customFastResult));
}

/**
 * Benchmark object pooling
 */
function benchmarkObjectPooling(): void {
  console.log('\n♻️ Object Pooling Optimization\n');

  interface Message {
    type: string;
    payload: Record<string, unknown>;
    timestamp: number;
  }

  // Without pooling - create new objects
  const withoutPoolResult = benchmark(
    'New object creation',
    () => {
      const msg: Message = {
        type: 'updateView',
        payload: { viewId: 'v1', text: 'Hello' },
        timestamp: Date.now(),
      };
      // Simulate usage
      JSON.stringify(msg);
    },
    { iterations: 50000 }
  );
  console.log(formatResult(withoutPoolResult));

  // With pooling - reuse objects
  const pool: Message[] = [];
  for (let i = 0; i < 10; i++) {
    pool.push({ type: '', payload: {}, timestamp: 0 });
  }

  let poolIndex = 0;
  const withPoolResult = benchmark(
    'Object from pool',
    () => {
      const msg = pool[poolIndex % pool.length];
      msg.type = 'updateView';
      msg.payload = { viewId: 'v1', text: 'Hello' };
      msg.timestamp = Date.now();
      poolIndex++;
      // Simulate usage
      JSON.stringify(msg);
    },
    { iterations: 50000 }
  );
  console.log(formatResult(withPoolResult));

  console.log('\n' + compareResults(withoutPoolResult, withPoolResult));
}

/**
 * Benchmark diff-based updates
 */
function benchmarkDiffUpdates(): void {
  console.log('\n🔍 Diff-Based Updates Optimization\n');

  const oldProps = {
    text: 'Hello',
    style: { flex: 1, backgroundColor: '#fff', padding: 16 },
    accessible: true,
  };

  const newProps = {
    text: 'Hello World', // Changed
    style: { flex: 1, backgroundColor: '#fff', padding: 16 }, // Same
    accessible: true, // Same
  };

  // Full update (no diff)
  const fullUpdateResult = benchmark(
    'Full props update',
    () => {
      const update = { ...newProps };
      JSON.stringify(update);
    },
    { iterations: 50000 }
  );
  console.log(formatResult(fullUpdateResult));

  // Diff-based update
  const diffUpdateResult = benchmark(
    'Diff-based update',
    () => {
      const diff: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(newProps)) {
        const oldValue = oldProps[key as keyof typeof oldProps];
        if (key === 'style') {
          if (JSON.stringify(value) !== JSON.stringify(oldValue)) {
            diff[key] = value;
          }
        } else if (value !== oldValue) {
          diff[key] = value;
        }
      }
      if (Object.keys(diff).length > 0) {
        JSON.stringify(diff);
      }
    },
    { iterations: 50000 }
  );
  console.log(formatResult(diffUpdateResult));

  console.log('\n' + compareResults(fullUpdateResult, diffUpdateResult));
}

/**
 * Run all optimization benchmarks
 */
export async function runOptimizationBenchmarks(): Promise<void> {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              Performance Optimization Benchmarks              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  benchmarkStyleCaching();
  benchmarkMergedStyles();
  benchmarkEasingLUT();
  benchmarkObjectPooling();
  benchmarkDiffUpdates();

  // Summary
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('📊 OPTIMIZATION SUMMARY');
  console.log('═'.repeat(60));
  console.log('\n✅ Implemented Optimizations:');
  console.log('   • Style caching with LRU eviction');
  console.log('   • Pre-computed easing lookup tables');
  console.log('   • Object pooling for bridge messages');
  console.log('   • Diff-based view updates');
  console.log('   • Message queue with batching');
  console.log('   • Priority-based operation scheduling');
}
