import { benchmark, formatResult, BenchmarkResult } from './benchmark';
import { AnimatedValue, AnimatedInterpolation, Easing } from '../animation/animated';

/**
 * Animation performance benchmarks
 */

/**
 * Benchmark AnimatedValue operations
 */
function benchmarkAnimatedValue(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  // Value creation
  results.push(
    benchmark(
      'AnimatedValue Creation',
      () => {
        new AnimatedValue(0);
      },
      { iterations: 100000 }
    )
  );

  // Value get
  const value = new AnimatedValue(100);
  results.push(
    benchmark(
      'AnimatedValue Get',
      () => {
        value.value;
      },
      { iterations: 100000 }
    )
  );

  // Value set
  let counter = 0;
  results.push(
    benchmark(
      'AnimatedValue Set',
      () => {
        value.setValue(counter++);
      },
      { iterations: 100000 }
    )
  );

  // Value with listeners
  const valueWithListeners = new AnimatedValue(0);
  for (let i = 0; i < 10; i++) {
    valueWithListeners.addListener(() => {});
  }

  results.push(
    benchmark(
      'AnimatedValue Set (10 listeners)',
      () => {
        valueWithListeners.setValue(counter++);
      },
      { iterations: 50000 }
    )
  );

  return results;
}

/**
 * Benchmark interpolation
 */
function benchmarkInterpolation(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  // Simple interpolation
  const value = new AnimatedValue(0.5);
  const simpleInterp = new AnimatedInterpolation(value, {
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  results.push(
    benchmark(
      'Interpolation (simple)',
      () => {
        simpleInterp.value;
      },
      { iterations: 100000 }
    )
  );

  // Multi-segment interpolation
  const multiInterp = new AnimatedInterpolation(value, {
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 25, 50, 75, 100],
  });

  results.push(
    benchmark(
      'Interpolation (5 segments)',
      () => {
        multiInterp.value;
      },
      { iterations: 100000 }
    )
  );

  // Color interpolation
  const colorInterp = new AnimatedInterpolation(value, {
    inputRange: [0, 1],
    outputRange: ['#ff0000', '#0000ff'],
  });

  results.push(
    benchmark(
      'Interpolation (color)',
      () => {
        colorInterp.value;
      },
      { iterations: 50000 }
    )
  );

  // Degree interpolation
  const degreeInterp = new AnimatedInterpolation(value, {
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  results.push(
    benchmark(
      'Interpolation (degrees)',
      () => {
        degreeInterp.value;
      },
      { iterations: 100000 }
    )
  );

  return results;
}

/**
 * Benchmark easing functions
 */
function benchmarkEasing(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  const testValue = 0.5;

  // Linear
  results.push(
    benchmark(
      'Easing.linear',
      () => {
        Easing.linear(testValue);
      },
      { iterations: 100000 }
    )
  );

  // Ease
  results.push(
    benchmark(
      'Easing.ease',
      () => {
        Easing.ease(testValue);
      },
      { iterations: 100000 }
    )
  );

  // Bezier
  const customBezier = Easing.bezier(0.25, 0.1, 0.25, 1);
  results.push(
    benchmark(
      'Easing.bezier',
      () => {
        customBezier(testValue);
      },
      { iterations: 100000 }
    )
  );

  // Spring
  const elasticEasing = Easing.elastic(1);
  results.push(
    benchmark(
      'Easing.elastic',
      () => {
        elasticEasing(testValue);
      },
      { iterations: 100000 }
    )
  );

  // Bounce
  results.push(
    benchmark(
      'Easing.bounce',
      () => {
        Easing.bounce(testValue);
      },
      { iterations: 100000 }
    )
  );

  return results;
}

/**
 * Benchmark animation frame calculation
 */
function benchmarkAnimationFrame(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  // Timing animation calculation
  const fromValue = 0;
  const toValue = 100;
  const easing = Easing.easeInOut;

  results.push(
    benchmark(
      'Timing Frame Calculation',
      () => {
        const progress = 0.5;
        const eased = easing(progress);
        fromValue + (toValue - fromValue) * eased;
      },
      { iterations: 100000 }
    )
  );

  // Spring animation calculation
  let position = 0;
  let velocity = 0;
  const targetValue = 100;
  const stiffness = 100;
  const damping = 10;
  const mass = 1;

  results.push(
    benchmark(
      'Spring Frame Calculation',
      () => {
        const displacement = position - targetValue;
        const springForce = -stiffness * displacement;
        const dampingForce = -damping * velocity;
        const acceleration = (springForce + dampingForce) / mass;

        velocity += acceleration * (1 / 60);
        position += velocity * (1 / 60);
      },
      { iterations: 100000 }
    )
  );

  return results;
}

/**
 * Run all animation benchmarks
 */
export async function runAnimationBenchmarks(): Promise<BenchmarkResult[]> {
  console.log('\n✨ Animation Performance Benchmarks\n');
  console.log('='.repeat(50));

  const allResults: BenchmarkResult[] = [];

  console.log('\n📊 AnimatedValue:\n');
  const valueResults = benchmarkAnimatedValue();
  valueResults.forEach((r) => {
    console.log(formatResult(r));
    console.log();
  });
  allResults.push(...valueResults);

  console.log('\n🔀 Interpolation:\n');
  const interpResults = benchmarkInterpolation();
  interpResults.forEach((r) => {
    console.log(formatResult(r));
    console.log();
  });
  allResults.push(...interpResults);

  console.log('\n📈 Easing Functions:\n');
  const easingResults = benchmarkEasing();
  easingResults.forEach((r) => {
    console.log(formatResult(r));
    console.log();
  });
  allResults.push(...easingResults);

  console.log('\n🎬 Frame Calculation:\n');
  const frameResults = benchmarkAnimationFrame();
  frameResults.forEach((r) => {
    console.log(formatResult(r));
    console.log();
  });
  allResults.push(...frameResults);

  return allResults;
}
