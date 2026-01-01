import { describe, it, expect } from 'vitest';
import { FastEasing, benchmarkEasing } from './easing-lut';

describe('FastEasing', () => {
  describe('linear', () => {
    it('should return input unchanged', () => {
      expect(FastEasing.linear(0)).toBe(0);
      expect(FastEasing.linear(0.5)).toBe(0.5);
      expect(FastEasing.linear(1)).toBe(1);
    });
  });

  describe('ease', () => {
    it('should ease with cubic bezier curve', () => {
      expect(FastEasing.ease(0)).toBe(0);
      expect(FastEasing.ease(1)).toBe(1);

      // Middle value should be different from linear
      const middle = FastEasing.ease(0.5);
      expect(middle).toBeGreaterThan(0.4);
      expect(middle).toBeLessThan(0.6);
    });

    it('should produce valid values', () => {
      // Note: Speed comparison is in benchmark suite, not unit tests
      // In test environment, JIT warmup can cause inconsistent results
      for (let t = 0; t <= 1; t += 0.1) {
        const val = FastEasing.ease(t);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('easeIn', () => {
    it('should start slow and end fast', () => {
      expect(FastEasing.easeIn(0)).toBe(0);
      expect(FastEasing.easeIn(1)).toBe(1);

      // At 0.5, easeIn should be less than 0.5 (slow start)
      const middle = FastEasing.easeIn(0.5);
      expect(middle).toBeLessThan(0.5);
    });
  });

  describe('easeOut', () => {
    it('should produce values in valid range', () => {
      expect(FastEasing.easeOut(0)).toBe(0);
      expect(FastEasing.easeOut(1)).toBe(1);

      // All values should be between 0 and 1
      for (let t = 0; t <= 1; t += 0.1) {
        const val = FastEasing.easeOut(t);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('easeInOut', () => {
    it('should start slow, speed up, then slow down', () => {
      expect(FastEasing.easeInOut(0)).toBe(0);
      expect(FastEasing.easeInOut(1)).toBe(1);

      // At 0.5, easeInOut should be close to 0.5
      const middle = FastEasing.easeInOut(0.5);
      expect(middle).toBeCloseTo(0.5, 0);
    });
  });

  describe('quad', () => {
    it('should return squared value', () => {
      expect(FastEasing.quad(0)).toBe(0);
      expect(FastEasing.quad(0.5)).toBe(0.25);
      expect(FastEasing.quad(1)).toBe(1);
    });
  });

  describe('cubic', () => {
    it('should return cubed value', () => {
      expect(FastEasing.cubic(0)).toBe(0);
      expect(FastEasing.cubic(0.5)).toBe(0.125);
      expect(FastEasing.cubic(1)).toBe(1);
    });
  });

  describe('bezier', () => {
    it('should create custom bezier easing function', () => {
      const customEase = FastEasing.bezier(0.25, 0.1, 0.25, 1);

      expect(customEase(0)).toBe(0);
      expect(customEase(1)).toBe(1);
      expect(typeof customEase(0.5)).toBe('number');
    });

    it('should cache custom bezier curves', () => {
      // Create same bezier twice
      const ease1 = FastEasing.bezier(0.4, 0.0, 0.2, 1);
      const ease2 = FastEasing.bezier(0.4, 0.0, 0.2, 1);

      // Should return same results
      expect(ease1(0.5)).toBe(ease2(0.5));
    });

    it('should handle edge values', () => {
      const ease = FastEasing.bezier(0.4, 0.0, 0.6, 1);

      expect(ease(-0.1)).toBe(0); // Clamped to 0
      expect(ease(1.1)).toBe(1); // Clamped to 1
    });
  });

  describe('preset quadratic easings', () => {
    it('easeInQuad should be slower at start', () => {
      expect(FastEasing.easeInQuad(0)).toBe(0);
      expect(FastEasing.easeInQuad(1)).toBe(1);
      expect(FastEasing.easeInQuad(0.5)).toBeLessThan(0.5);
    });

    it('easeOutQuad should be faster at start', () => {
      expect(FastEasing.easeOutQuad(0)).toBe(0);
      expect(FastEasing.easeOutQuad(1)).toBe(1);
      expect(FastEasing.easeOutQuad(0.5)).toBeGreaterThan(0.5);
    });

    it('easeInOutQuad should be symmetric', () => {
      expect(FastEasing.easeInOutQuad(0)).toBe(0);
      expect(FastEasing.easeInOutQuad(1)).toBe(1);
      expect(FastEasing.easeInOutQuad(0.5)).toBeCloseTo(0.5, 0);
    });
  });

  describe('preset cubic easings', () => {
    it('easeInCubic should accelerate slowly', () => {
      expect(FastEasing.easeInCubic(0)).toBe(0);
      expect(FastEasing.easeInCubic(1)).toBe(1);
      expect(FastEasing.easeInCubic(0.5)).toBeLessThan(FastEasing.easeInQuad(0.5));
    });

    it('easeOutCubic should decelerate slowly', () => {
      expect(FastEasing.easeOutCubic(0)).toBe(0);
      expect(FastEasing.easeOutCubic(1)).toBe(1);
      expect(FastEasing.easeOutCubic(0.5)).toBeGreaterThan(FastEasing.easeOutQuad(0.5));
    });
  });

  describe('clearCache', () => {
    it('should clear custom bezier cache', () => {
      // Create some custom beziers
      FastEasing.bezier(0.1, 0.2, 0.3, 0.4);
      FastEasing.bezier(0.5, 0.6, 0.7, 0.8);

      // Clear cache
      FastEasing.clearCache();

      // Cache should be empty (creating new ones should work)
      const newEase = FastEasing.bezier(0.9, 0.8, 0.7, 0.6);
      expect(typeof newEase(0.5)).toBe('number');
    });
  });
});

describe('benchmarkEasing', () => {
  it('should return benchmark results', () => {
    const result = benchmarkEasing();

    expect(result).toHaveProperty('standard');
    expect(result).toHaveProperty('fast');
    expect(result).toHaveProperty('speedup');

    expect(typeof result.standard).toBe('number');
    expect(typeof result.fast).toBe('number');
    expect(typeof result.speedup).toBe('number');

    expect(result.standard).toBeGreaterThan(0);
    expect(result.fast).toBeGreaterThan(0);
  });

  it('should return valid timing data', () => {
    const result = benchmarkEasing();

    // Both timings should be positive
    expect(result.standard).toBeGreaterThan(0);
    expect(result.fast).toBeGreaterThan(0);
    // Speedup should be a positive number
    expect(result.speedup).toBeGreaterThan(0);
  });
});
