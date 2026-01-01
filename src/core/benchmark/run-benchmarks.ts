#!/usr/bin/env node

import { runBridgeBenchmarks } from './bridge.benchmark';
import { runRendererBenchmarks } from './renderer.benchmark';
import { runAnimationBenchmarks } from './animation.benchmark';
import { runOptimizationBenchmarks } from './optimization.benchmark';
import { measureMemory, BenchmarkResult } from './benchmark';

/**
 * Run all framework benchmarks
 */
async function runAllBenchmarks(): Promise<void> {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         Angular Platform Mobile - Performance Benchmarks       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  const startMemory = measureMemory();
  const startTime = performance.now();

  const allResults: BenchmarkResult[] = [];

  // Run bridge benchmarks
  const bridgeResults = await runBridgeBenchmarks();
  allResults.push(...bridgeResults);

  // Run renderer benchmarks
  const rendererResults = await runRendererBenchmarks();
  allResults.push(...rendererResults);

  // Run animation benchmarks
  const animationResults = await runAnimationBenchmarks();
  allResults.push(...animationResults);

  // Run optimization comparison benchmarks
  await runOptimizationBenchmarks();

  const endTime = performance.now();
  const endMemory = measureMemory();

  // Summary
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('📊 BENCHMARK SUMMARY');
  console.log('═'.repeat(60));

  console.log(`\nTotal benchmarks: ${allResults.length}`);
  console.log(`Total time: ${((endTime - startTime) / 1000).toFixed(2)}s`);

  if (startMemory && endMemory) {
    const memoryDelta = (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024;
    console.log(`Memory delta: ${memoryDelta.toFixed(2)} MB`);
  }

  // Find fastest and slowest
  const sortedBySpeed = [...allResults].sort((a, b) => b.opsPerSecond - a.opsPerSecond);

  console.log('\n🏆 Top 5 Fastest Operations:');
  sortedBySpeed.slice(0, 5).forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.name}: ${Math.round(r.opsPerSecond).toLocaleString()} ops/sec`);
  });

  console.log('\n🐢 Top 5 Slowest Operations:');
  sortedBySpeed.slice(-5).reverse().forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.name}: ${Math.round(r.opsPerSecond).toLocaleString()} ops/sec`);
  });

  // Identify potential bottlenecks
  console.log('\n⚠️  Potential Optimization Targets:');
  const slowOps = allResults.filter((r) => r.opsPerSecond < 100000);
  if (slowOps.length > 0) {
    slowOps.forEach((r) => {
      console.log(`   - ${r.name}: ${Math.round(r.opsPerSecond).toLocaleString()} ops/sec (${r.averageTime.toFixed(3)}ms avg)`);
    });
  } else {
    console.log('   No significant bottlenecks detected!');
  }

  console.log('\n');
}

// Run if executed directly
runAllBenchmarks().catch(console.error);

export { runAllBenchmarks };
