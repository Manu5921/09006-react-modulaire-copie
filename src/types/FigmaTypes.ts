

// Re-exporting or defining specific sub-types if needed, or using Figma's directly
// For now, we'll define our token structures that might differ or simplify Figma's.

/**
 * Represents a color token extracted from Figma.
 */
export interface ColorToken {
  name: string;
  value: string; // e.g., #RRGGBB
  figmaStyleId: string; // The ID of the style in Figma (style.key)
  description?: string;
}

/**
 * Represents a text style token extracted from Figma.
 */
export interface TextStyleToken {
  name: string;
  fontFamily: string;
  fontWeight: number;
  fontSize: number; // in pixels
  lineHeight: {
    value: number;
    unit: 'PIXELS' | 'PERCENT_FONT' | 'AUTO'; // Reflecting Figma's TypeStyle['lineHeightUnit']
  };
  letterSpacing: {
    value: number;
    unit: 'PIXELS'; // Reflecting Figma's TypeStyle['letterSpacingUnit']
  };
  figmaStyleId: string;
  description?: string;
}

/**
 * Represents the overall structure of data parsed from a Figma file.
 */
export interface ParsedFigmaData {
  fileName: string;
  lastModified: string;
  version: string;
  document: {
    id: string;
    name: string;
    type: string;
    childrenCount: number;
  };
  colorTokens: ColorToken[];
  textStyleTokens: TextStyleToken[];
}
