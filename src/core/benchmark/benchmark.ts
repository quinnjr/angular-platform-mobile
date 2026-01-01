/**
 * Benchmark utilities for measuring framework performance
 */

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
  samples: number[];
}

export interface BenchmarkOptions {
  iterations?: number;
  warmupIterations?: number;
  samples?: number;
}

/**
 * Run a synchronous benchmark
 */
export function benchmark(
  name: string,
  fn: () => void,
  options: BenchmarkOptions = {}
): BenchmarkResult {
  const { iterations = 1000, warmupIterations = 100, samples = 10 } = options;
  const sampleResults: number[] = [];

  // Warmup
  for (let i = 0; i < warmupIterations; i++) {
    fn();
  }

  // Run samples
  for (let s = 0; s < samples; s++) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const elapsed = performance.now() - start;
    sampleResults.push(elapsed);
  }

  const totalTime = sampleResults.reduce((a, b) => a + b, 0);
  const averageTime = totalTime / samples;
  const minTime = Math.min(...sampleResults);
  const maxTime = Math.max(...sampleResults);
  const opsPerSecond = (iterations * 1000) / averageTime;

  return {
    name,
    iterations,
    totalTime,
    averageTime,
    minTime,
    maxTime,
    opsPerSecond,
    samples: sampleResults,
  };
}

/**
 * Run an asynchronous benchmark
 */
export async function benchmarkAsync(
  name: string,
  fn: () => Promise<void>,
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult> {
  const { iterations = 100, warmupIterations = 10, samples = 5 } = options;
  const sampleResults: number[] = [];

  // Warmup
  for (let i = 0; i < warmupIterations; i++) {
    await fn();
  }

  // Run samples
  for (let s = 0; s < samples; s++) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await fn();
    }
    const elapsed = performance.now() - start;
    sampleResults.push(elapsed);
  }

  const totalTime = sampleResults.reduce((a, b) => a + b, 0);
  const averageTime = totalTime / samples;
  const minTime = Math.min(...sampleResults);
  const maxTime = Math.max(...sampleResults);
  const opsPerSecond = (iterations * 1000) / averageTime;

  return {
    name,
    iterations,
    totalTime,
    averageTime,
    minTime,
    maxTime,
    opsPerSecond,
    samples: sampleResults,
  };
}

/**
 * Measure memory usage (if available)
 */
export function measureMemory(): { heapUsed: number; heapTotal: number } | null {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const mem = process.memoryUsage();
    return {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
    };
  }
  return null;
}

/**
 * Format benchmark result for display
 */
export function formatResult(result: BenchmarkResult): string {
  return [
    `📊 ${result.name}`,
    `   Iterations: ${result.iterations.toLocaleString()}`,
    `   Avg time: ${result.averageTime.toFixed(3)}ms`,
    `   Min/Max: ${result.minTime.toFixed(3)}ms / ${result.maxTime.toFixed(3)}ms`,
    `   Ops/sec: ${Math.round(result.opsPerSecond).toLocaleString()}`,
  ].join('\n');
}

/**
 * Run a benchmark suite
 */
export async function runBenchmarkSuite(
  suiteName: string,
  benchmarks: Array<{
    name: string;
    fn: () => void | Promise<void>;
    options?: BenchmarkOptions;
  }>
): Promise<BenchmarkResult[]> {
  console.log(`\n🏃 Running benchmark suite: ${suiteName}\n`);

  const results: BenchmarkResult[] = [];

  for (const b of benchmarks) {
    const isAsync = b.fn.constructor.name === 'AsyncFunction';
    const result = isAsync
      ? await benchmarkAsync(b.name, b.fn as () => Promise<void>, b.options)
      : benchmark(b.name, b.fn as () => void, b.options);

    results.push(result);
    console.log(formatResult(result));
    console.log();
  }

  return results;
}

/**
 * Compare two benchmark results
 */
export function compareResults(
  baseline: BenchmarkResult,
  comparison: BenchmarkResult
): string {
  const speedup = baseline.averageTime / comparison.averageTime;
  const percentChange = ((speedup - 1) * 100).toFixed(1);
  const emoji = speedup >= 1 ? '✅' : '⚠️';

  return [
    `${emoji} ${baseline.name} vs ${comparison.name}`,
    `   Baseline: ${baseline.averageTime.toFixed(3)}ms`,
    `   Comparison: ${comparison.averageTime.toFixed(3)}ms`,
    `   Speedup: ${speedup.toFixed(2)}x (${speedup >= 1 ? '+' : ''}${percentChange}%)`,
  ].join('\n');
}
