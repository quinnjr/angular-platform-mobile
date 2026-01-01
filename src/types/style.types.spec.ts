import { describe, it, expect } from 'vitest';
import {
  createStyleSheet,
  transformStyle,
  mergeStyles,
  ViewStyle,
  TextStyle,
} from './style.types';

describe('Style Types', () => {
  describe('createStyleSheet', () => {
    it('should create a frozen style sheet', () => {
      const styles = createStyleSheet({
        container: { flex: 1, backgroundColor: '#fff' },
        text: { fontSize: 16, color: '#000' },
      });

      expect(Object.isFrozen(styles)).toBe(true);
      expect(styles.container.flex).toBe(1);
      expect(styles.text.fontSize).toBe(16);
    });

    it('should preserve all style properties', () => {
      const styles = createStyleSheet({
        button: {
          padding: 12,
          marginHorizontal: 8,
          borderRadius: 6,
        },
      });

      expect(styles.button.padding).toBe(12);
      expect(styles.button.marginHorizontal).toBe(8);
      expect(styles.button.borderRadius).toBe(6);
    });
  });

  describe('transformStyle', () => {
    it('should expand margin shorthand', () => {
      const style: ViewStyle = { margin: 10 };
      const transformed = transformStyle(style);

      expect(transformed.marginTop).toBe(10);
      expect(transformed.marginRight).toBe(10);
      expect(transformed.marginBottom).toBe(10);
      expect(transformed.marginLeft).toBe(10);
    });

    it('should expand padding shorthand', () => {
      const style: ViewStyle = { padding: 16 };
      const transformed = transformStyle(style);

      expect(transformed.paddingTop).toBe(16);
      expect(transformed.paddingRight).toBe(16);
      expect(transformed.paddingBottom).toBe(16);
      expect(transformed.paddingLeft).toBe(16);
    });

    it('should expand marginHorizontal', () => {
      const style: ViewStyle = { marginHorizontal: 20 };
      const transformed = transformStyle(style);

      expect(transformed.marginLeft).toBe(20);
      expect(transformed.marginRight).toBe(20);
    });

    it('should expand marginVertical', () => {
      const style: ViewStyle = { marginVertical: 15 };
      const transformed = transformStyle(style);

      expect(transformed.marginTop).toBe(15);
      expect(transformed.marginBottom).toBe(15);
    });

    it('should expand paddingHorizontal', () => {
      const style: ViewStyle = { paddingHorizontal: 24 };
      const transformed = transformStyle(style);

      expect(transformed.paddingLeft).toBe(24);
      expect(transformed.paddingRight).toBe(24);
    });

    it('should expand paddingVertical', () => {
      const style: ViewStyle = { paddingVertical: 12 };
      const transformed = transformStyle(style);

      expect(transformed.paddingTop).toBe(12);
      expect(transformed.paddingBottom).toBe(12);
    });

    it('should expand borderRadius', () => {
      const style: ViewStyle = { borderRadius: 8 };
      const transformed = transformStyle(style);

      expect(transformed.borderTopLeftRadius).toBe(8);
      expect(transformed.borderTopRightRadius).toBe(8);
      expect(transformed.borderBottomLeftRadius).toBe(8);
      expect(transformed.borderBottomRightRadius).toBe(8);
    });

    it('should handle percentage values', () => {
      const style: ViewStyle = { width: '50%' as any };
      const transformed = transformStyle(style);

      expect(transformed.width).toEqual({ type: 'percent', value: 50 });
    });

    it('should skip undefined values', () => {
      const style: ViewStyle = { flex: 1, backgroundColor: undefined as any };
      const transformed = transformStyle(style);

      expect(transformed.flex).toBe(1);
      expect('backgroundColor' in transformed).toBe(false);
    });

    it('should handle transform arrays', () => {
      const style: ViewStyle = {
        transform: [
          { translateX: 10 },
          { translateY: 20 },
          { scale: 1.5 },
        ],
      };
      const transformed = transformStyle(style);

      expect(Array.isArray(transformed.transform)).toBe(true);
      expect(transformed.transform).toHaveLength(3);
    });
  });

  describe('mergeStyles', () => {
    it('should merge multiple styles', () => {
      const style1: ViewStyle = { flex: 1, backgroundColor: '#fff' };
      const style2: ViewStyle = { padding: 16 };
      const style3: ViewStyle = { backgroundColor: '#000' };

      const merged = mergeStyles(style1, style2, style3);

      expect(merged.flex).toBe(1);
      expect(merged.padding).toBe(16);
      expect(merged.backgroundColor).toBe('#000'); // Later style wins
    });

    it('should handle undefined and null styles', () => {
      const style1: ViewStyle = { flex: 1 };

      const merged = mergeStyles(style1, undefined, null, false);

      expect(merged.flex).toBe(1);
    });

    it('should return empty object for no valid styles', () => {
      const merged = mergeStyles(undefined, null, false);

      expect(merged).toEqual({});
    });

    it('should merge text styles', () => {
      const baseText: TextStyle = { fontSize: 14, color: '#333' };
      const boldText: TextStyle = { fontWeight: 'bold' };

      const merged = mergeStyles(baseText, boldText) as TextStyle;

      expect(merged.fontSize).toBe(14);
      expect(merged.color).toBe('#333');
      expect(merged.fontWeight).toBe('bold');
    });
  });
});
