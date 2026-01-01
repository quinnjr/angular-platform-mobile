/**
 * Pre-computed easing lookup tables for improved performance
 *
 * Bezier easing functions are computationally expensive. This module
 * provides pre-computed lookup tables for common easing functions.
 */

/**
 * Lookup table resolution (number of samples)
 */
const LUT_SIZE = 256;

/**
 * Pre-computed bezier curve lookup table
 */
class BezierLUT {
  private readonly samples: Float32Array;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.samples = new Float32Array(LUT_SIZE);
    this.computeSamples(x1, y1, x2, y2);
  }

  private computeSamples(x1: number, y1: number, x2: number, y2: number): void {
    for (let i = 0; i < LUT_SIZE; i++) {
      const t = i / (LUT_SIZE - 1);
      this.samples[i] = this.solveBezier(t, x1, y1, x2, y2);
    }
  }

  private solveBezier(t: number, _x1: number, y1: number, _x2: number, y2: number): number {
    void _x1;
    void _x2;
    // Compute bezier y value for a given t
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    return ((ay * t + by) * t + cy) * t;
  }

  getValue(t: number): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    const index = t * (LUT_SIZE - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const fraction = index - lower;

    // Linear interpolation between samples
    return this.samples[lower] * (1 - fraction) + this.samples[upper] * fraction;
  }
}

/**
 * Pre-computed LUTs for common easing functions
 */
const easingLUTs = {
  ease: new BezierLUT(0.25, 0.1, 0.25, 1),
  easeIn: new BezierLUT(0.42, 0, 1, 1),
  easeOut: new BezierLUT(0, 0, 0.58, 1),
  easeInOut: new BezierLUT(0.42, 0, 0.58, 1),
  easeInQuad: new BezierLUT(0.55, 0.085, 0.68, 0.53),
  easeOutQuad: new BezierLUT(0.25, 0.46, 0.45, 0.94),
  easeInOutQuad: new BezierLUT(0.455, 0.03, 0.515, 0.955),
  easeInCubic: new BezierLUT(0.55, 0.055, 0.675, 0.19),
  easeOutCubic: new BezierLUT(0.215, 0.61, 0.355, 1),
  easeInOutCubic: new BezierLUT(0.645, 0.045, 0.355, 1),
};

/**
 * Custom bezier LUT cache
 */
const customLUTCache = new Map<string, BezierLUT>();
const MAX_CUSTOM_LUTS = 20;

/**
 * Get a bezier LUT key
 */
function getBezierKey(x1: number, y1: number, x2: number, y2: number): string {
  return `${x1.toFixed(3)},${y1.toFixed(3)},${x2.toFixed(3)},${y2.toFixed(3)}`;
}

/**
 * Fast easing functions using pre-computed LUTs
 */
export const FastEasing = {
  /**
   * Linear (no LUT needed)
   */
  linear: (t: number) => t,

  /**
   * Ease (cubic-bezier(0.25, 0.1, 0.25, 1))
   */
  ease: (t: number) => easingLUTs.ease.getValue(t),

  /**
   * Ease In (cubic-bezier(0.42, 0, 1, 1))
   */
  easeIn: (t: number) => easingLUTs.easeIn.getValue(t),

  /**
   * Ease Out (cubic-bezier(0, 0, 0.58, 1))
   */
  easeOut: (t: number) => easingLUTs.easeOut.getValue(t),

  /**
   * Ease In Out (cubic-bezier(0.42, 0, 0.58, 1))
   */
  easeInOut: (t: number) => easingLUTs.easeInOut.getValue(t),

  /**
   * Ease In Quad
   */
  easeInQuad: (t: number) => easingLUTs.easeInQuad.getValue(t),

  /**
   * Ease Out Quad
   */
  easeOutQuad: (t: number) => easingLUTs.easeOutQuad.getValue(t),

  /**
   * Ease In Out Quad
   */
  easeInOutQuad: (t: number) => easingLUTs.easeInOutQuad.getValue(t),

  /**
   * Ease In Cubic
   */
  easeInCubic: (t: number) => easingLUTs.easeInCubic.getValue(t),

  /**
   * Ease Out Cubic
   */
  easeOutCubic: (t: number) => easingLUTs.easeOutCubic.getValue(t),

  /**
   * Ease In Out Cubic
   */
  easeInOutCubic: (t: number) => easingLUTs.easeInOutCubic.getValue(t),

  /**
   * Get or create a custom bezier LUT
   */
  bezier: (x1: number, y1: number, x2: number, y2: number) => {
    const key = getBezierKey(x1, y1, x2, y2);

    let lut = customLUTCache.get(key);
    if (!lut) {
      // Evict oldest if at capacity
      if (customLUTCache.size >= MAX_CUSTOM_LUTS) {
        const firstKey = customLUTCache.keys().next().value;
        if (firstKey !== undefined) {
          customLUTCache.delete(firstKey);
        }
      }

      lut = new BezierLUT(x1, y1, x2, y2);
      customLUTCache.set(key, lut);
    }

    return (t: number) => lut!.getValue(t);
  },

  /**
   * Quadratic easing (still fast without LUT)
   */
  quad: (t: number) => t * t,

  /**
   * Cubic easing (still fast without LUT)
   */
  cubic: (t: number) => t * t * t,

  /**
   * Clear custom LUT cache
   */
  clearCache: () => {
    customLUTCache.clear();
  },
};

/**
 * Performance comparison helper
 */
export function benchmarkEasing(): { standard: number; fast: number; speedup: number } {
  const iterations = 100000;
  const testValue = 0.5;

  // Standard bezier (x1/x2 are for the x-curve, we only sample y here)
  const bezier = (_x1: number, y1: number, _x2: number, y2: number) => {
    void _x1;
    void _x2;
    return (t: number) => {
      const cy = 3 * y1;
      const by = 3 * (y2 - y1) - cy;
      const ay = 1 - cy - by;
      return ((ay * t + by) * t + cy) * t;
    };
  };

  const standardEase = bezier(0.25, 0.1, 0.25, 1);

  // Benchmark standard
  const standardStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    standardEase(testValue);
  }
  const standardTime = performance.now() - standardStart;

  // Benchmark fast
  const fastStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    FastEasing.ease(testValue);
  }
  const fastTime = performance.now() - fastStart;

  return {
    standard: standardTime,
    fast: fastTime,
    speedup: standardTime / fastTime,
  };
}
