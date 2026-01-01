/**
 * Vitest Setup File
 *
 * Global setup for all tests
 */

// Polyfill requestAnimationFrame and cancelAnimationFrame for Node.js environment
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    return setTimeout(() => callback(Date.now()), 16) as unknown as number;
  };
}

if (typeof globalThis.cancelAnimationFrame === 'undefined') {
  globalThis.cancelAnimationFrame = (id: number): void => {
    clearTimeout(id);
  };
}

// Polyfill performance.now if not available
if (typeof globalThis.performance === 'undefined') {
  (globalThis as any).performance = {
    now: () => Date.now(),
  };
}
