import { Injectable } from '@angular/core';
import {
  NativeStyle,
  ViewStyle,
  createStyleSheet,
  transformStyle,
  mergeStyles,
} from '../types/style.types';

/**
 * Transformed style result type
 */
type TransformedStyleResult = Record<string, string | number | boolean | null | undefined>;

/**
 * Registered style sheets
 */
interface StyleSheetRegistry {
  [key: string]: NativeStyle;
}

/**
 * Style Service
 *
 * Provides utilities for creating, managing, and applying
 * native mobile styles in Angular components.
 */
@Injectable()
export class StyleService {
  private readonly registry = new Map<string, StyleSheetRegistry>();
  private styleIdCounter = 0;

  /**
   * Create a style sheet and register it
   *
   * @example
   * ```typescript
   * const styles = styleService.create({
   *   container: {
   *     flex: 1,
   *     backgroundColor: '#ffffff',
   *   },
   *   title: {
   *     fontSize: 24,
   *     fontWeight: 'bold',
   *   },
   * });
   * ```
   */
  create<T extends Record<string, NativeStyle>>(styles: T): T {
    const styleSheet = createStyleSheet(styles);
    const id = `stylesheet_${++this.styleIdCounter}`;
    this.registry.set(id, styleSheet);
    return styleSheet;
  }

  /**
   * Flatten multiple styles into a single style object
   */
  flatten(...styles: (NativeStyle | undefined | null | false)[]): NativeStyle {
    return mergeStyles(...styles);
  }

  /**
   * Transform style for native consumption
   */
  transform(style: NativeStyle): TransformedStyleResult {
    return transformStyle(style);
  }

  /**
   * Create absolute fill style
   */
  get absoluteFill(): ViewStyle {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  }

  /**
   * Create absolute fill object (for spread operator)
   */
  get absoluteFillObject(): ViewStyle {
    return { ...this.absoluteFill };
  }

  /**
   * Get hairline width for thin borders
   */
  get hairlineWidth(): number {
    // This would be calculated based on device pixel ratio
    return 0.5;
  }

  /**
   * Compose styles conditionally
   */
  compose(
    baseStyle: NativeStyle,
    conditionalStyles: Array<[boolean, NativeStyle]>
  ): NativeStyle {
    let result = { ...baseStyle };

    for (const [condition, style] of conditionalStyles) {
      if (condition) {
        result = { ...result, ...style };
      }
    }

    return result;
  }

  /**
   * Create responsive styles based on dimensions
   */
  responsive<T extends NativeStyle>(
    baseStyle: T,
    breakpoints: {
      sm?: Partial<T>;
      md?: Partial<T>;
      lg?: Partial<T>;
      xl?: Partial<T>;
    }
  ): (width: number) => T {
    return (width: number): T => {
      let style = { ...baseStyle };

      if (width >= 320 && breakpoints.sm) {
        style = { ...style, ...breakpoints.sm };
      }
      if (width >= 480 && breakpoints.md) {
        style = { ...style, ...breakpoints.md };
      }
      if (width >= 768 && breakpoints.lg) {
        style = { ...style, ...breakpoints.lg };
      }
      if (width >= 1024 && breakpoints.xl) {
        style = { ...style, ...breakpoints.xl };
      }

      return style;
    };
  }

  /**
   * Create themed styles
   */
  themed<T extends Record<string, NativeStyle>>(
    lightStyles: T,
    darkStyles: Partial<T>
  ): (isDark: boolean) => T {
    return (isDark: boolean): T => {
      if (isDark) {
        const merged = {} as T;
        for (const key of Object.keys(lightStyles) as Array<keyof T>) {
          merged[key] = {
            ...lightStyles[key],
            ...(darkStyles[key] ?? {}),
          } as T[keyof T];
        }
        return merged;
      }
      return lightStyles;
    };
  }

  /**
   * Common style presets
   */
  readonly presets = {
    // Flex layouts
    row: { flexDirection: 'row' as const },
    column: { flexDirection: 'column' as const },
    center: {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    spaceBetween: { justifyContent: 'space-between' as const },
    spaceAround: { justifyContent: 'space-around' as const },
    flexStart: { alignItems: 'flex-start' as const },
    flexEnd: { alignItems: 'flex-end' as const },
    flex1: { flex: 1 },

    // Shadows
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    } as ViewStyle,

    shadowLight: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    } as ViewStyle,

    shadowMedium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    } as ViewStyle,

    shadowHeavy: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    } as ViewStyle,

    // Border radius
    rounded: { borderRadius: 8 },
    roundedSm: { borderRadius: 4 },
    roundedLg: { borderRadius: 16 },
    roundedFull: { borderRadius: 9999 },

    // Padding
    p1: { padding: 4 },
    p2: { padding: 8 },
    p3: { padding: 12 },
    p4: { padding: 16 },
    p5: { padding: 20 },
    p6: { padding: 24 },

    // Margin
    m1: { margin: 4 },
    m2: { margin: 8 },
    m3: { margin: 12 },
    m4: { margin: 16 },
    m5: { margin: 20 },
    m6: { margin: 24 },
  };
}
