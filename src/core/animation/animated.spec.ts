import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AnimatedValue,
  AnimatedInterpolation,
  Animated,
  Easing,
  TimingAnimation,
  SpringAnimation,
} from './animated';

describe('AnimatedValue', () => {
  let animatedValue: AnimatedValue;

  beforeEach(() => {
    animatedValue = new AnimatedValue(0);
  });

  describe('constructor', () => {
    it('should create with initial value', () => {
      const value = new AnimatedValue(100);
      expect(value.value).toBe(100);
    });

    it('should default to 0', () => {
      const value = new AnimatedValue();
      expect(value.value).toBe(0);
    });
  });

  describe('setValue', () => {
    it('should update value', () => {
      animatedValue.setValue(50);
      expect(animatedValue.value).toBe(50);
    });

    it('should notify listeners', () => {
      const listener = vi.fn();
      animatedValue.addListener(listener);

      animatedValue.setValue(25);

      expect(listener).toHaveBeenCalledWith({ value: 25 });
    });
  });

  describe('setOffset', () => {
    it('should add offset to value', () => {
      animatedValue.setValue(10);
      animatedValue.setOffset(5);

      expect(animatedValue.value).toBe(15);
    });
  });

  describe('flattenOffset', () => {
    it('should merge offset into value', () => {
      animatedValue.setValue(10);
      animatedValue.setOffset(5);
      animatedValue.flattenOffset();

      expect(animatedValue.value).toBe(15);

      // After flattening, offset should be 0
      animatedValue.setOffset(0);
      expect(animatedValue.value).toBe(15);
    });
  });

  describe('extractOffset', () => {
    it('should extract value to offset', () => {
      animatedValue.setValue(20);
      animatedValue.extractOffset();

      // Value is reset to 0, offset becomes 20
      expect(animatedValue.value).toBe(20);
    });
  });

  describe('addListener / removeListener', () => {
    it('should add listener and return ID', () => {
      const listener = vi.fn();
      const id = animatedValue.addListener(listener);

      expect(typeof id).toBe('string');
    });

    it('should remove listener by ID', () => {
      const listener = vi.fn();
      const id = animatedValue.addListener(listener);

      animatedValue.removeListener(id);
      animatedValue.setValue(100);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should remove all listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      animatedValue.addListener(listener1);
      animatedValue.addListener(listener2);

      animatedValue.removeAllListeners();
      animatedValue.setValue(100);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('interpolate', () => {
    it('should create interpolation', () => {
      const interpolation = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
      });

      expect(interpolation).toBeInstanceOf(AnimatedInterpolation);
    });
  });

  describe('stopAnimation', () => {
    it('should call callback with current value', () => {
      animatedValue.setValue(42);
      const callback = vi.fn();

      animatedValue.stopAnimation(callback);

      expect(callback).toHaveBeenCalledWith(42);
    });
  });
});

describe('AnimatedInterpolation', () => {
  it('should interpolate numeric values', () => {
    const value = new AnimatedValue(50);
    const interpolation = value.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
    });

    expect(interpolation.value).toBe(0.5);
  });

  it('should clamp when extrapolate is clamp', () => {
    const value = new AnimatedValue(150);
    const interpolation = value.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    expect(interpolation.value).toBe(1);
  });

  it('should extend beyond range when extrapolate is extend', () => {
    const value = new AnimatedValue(200);
    const interpolation = value.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 100],
      extrapolate: 'extend',
    });

    expect(interpolation.value).toBe(200);
  });

  it('should handle multi-segment interpolation', () => {
    const value = new AnimatedValue(75);
    const interpolation = value.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [0, 50, 200],
    });

    expect(interpolation.value).toBe(125);
  });

  it('should handle color interpolation', () => {
    const value = new AnimatedValue(0.5);
    const interpolation = value.interpolate({
      inputRange: [0, 1],
      outputRange: ['#000000', '#ffffff'],
    });

    const result = interpolation.value;
    expect(typeof result).toBe('string');
    expect(result).toContain('rgba');
  });
});

describe('Easing', () => {
  it('should have linear easing', () => {
    expect(Easing.linear(0)).toBe(0);
    expect(Easing.linear(0.5)).toBe(0.5);
    expect(Easing.linear(1)).toBe(1);
  });

  it('should have quad easing', () => {
    expect(Easing.quad(0)).toBe(0);
    expect(Easing.quad(0.5)).toBe(0.25);
    expect(Easing.quad(1)).toBe(1);
  });

  it('should have cubic easing', () => {
    expect(Easing.cubic(0)).toBe(0);
    expect(Easing.cubic(0.5)).toBe(0.125);
    expect(Easing.cubic(1)).toBe(1);
  });

  it('should have polynomial easing', () => {
    const quartic = Easing.poly(4);
    expect(quartic(0)).toBe(0);
    expect(quartic(0.5)).toBe(0.0625);
    expect(quartic(1)).toBe(1);
  });

  it('should have sinusoidal easing', () => {
    expect(Easing.sin(0)).toBeCloseTo(0);
    expect(Easing.sin(1)).toBeCloseTo(1);
  });

  it('should have circular easing', () => {
    expect(Easing.circle(0)).toBeCloseTo(0);
    expect(Easing.circle(1)).toBeCloseTo(1);
  });

  it('should have bounce easing', () => {
    expect(Easing.bounce(0)).toBe(0);
    expect(Easing.bounce(1)).toBeCloseTo(1);
  });

  it('should have back easing', () => {
    const backEasing = Easing.back();
    expect(backEasing(0)).toBeCloseTo(0);
    expect(backEasing(1)).toBeGreaterThan(0);
  });

  it('should have elastic easing', () => {
    const elasticEasing = Easing.elastic();
    expect(elasticEasing(0)).toBeCloseTo(0);
    expect(elasticEasing(1)).toBeCloseTo(1);
  });

  it('should have in/out modifiers', () => {
    const easeIn = Easing.in(Easing.quad);
    const easeOut = Easing.out(Easing.quad);
    const easeInOut = Easing.inOut(Easing.quad);

    expect(easeIn(0.5)).toBe(0.25);
    expect(easeOut(0.5)).toBe(0.75);
    expect(easeInOut(0.5)).toBeCloseTo(0.5);
  });

  it('should have bezier easing', () => {
    const bezier = Easing.bezier(0.25, 0.1, 0.25, 1);
    expect(bezier(0)).toBeCloseTo(0);
    expect(bezier(1)).toBeCloseTo(1, 0);
  });

  it('should have ease presets', () => {
    expect(typeof Easing.ease(0.5)).toBe('number');
    expect(typeof Easing.easeIn(0.5)).toBe('number');
    expect(typeof Easing.easeOut(0.5)).toBe('number');
    expect(typeof Easing.easeInOut(0.5)).toBe('number');
  });
});

describe('Animated API', () => {
  describe('timing', () => {
    it('should create timing animation', () => {
      const value = new AnimatedValue(0);
      const animation = Animated.timing(value, {
        toValue: 100,
        duration: 300,
      });

      expect(animation).toHaveProperty('start');
    });

    it('should accept easing function', () => {
      const value = new AnimatedValue(0);
      const animation = Animated.timing(value, {
        toValue: 100,
        duration: 300,
        easing: Easing.bounce,
      });

      expect(animation).toHaveProperty('start');
    });
  });

  describe('spring', () => {
    it('should create spring animation', () => {
      const value = new AnimatedValue(0);
      const animation = Animated.spring(value, {
        toValue: 100,
      });

      expect(animation).toHaveProperty('start');
    });

    it('should accept spring configuration', () => {
      const value = new AnimatedValue(0);
      const animation = Animated.spring(value, {
        toValue: 100,
        damping: 20,
        stiffness: 200,
        mass: 1,
      });

      expect(animation).toHaveProperty('start');
    });
  });

  describe('sequence', () => {
    it('should run animations in sequence', () => {
      return new Promise<void>((done) => {
        const results: number[] = [];

        const anim1 = {
          start: (cb?: (result: { finished: boolean }) => void) => {
            results.push(1);
            cb?.({ finished: true });
          },
        };

        const anim2 = {
          start: (cb?: (result: { finished: boolean }) => void) => {
            results.push(2);
            cb?.({ finished: true });
          },
        };

        Animated.sequence([anim1, anim2]).start(() => {
          expect(results).toEqual([1, 2]);
          done();
        });
      });
    });

    it('should stop sequence if animation fails', () => {
      return new Promise<void>((done) => {
        const results: number[] = [];

        const anim1 = {
          start: (cb?: (result: { finished: boolean }) => void) => {
            results.push(1);
            cb?.({ finished: false });
          },
        };

        const anim2 = {
          start: (cb?: (result: { finished: boolean }) => void) => {
            results.push(2);
            cb?.({ finished: true });
          },
        };

        Animated.sequence([anim1, anim2]).start((result) => {
          expect(results).toEqual([1]);
          expect(result.finished).toBe(false);
          done();
        });
      });
    });
  });

  describe('parallel', () => {
    it('should run animations in parallel', () => {
      return new Promise<void>((done) => {
        const results: number[] = [];

        const anim1 = {
          start: (cb?: (result: { finished: boolean }) => void) => {
            setTimeout(() => {
              results.push(1);
              cb?.({ finished: true });
            }, 10);
          },
        };

        const anim2 = {
          start: (cb?: (result: { finished: boolean }) => void) => {
            setTimeout(() => {
              results.push(2);
              cb?.({ finished: true });
            }, 5);
          },
        };

        Animated.parallel([anim1, anim2]).start(() => {
          expect(results).toContain(1);
          expect(results).toContain(2);
          done();
        });
      });
    });
  });

  describe('stagger', () => {
    it('should stagger animations', () => {
      return new Promise<void>((done) => {
        const startTimes: number[] = [];
        const baseTime = Date.now();

        const anim1 = {
          start: (cb?: (result: { finished: boolean }) => void) => {
            startTimes.push(Date.now() - baseTime);
            cb?.({ finished: true });
          },
        };

        const anim2 = {
          start: (cb?: (result: { finished: boolean }) => void) => {
            startTimes.push(Date.now() - baseTime);
            cb?.({ finished: true });
          },
        };

        Animated.stagger(20, [anim1, anim2]).start(() => {
          // Allow some timing tolerance due to JS timer precision
          expect(startTimes[1] - startTimes[0]).toBeGreaterThanOrEqual(5);
          done();
        });
      });
    });
  });

  describe('delay', () => {
    it('should create delay animation', () => {
      return new Promise<void>((done) => {
        const start = Date.now();

        Animated.delay(50).start(() => {
          const elapsed = Date.now() - start;
          expect(elapsed).toBeGreaterThanOrEqual(45);
          done();
        });
      });
    });
  });

  describe('loop', () => {
    it('should loop animation specified times', () => {
      return new Promise<void>((done) => {
        let count = 0;

        const anim = {
          start: (cb?: (result: { finished: boolean }) => void) => {
            count++;
            cb?.({ finished: true });
          },
        };

        Animated.loop(anim, { iterations: 3 }).start(() => {
          expect(count).toBe(3);
          done();
        });
      });
    });
  });

  describe('ValueXY', () => {
    it('should create 2D animated value', () => {
      const valueXY = new Animated.ValueXY({ x: 10, y: 20 });

      expect(valueXY.x.value).toBe(10);
      expect(valueXY.y.value).toBe(20);
    });

    it('should default to 0,0', () => {
      const valueXY = new Animated.ValueXY();

      expect(valueXY.x.value).toBe(0);
      expect(valueXY.y.value).toBe(0);
    });

    it('should set both values', () => {
      const valueXY = new Animated.ValueXY();
      valueXY.setValue({ x: 100, y: 200 });

      expect(valueXY.x.value).toBe(100);
      expect(valueXY.y.value).toBe(200);
    });

    it('should set offset for both values', () => {
      const valueXY = new Animated.ValueXY({ x: 10, y: 20 });
      valueXY.setOffset({ x: 5, y: 10 });

      expect(valueXY.x.value).toBe(15);
      expect(valueXY.y.value).toBe(30);
    });

    it('should flatten offset for both values', () => {
      const valueXY = new Animated.ValueXY({ x: 10, y: 20 });
      valueXY.setOffset({ x: 5, y: 10 });
      valueXY.flattenOffset();

      expect(valueXY.x.value).toBe(15);
      expect(valueXY.y.value).toBe(30);
    });

    it('should extract offset for both values', () => {
      const valueXY = new Animated.ValueXY({ x: 10, y: 20 });
      valueXY.extractOffset();

      expect(valueXY.x.value).toBe(10);
      expect(valueXY.y.value).toBe(20);
    });

    it('should stop animation and call callback', () => {
      const valueXY = new Animated.ValueXY({ x: 50, y: 100 });
      const callback = vi.fn();

      valueXY.stopAnimation(callback);

      expect(callback).toHaveBeenCalledWith({ x: 50, y: 100 });
    });

    it('should get layout properties', () => {
      const valueXY = new Animated.ValueXY({ x: 50, y: 100 });
      const layout = valueXY.getLayout();

      expect(layout.left).toBe(valueXY.x);
      expect(layout.top).toBe(valueXY.y);
    });

    it('should get transform properties', () => {
      const valueXY = new Animated.ValueXY({ x: 50, y: 100 });
      const transform = valueXY.getTranslateTransform();

      expect(transform).toHaveLength(2);
      expect(transform[0]).toHaveProperty('translateX');
      expect(transform[1]).toHaveProperty('translateY');
    });
  });

  describe('Easing export', () => {
    it('should export Easing functions via Animated', () => {
      expect(Animated.Easing).toBe(Easing);
    });
  });
});

describe('TimingAnimation', () => {
  it('should animate value from start to end', () => {
    return new Promise<void>((done) => {
      const value = new AnimatedValue(0);
      const animation = new TimingAnimation(value, {
        toValue: 100,
        duration: 50,
      });

      animation.start((result) => {
        expect(result.finished).toBe(true);
        expect(value.value).toBe(100);
        done();
      });
    });
  });

  it('should support delay', () => {
    return new Promise<void>((done) => {
      const value = new AnimatedValue(0);
      const start = Date.now();
      const animation = new TimingAnimation(value, {
        toValue: 100,
        duration: 50,
        delay: 50,
      });

      animation.start(() => {
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(90);
        done();
      });
    });
  });
});

describe('SpringAnimation', () => {
  it('should animate value with spring physics', () => {
    return new Promise<void>((done) => {
      const value = new AnimatedValue(0);
      const animation = new SpringAnimation(value, {
        toValue: 100,
        damping: 20,
        stiffness: 200,
      });

      animation.start((result) => {
        expect(result.finished).toBe(true);
        expect(value.value).toBeCloseTo(100, 0);
        done();
      });
    });
  }, 10000);
});
