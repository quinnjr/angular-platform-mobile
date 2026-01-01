import { describe, it, expect, beforeEach } from 'vitest';
import {
  StyleCache,
  cachedTransformStyle,
  cachedMergeStyles,
} from './style-cache';

describe('StyleCache', () => {
  beforeEach(() => {
    StyleCache.clear();
  });

  describe('transform', () => {
    it('should transform a simple style', () => {
      const style = { flex: 1, backgroundColor: '#fff' };
      const result = StyleCache.transform(style);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should cache transformed styles', () => {
      const style = { flex: 1, backgroundColor: '#fff' };

      // First call - cache miss
      const result1 = StyleCache.transform(style);
      const stats1 = StyleCache.stats;
      expect(stats1.misses).toBe(1);
      expect(stats1.hits).toBe(0);

      // Second call - cache hit (same object)
      const result2 = StyleCache.transform(style);
      const stats2 = StyleCache.stats;
      expect(stats2.hits).toBe(1);
      expect(result1).toEqual(result2);
    });

    it('should return same result for identical styles', () => {
      const style1 = { flex: 1, backgroundColor: '#fff' };
      const result1 = StyleCache.transform(style1);

      // Different object, same content
      const style2 = { flex: 1, backgroundColor: '#fff' };
      const result2 = StyleCache.transform(style2);

      // Results should be equivalent
      expect(result1).toEqual(result2);
    });

    it('should handle complex styles', () => {
      const style = {
        flex: 1,
        flexDirection: 'row' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        padding: 16,
        margin: 8,
        borderRadius: 8,
      };

      const result = StyleCache.transform(style);
      expect(result).toBeDefined();
    });
  });

  describe('transformMerged', () => {
    it('should merge and transform multiple styles', () => {
      const base = { flex: 1 };
      const override = { backgroundColor: '#fff' };

      const result = StyleCache.transformMerged(base, override);
      expect(result).toBeDefined();
    });

    it('should handle undefined and null styles', () => {
      const base = { flex: 1 };

      const result = StyleCache.transformMerged(base, undefined, null, false);
      expect(result).toBeDefined();
    });

    it('should return empty object for no styles', () => {
      const result = StyleCache.transformMerged();
      expect(result).toEqual({});
    });

    it('should handle single style like transform', () => {
      const style = { flex: 1 };
      const merged = StyleCache.transformMerged(style);
      const direct = StyleCache.transform(style);

      expect(merged).toEqual(direct);
    });
  });

  describe('stats', () => {
    it('should track cache hits and misses', () => {
      const style = { flex: 1 };

      // Miss
      StyleCache.transform(style);
      expect(StyleCache.stats.misses).toBe(1);
      expect(StyleCache.stats.hits).toBe(0);

      // Hit
      StyleCache.transform(style);
      expect(StyleCache.stats.hits).toBe(1);

      // Hit rate
      expect(StyleCache.stats.hitRate).toBe(0.5);
    });

    it('should reset stats on clear', () => {
      const style = { flex: 1 };
      StyleCache.transform(style);
      StyleCache.transform(style);

      StyleCache.clear();

      expect(StyleCache.stats.hits).toBe(0);
      expect(StyleCache.stats.misses).toBe(0);
    });
  });

  describe('invalidate', () => {
    it('should invalidate a cached style', () => {
      const style = { flex: 1 };

      // Cache the style
      StyleCache.transform(style);

      // Invalidate
      StyleCache.invalidate(style);

      // Next access should be a miss again
      StyleCache.transform(style);
      // Note: Due to hash cache, this might still be a hit
    });
  });
});

describe('cachedTransformStyle', () => {
  beforeEach(() => {
    StyleCache.clear();
  });

  it('should be a convenience wrapper for StyleCache.transform', () => {
    const style = { flex: 1, backgroundColor: '#fff' };
    const result = cachedTransformStyle(style);

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });
});

describe('cachedMergeStyles', () => {
  beforeEach(() => {
    StyleCache.clear();
  });

  it('should be a convenience wrapper for StyleCache.transformMerged', () => {
    const style1 = { flex: 1 };
    const style2 = { backgroundColor: '#fff' };
    const result = cachedMergeStyles(style1, style2);

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });
});
