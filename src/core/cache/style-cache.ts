/**
 * Style caching for improved performance
 *
 * Caches transformed styles to avoid redundant transformation operations.
 * Uses WeakMap for automatic garbage collection of unused styles.
 */

import { NativeStyle, transformStyle } from '../../types/style.types';

/**
 * Type for transformed style output
 */
export type TransformedStyle = Record<string, unknown>;

/**
 * LRU cache for style transforms
 */
class LRUCache<K, V> {
  private readonly cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // Remove if exists (will be re-added at end)
    this.cache.delete(key);

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Cache entry with transformed style
 */
interface CacheEntry {
  transformed: TransformedStyle;
  hash: string;
}

/**
 * Generate a hash for a style object
 */
function hashStyle(style: NativeStyle): string {
  // Fast hash using JSON.stringify
  // For production, consider a faster hash algorithm
  try {
    return JSON.stringify(style);
  } catch {
    return String(Date.now());
  }
}

/**
 * Style cache singleton
 */
class StyleCacheImpl {
  // WeakMap for object-based style caching
  private readonly objectCache = new WeakMap<NativeStyle, CacheEntry>();

  // LRU cache for string-based hashes (for merged/computed styles)
  private readonly hashCache = new LRUCache<string, TransformedStyle>(500);

  // Cache statistics
  private hits = 0;
  private misses = 0;

  /**
   * Get cached transformed style or compute and cache it
   */
  transform(style: NativeStyle): TransformedStyle {
    // Try object cache first (fastest)
    const cached = this.objectCache.get(style);
    if (cached) {
      this.hits++;
      return cached.transformed;
    }

    // Generate hash and try hash cache
    const hash = hashStyle(style);
    const hashCached = this.hashCache.get(hash);
    if (hashCached) {
      this.hits++;
      // Also store in object cache for future lookups
      this.objectCache.set(style, { transformed: hashCached, hash });
      return hashCached;
    }

    // Cache miss - transform and cache
    this.misses++;
    const transformed = transformStyle(style);

    // Store in both caches
    this.objectCache.set(style, { transformed, hash });
    this.hashCache.set(hash, transformed);

    return transformed;
  }

  /**
   * Transform multiple styles and merge them
   */
  transformMerged(...styles: (NativeStyle | undefined | null | false)[]): TransformedStyle {
    const validStyles = styles.filter(
      (s): s is NativeStyle => s !== undefined && s !== null && s !== false
    );

    if (validStyles.length === 0) {
      return {};
    }

    if (validStyles.length === 1) {
      return this.transform(validStyles[0]);
    }

    // Merge styles
    const merged: NativeStyle = {};
    for (const style of validStyles) {
      Object.assign(merged, style);
    }

    // Try to find in hash cache
    const hash = hashStyle(merged);
    const cached = this.hashCache.get(hash);
    if (cached) {
      this.hits++;
      return cached;
    }

    // Transform and cache
    this.misses++;
    const transformed = transformStyle(merged);
    this.hashCache.set(hash, transformed);

    return transformed;
  }

  /**
   * Invalidate cache entry for a specific style
   */
  invalidate(style: NativeStyle): void {
    const cached = this.objectCache.get(style);
    if (cached) {
      this.objectCache.delete(style);
      // Note: We can't efficiently remove from hash cache without iteration
    }
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.hashCache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  get stats(): { hits: number; misses: number; hitRate: number; hashCacheSize: number } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      hashCacheSize: this.hashCache.size,
    };
  }
}

/**
 * Singleton instance
 */
export const StyleCache = new StyleCacheImpl();

/**
 * Cached transform function (convenience export)
 */
export function cachedTransformStyle(style: NativeStyle): TransformedStyle {
  return StyleCache.transform(style);
}

/**
 * Cached merge and transform function
 */
export function cachedMergeStyles(
  ...styles: (NativeStyle | undefined | null | false)[]
): TransformedStyle {
  return StyleCache.transformMerged(...styles);
}
