/**
 * Native style properties for Android views
 * Similar to React Native's StyleSheet but optimized for Angular
 */

/**
 * Flexbox alignment values
 */
export type FlexAlignType = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
export type FlexJustifyType =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type FlexDirectionType = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrapType = 'wrap' | 'nowrap' | 'wrap-reverse';
export type PositionType = 'absolute' | 'relative';
export type OverflowType = 'visible' | 'hidden' | 'scroll';
export type DisplayType = 'none' | 'flex';

/**
 * Font style values
 */
export type FontStyleType = 'normal' | 'italic';
export type FontWeightType =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';
export type TextAlignType = 'auto' | 'left' | 'right' | 'center' | 'justify';
export type TextDecorationLineType = 'none' | 'underline' | 'line-through' | 'underline line-through';
export type TextTransformType = 'none' | 'capitalize' | 'uppercase' | 'lowercase';

/**
 * Border style values
 */
export type BorderStyleType = 'solid' | 'dotted' | 'dashed';

/**
 * Image resize modes
 */
export type ResizeModeType = 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';

/**
 * Dimension value (number for dp, or percentage string)
 */
export type DimensionValue = number | `${number}%` | 'auto';

/**
 * Color value (hex, rgb, rgba, or named color)
 */
export type ColorValue = string;

/**
 * Shadow style for Android elevation
 */
export interface ShadowStyle {
  shadowColor?: ColorValue;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

/**
 * Transform style
 */
export interface TransformStyle {
  perspective?: number;
  rotate?: string;
  rotateX?: string;
  rotateY?: string;
  rotateZ?: string;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  translateX?: number;
  translateY?: number;
  skewX?: string;
  skewY?: string;
}

/**
 * Layout style properties (Flexbox)
 */
export interface LayoutStyle {
  // Dimensions
  width?: DimensionValue;
  height?: DimensionValue;
  minWidth?: DimensionValue;
  minHeight?: DimensionValue;
  maxWidth?: DimensionValue;
  maxHeight?: DimensionValue;

  // Flexbox
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: DimensionValue;
  flexDirection?: FlexDirectionType;
  flexWrap?: FlexWrapType;
  alignItems?: FlexAlignType;
  alignSelf?: FlexAlignType | 'auto';
  alignContent?: FlexAlignType | 'space-between' | 'space-around';
  justifyContent?: FlexJustifyType;

  // Positioning
  position?: PositionType;
  top?: DimensionValue;
  right?: DimensionValue;
  bottom?: DimensionValue;
  left?: DimensionValue;
  zIndex?: number;

  // Margin
  margin?: DimensionValue;
  marginTop?: DimensionValue;
  marginRight?: DimensionValue;
  marginBottom?: DimensionValue;
  marginLeft?: DimensionValue;
  marginHorizontal?: DimensionValue;
  marginVertical?: DimensionValue;

  // Padding
  padding?: DimensionValue;
  paddingTop?: DimensionValue;
  paddingRight?: DimensionValue;
  paddingBottom?: DimensionValue;
  paddingLeft?: DimensionValue;
  paddingHorizontal?: DimensionValue;
  paddingVertical?: DimensionValue;

  // Display
  display?: DisplayType;
  overflow?: OverflowType;

  // Aspect ratio
  aspectRatio?: number;

  // Gap (Flexbox gap)
  gap?: number;
  rowGap?: number;
  columnGap?: number;
}

/**
 * View style properties
 */
export interface ViewStyle extends LayoutStyle, ShadowStyle {
  // Background
  backgroundColor?: ColorValue;
  opacity?: number;

  // Border
  borderWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderColor?: ColorValue;
  borderTopColor?: ColorValue;
  borderRightColor?: ColorValue;
  borderBottomColor?: ColorValue;
  borderLeftColor?: ColorValue;
  borderStyle?: BorderStyleType;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;

  // Transform
  transform?: TransformStyle[];

  // Interaction
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
}

/**
 * Text style properties
 */
export interface TextStyle extends ViewStyle {
  // Font
  color?: ColorValue;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: FontStyleType;
  fontWeight?: FontWeightType;
  letterSpacing?: number;
  lineHeight?: number;

  // Text
  textAlign?: TextAlignType;
  textDecorationLine?: TextDecorationLineType;
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
  textDecorationColor?: ColorValue;
  textShadowColor?: ColorValue;
  textShadowOffset?: { width: number; height: number };
  textShadowRadius?: number;
  textTransform?: TextTransformType;

  // Android-specific
  includeFontPadding?: boolean;
  textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
}

/**
 * Image style properties
 */
export interface ImageStyle extends ViewStyle {
  resizeMode?: ResizeModeType;
  tintColor?: ColorValue;
  overlayColor?: ColorValue;
}

/**
 * Combined native style type
 */
export type NativeStyle = ViewStyle | TextStyle | ImageStyle;

/**
 * Style sheet type (collection of named styles)
 */
export type StyleSheet<T extends string> = Record<T, NativeStyle>;

/**
 * Create a style sheet (similar to React Native's StyleSheet.create)
 */
export function createStyleSheet<T extends Record<string, NativeStyle>>(styles: T): T {
  // In production, this would optimize and validate styles
  return Object.freeze(styles) as T;
}

/**
 * Transform style object to Android-compatible format
 */
export function transformStyle(style: NativeStyle): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(style)) {
    if (value === undefined || value === null) {
      continue;
    }

    // Handle transform array
    if (key === 'transform' && Array.isArray(value)) {
      transformed[key] = value.map((t) => {
        const transformKey = Object.keys(t)[0];
        return { [transformKey]: t[transformKey as keyof TransformStyle] };
      });
      continue;
    }

    // Handle dimension values (convert percentages)
    if (typeof value === 'string' && value.endsWith('%')) {
      transformed[key] = { type: 'percent', value: parseFloat(value) };
      continue;
    }

    // Handle shorthand properties
    if (key === 'margin' && typeof value === 'number') {
      transformed.marginTop = value;
      transformed.marginRight = value;
      transformed.marginBottom = value;
      transformed.marginLeft = value;
      continue;
    }

    if (key === 'padding' && typeof value === 'number') {
      transformed.paddingTop = value;
      transformed.paddingRight = value;
      transformed.paddingBottom = value;
      transformed.paddingLeft = value;
      continue;
    }

    if (key === 'marginHorizontal') {
      transformed.marginLeft = value;
      transformed.marginRight = value;
      continue;
    }

    if (key === 'marginVertical') {
      transformed.marginTop = value;
      transformed.marginBottom = value;
      continue;
    }

    if (key === 'paddingHorizontal') {
      transformed.paddingLeft = value;
      transformed.paddingRight = value;
      continue;
    }

    if (key === 'paddingVertical') {
      transformed.paddingTop = value;
      transformed.paddingBottom = value;
      continue;
    }

    if (key === 'borderRadius' && typeof value === 'number') {
      transformed.borderTopLeftRadius = value;
      transformed.borderTopRightRadius = value;
      transformed.borderBottomLeftRadius = value;
      transformed.borderBottomRightRadius = value;
      continue;
    }

    transformed[key] = value;
  }

  return transformed;
}

/**
 * Merge multiple styles into one
 */
export function mergeStyles(...styles: (NativeStyle | undefined | null | false)[]): NativeStyle {
  const merged: NativeStyle = {};

  for (const style of styles) {
    if (style) {
      Object.assign(merged, style);
    }
  }

  return merged;
}
