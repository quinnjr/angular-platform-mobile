import { Subject, Observable } from 'rxjs';

// Type declaration for requestAnimationFrame in Node.js environment
declare const requestAnimationFrame: (callback: (time: number) => void) => number;
declare const cancelAnimationFrame: (id: number) => void;

/**
 * Animation timing configuration
 */
export interface TimingAnimationConfig {
  toValue: number;
  duration?: number;
  delay?: number;
  easing?: EasingFunction;
  useNativeDriver?: boolean;
}

/**
 * Spring animation configuration
 */
export interface SpringAnimationConfig {
  toValue: number;
  damping?: number;
  mass?: number;
  stiffness?: number;
  overshootClamping?: boolean;
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
  velocity?: number;
  delay?: number;
  useNativeDriver?: boolean;
}

/**
 * Decay animation configuration
 */
export interface DecayAnimationConfig {
  velocity: number;
  deceleration?: number;
  useNativeDriver?: boolean;
}

/**
 * Animation callback
 */
export interface AnimationCallback {
  (result: { finished: boolean }): void;
}

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Built-in easing functions
 */
export const Easing = {
  /**
   * Linear - no acceleration
   */
  linear: (t: number) => t,

  /**
   * Quadratic easing functions
   */
  quad: (t: number) => t * t,
  cubic: (t: number) => t * t * t,

  /**
   * Polynomial easing
   */
  poly: (n: number) => (t: number) => Math.pow(t, n),

  /**
   * Sinusoidal easing
   */
  sin: (t: number) => 1 - Math.cos((t * Math.PI) / 2),

  /**
   * Circular easing
   */
  circle: (t: number) => 1 - Math.sqrt(1 - t * t),

  /**
   * Exponential easing
   */
  exp: (t: number) => Math.pow(2, 10 * (t - 1)),

  /**
   * Elastic easing
   */
  elastic: (bounciness = 1) => {
    const p = bounciness * Math.PI;
    return (t: number) =>
      1 - Math.pow(Math.cos((t * Math.PI) / 2), 3) * Math.cos(t * p);
  },

  /**
   * Back easing (overshoots then returns)
   */
  back: (s = 1.70158) => (t: number) => t * t * ((s + 1) * t - s),

  /**
   * Bounce easing
   */
  bounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    }
    if (t < 2 / 2.75) {
      const t2 = t - 1.5 / 2.75;
      return 7.5625 * t2 * t2 + 0.75;
    }
    if (t < 2.5 / 2.75) {
      const t2 = t - 2.25 / 2.75;
      return 7.5625 * t2 * t2 + 0.9375;
    }
    const t2 = t - 2.625 / 2.75;
    return 7.5625 * t2 * t2 + 0.984375;
  },

  /**
   * Bezier curve easing
   */
  bezier: (_x1: number, y1: number, _x2: number, y2: number) => {
    // Simplified bezier implementation
    return (t: number) => {
      const cy = 3 * y1;
      const by = 3 * (y2 - y1) - cy;
      const ay = 1 - cy - by;

      const sampleCurveY = (time: number): number =>
        ((ay * time + by) * time + cy) * time;

      return sampleCurveY(t);
    };
  },

  /**
   * Ease-in modifier
   */
  in: (easing: EasingFunction): EasingFunction => easing,

  /**
   * Ease-out modifier
   */
  out: (easing: EasingFunction): EasingFunction => (t) => 1 - easing(1 - t),

  /**
   * Ease-in-out modifier
   */
  inOut: (easing: EasingFunction): EasingFunction => (t) =>
    t < 0.5 ? easing(t * 2) / 2 : 1 - easing((1 - t) * 2) / 2,

  /**
   * Common presets
   */
  ease: (t: number) => Easing.bezier(0.25, 0.1, 0.25, 1)(t),
  easeIn: (t: number) => Easing.bezier(0.42, 0, 1, 1)(t),
  easeOut: (t: number) => Easing.bezier(0, 0, 0.58, 1)(t),
  easeInOut: (t: number) => Easing.bezier(0.42, 0, 0.58, 1)(t),
};

/**
 * Animated Value
 *
 * Represents an animated value that can be used for animations.
 * Similar to React Native's Animated.Value.
 */
export class AnimatedValue {
  private _value: number;
  private _offset: number = 0;
  private readonly _listeners = new Map<string, (value: number) => void>();
  private _animation: Animation | null = null;
  private _listenerId = 0;
  private readonly _valueChange$ = new Subject<number>();

  constructor(value: number = 0) {
    this._value = value;
  }

  /**
   * Get current value
   */
  get value(): number {
    return this._value + this._offset;
  }

  /**
   * Observable for value changes
   */
  get valueChanges(): Observable<number> {
    return this._valueChange$.asObservable();
  }

  /**
   * Set the value directly
   */
  setValue(value: number): void {
    this._value = value;
    this.notifyListeners();
  }

  /**
   * Set an offset
   */
  setOffset(offset: number): void {
    this._offset = offset;
  }

  /**
   * Flatten offset into value
   */
  flattenOffset(): void {
    this._value += this._offset;
    this._offset = 0;
  }

  /**
   * Extract offset from value
   */
  extractOffset(): void {
    this._offset = this._value;
    this._value = 0;
  }

  /**
   * Add a value listener
   */
  addListener(callback: (state: { value: number }) => void): string {
    const id = String(++this._listenerId);
    this._listeners.set(id, (v) => callback({ value: v }));
    return id;
  }

  /**
   * Remove a specific listener
   */
  removeListener(id: string): void {
    this._listeners.delete(id);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this._listeners.clear();
  }

  /**
   * Stop any running animation
   */
  stopAnimation(callback?: (value: number) => void): void {
    if (this._animation) {
      this._animation.stop();
      this._animation = null;
    }
    callback?.(this.value);
  }

  /**
   * Reset animation to initial value
   */
  resetAnimation(callback?: (value: number) => void): void {
    this.stopAnimation(callback);
  }

  /**
   * Internal: set animation reference
   */
  _setAnimation(animation: Animation): void {
    this._animation = animation;
  }

  /**
   * Internal: update value during animation
   */
  _updateValue(value: number): void {
    this._value = value;
    this.notifyListeners();
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const value = this.value;
    this._valueChange$.next(value);
    this._listeners.forEach((listener) => listener(value));
  }

  /**
   * Interpolate value to a new range
   */
  interpolate(config: InterpolationConfig): AnimatedInterpolation {
    return new AnimatedInterpolation(this, config);
  }
}

/**
 * Interpolation configuration
 */
export interface InterpolationConfig {
  inputRange: number[];
  outputRange: (number | string)[];
  extrapolate?: 'extend' | 'clamp' | 'identity';
  extrapolateLeft?: 'extend' | 'clamp' | 'identity';
  extrapolateRight?: 'extend' | 'clamp' | 'identity';
}

/**
 * Animated Interpolation
 *
 * Maps input ranges to output ranges.
 */
export class AnimatedInterpolation {
  constructor(
    private readonly parent: AnimatedValue,
    private readonly config: InterpolationConfig
  ) {}

  /**
   * Get interpolated value
   */
  get value(): number | string {
    return this.interpolate(this.parent.value);
  }

  /**
   * Observable for value changes
   */
  get valueChanges(): Observable<number | string> {
    return new Observable((observer) => {
      const subscription = this.parent.valueChanges.subscribe(() => {
        observer.next(this.value);
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Interpolate value
   */
  private interpolate(input: number): number | string {
    const { inputRange, outputRange, extrapolate = 'extend' } = this.config;
    const extrapolateLeft = this.config.extrapolateLeft || extrapolate;
    const extrapolateRight = this.config.extrapolateRight || extrapolate;

    // Find the segment
    let i = 0;
    for (; i < inputRange.length - 1; i++) {
      if (input < inputRange[i + 1]) break;
    }

    // Handle extrapolation
    if (input < inputRange[0]) {
      if (extrapolateLeft === 'clamp') {
        return outputRange[0];
      } else if (extrapolateLeft === 'identity') {
        return input;
      }
      i = 0;
    } else if (input > inputRange[inputRange.length - 1]) {
      if (extrapolateRight === 'clamp') {
        return outputRange[outputRange.length - 1];
      } else if (extrapolateRight === 'identity') {
        return input;
      }
      i = inputRange.length - 2;
    }

    // Interpolate between values
    const inputMin = inputRange[i];
    const inputMax = inputRange[i + 1];
    const outputMin = outputRange[i];
    const outputMax = outputRange[i + 1];

    const t = (input - inputMin) / (inputMax - inputMin);

    if (typeof outputMin === 'number' && typeof outputMax === 'number') {
      return outputMin + t * (outputMax - outputMin);
    }

    // Handle color interpolation
    if (typeof outputMin === 'string' && typeof outputMax === 'string') {
      return this.interpolateColor(outputMin, outputMax, t);
    }

    return outputMin;
  }

  /**
   * Interpolate between colors
   */
  private interpolateColor(color1: string, color2: string, t: number): string {
    const c1 = this.parseColor(color1);
    const c2 = this.parseColor(color2);

    const r = Math.round(c1.r + t * (c2.r - c1.r));
    const g = Math.round(c1.g + t * (c2.g - c1.g));
    const b = Math.round(c1.b + t * (c2.b - c1.b));
    const a = c1.a + t * (c2.a - c1.a);

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  /**
   * Parse color string
   */
  private parseColor(color: string): { r: number; g: number; b: number; a: number } {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      return { r, g, b, a };
    }
    return { r: 0, g: 0, b: 0, a: 1 };
  }
}

/**
 * Base Animation class
 */
export abstract class Animation {
  protected isRunning = false;
  protected startTime = 0;
  protected animationFrame: number | null = null;

  abstract start(callback?: AnimationCallback): void;
  abstract stop(): void;
}

/**
 * Timing Animation
 */
export class TimingAnimation extends Animation {
  private readonly value: AnimatedValue;
  private readonly config: TimingAnimationConfig;
  private readonly fromValue: number;

  constructor(value: AnimatedValue, config: TimingAnimationConfig) {
    super();
    this.value = value;
    this.config = {
      duration: 300,
      delay: 0,
      easing: Easing.easeInOut,
      useNativeDriver: false,
      ...config,
    };
    this.fromValue = value.value;
  }

  start(callback?: AnimationCallback): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.value._setAnimation(this);

    const startAnimation = (): void => {
      this.startTime = performance.now();
      this.animate(callback);
    };

    if (this.config.delay && this.config.delay > 0) {
      setTimeout(startAnimation, this.config.delay);
    } else {
      startAnimation();
    }
  }

  private animate(callback?: AnimationCallback): void {
    if (!this.isRunning) return;

    const now = performance.now();
    const elapsed = now - this.startTime;
    const duration = this.config.duration!;

    if (elapsed >= duration) {
      this.value._updateValue(this.config.toValue);
      this.isRunning = false;
      callback?.({ finished: true });
      return;
    }

    const progress = elapsed / duration;
    const eased = this.config.easing!(progress);
    const newValue = this.fromValue + (this.config.toValue - this.fromValue) * eased;

    this.value._updateValue(newValue);

    this.animationFrame = requestAnimationFrame(() => this.animate(callback));
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}

/**
 * Spring Animation
 */
export class SpringAnimation extends Animation {
  private readonly value: AnimatedValue;
  private readonly config: SpringAnimationConfig;
  private velocity: number;
  private position: number;

  constructor(value: AnimatedValue, config: SpringAnimationConfig) {
    super();
    this.value = value;
    this.config = {
      damping: 10,
      mass: 1,
      stiffness: 100,
      overshootClamping: false,
      restDisplacementThreshold: 0.001,
      restSpeedThreshold: 0.001,
      velocity: 0,
      delay: 0,
      useNativeDriver: false,
      ...config,
    };
    this.position = value.value;
    this.velocity = this.config.velocity!;
  }

  start(callback?: AnimationCallback): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.value._setAnimation(this);
    this.position = this.value.value;

    const startAnimation = (): void => {
      this.startTime = performance.now();
      this.animate(callback);
    };

    if (this.config.delay && this.config.delay > 0) {
      setTimeout(startAnimation, this.config.delay);
    } else {
      startAnimation();
    }
  }

  private animate(callback?: AnimationCallback): void {
    if (!this.isRunning) return;

    const { toValue, damping, mass, stiffness, restDisplacementThreshold, restSpeedThreshold, overshootClamping } =
      this.config;

    // Spring physics
    const displacement = this.position - toValue!;
    const springForce = -stiffness! * displacement;
    const dampingForce = -damping! * this.velocity;
    const acceleration = (springForce + dampingForce) / mass!;

    this.velocity += acceleration * (1 / 60); // Assume 60fps
    this.position += this.velocity * (1 / 60);

    // Check for overshoot clamping
    if (overshootClamping) {
      if (this.position > toValue! && displacement < 0) {
        this.position = toValue!;
        this.velocity = 0;
      } else if (this.position < toValue! && displacement > 0) {
        this.position = toValue!;
        this.velocity = 0;
      }
    }

    // Check if at rest
    const isAtRest =
      Math.abs(this.velocity) < restSpeedThreshold! &&
      Math.abs(this.position - toValue!) < restDisplacementThreshold!;

    if (isAtRest) {
      this.value._updateValue(toValue!);
      this.isRunning = false;
      callback?.({ finished: true });
      return;
    }

    this.value._updateValue(this.position);

    this.animationFrame = requestAnimationFrame(() => this.animate(callback));
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}

/**
 * Animated API
 *
 * Main entry point for animations, similar to React Native's Animated API.
 */
export const Animated = {
  /**
   * Create an animated value
   */
  Value: AnimatedValue,

  /**
   * Create an animated XY value (for 2D animations)
   */
  ValueXY: class AnimatedValueXY {
    x: AnimatedValue;
    y: AnimatedValue;

    constructor(value?: { x: number; y: number }) {
      this.x = new AnimatedValue(value?.x ?? 0);
      this.y = new AnimatedValue(value?.y ?? 0);
    }

    setValue(value: { x: number; y: number }): void {
      this.x.setValue(value.x);
      this.y.setValue(value.y);
    }

    setOffset(offset: { x: number; y: number }): void {
      this.x.setOffset(offset.x);
      this.y.setOffset(offset.y);
    }

    flattenOffset(): void {
      this.x.flattenOffset();
      this.y.flattenOffset();
    }

    extractOffset(): void {
      this.x.extractOffset();
      this.y.extractOffset();
    }

    stopAnimation(callback?: (value: { x: number; y: number }) => void): void {
      this.x.stopAnimation();
      this.y.stopAnimation();
      callback?.({ x: this.x.value, y: this.y.value });
    }

    getLayout(): { left: AnimatedValue; top: AnimatedValue } {
      return { left: this.x, top: this.y };
    }

    getTranslateTransform(): Array<{ translateX: AnimatedValue } | { translateY: AnimatedValue }> {
      return [{ translateX: this.x }, { translateY: this.y }];
    }
  },

  /**
   * Create a timing animation
   */
  timing: (value: AnimatedValue, config: TimingAnimationConfig) => ({
    start: (callback?: AnimationCallback) => {
      new TimingAnimation(value, config).start(callback);
    },
  }),

  /**
   * Create a spring animation
   */
  spring: (value: AnimatedValue, config: SpringAnimationConfig) => ({
    start: (callback?: AnimationCallback) => {
      new SpringAnimation(value, config).start(callback);
    },
  }),

  /**
   * Run animations in sequence
   */
  sequence: (animations: Array<{ start: (callback?: AnimationCallback) => void }>) => ({
    start: (callback?: AnimationCallback) => {
      let index = 0;

      const runNext = (): void => {
        if (index >= animations.length) {
          callback?.({ finished: true });
          return;
        }

        animations[index].start((result) => {
          if (result.finished) {
            index++;
            runNext();
          } else {
            callback?.({ finished: false });
          }
        });
      };

      runNext();
    },
  }),

  /**
   * Run animations in parallel
   */
  parallel: (
    animations: Array<{ start: (callback?: AnimationCallback) => void }>,
    _config?: { stopTogether?: boolean }
  ) => ({
    start: (callback?: AnimationCallback) => {
      let completedCount = 0;
      let hasFinished = true;

      animations.forEach((anim) => {
        anim.start((result) => {
          completedCount++;

          if (!result.finished) {
            hasFinished = false;
          }

          if (completedCount === animations.length) {
            callback?.({ finished: hasFinished });
          }
        });
      });
    },
  }),

  /**
   * Stagger animations with delay
   */
  stagger: (
    time: number,
    animations: Array<{ start: (callback?: AnimationCallback) => void }>
  ) => ({
    start: (callback?: AnimationCallback) => {
      let completedCount = 0;
      let hasFinished = true;

      animations.forEach((anim, index) => {
        setTimeout(() => {
          anim.start((result) => {
            completedCount++;

            if (!result.finished) {
              hasFinished = false;
            }

            if (completedCount === animations.length) {
              callback?.({ finished: hasFinished });
            }
          });
        }, index * time);
      });
    },
  }),

  /**
   * Loop an animation
   */
  loop: (
    animation: { start: (callback?: AnimationCallback) => void },
    config?: { iterations?: number; resetBeforeIteration?: boolean }
  ) => ({
    start: (callback?: AnimationCallback) => {
      const iterations = config?.iterations ?? -1; // -1 for infinite
      let currentIteration = 0;

      const runIteration = (): void => {
        if (iterations !== -1 && currentIteration >= iterations) {
          callback?.({ finished: true });
          return;
        }

        animation.start((result) => {
          if (result.finished) {
            currentIteration++;
            runIteration();
          } else {
            callback?.({ finished: false });
          }
        });
      };

      runIteration();
    },
  }),

  /**
   * Delay before starting animation
   */
  delay: (time: number) => ({
    start: (callback?: AnimationCallback) => {
      setTimeout(() => {
        callback?.({ finished: true });
      }, time);
    },
  }),

  /**
   * Easing functions
   */
  Easing,
};

