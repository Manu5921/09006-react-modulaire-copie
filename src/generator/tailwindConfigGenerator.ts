import { ColorToken, TextStyleToken } from '../types/FigmaTypes';
import { slugify } from '../utils/string';

import { TailwindThemeConfig } from '../types/GeneratorConfig';

export const generateTailwindThemeObject = (
  colorTokens: ColorToken[],
  textStyleTokens: TextStyleToken[],
): TailwindThemeConfig => {
  const theme: TailwindThemeConfig = {};

  // Process Colors
  if (colorTokens.length > 0) {
    theme.colors = {};
    colorTokens.forEach(token => {
      // Use slugified name, ensure it's not empty, fallback to a generic name if needed
      let colorName = slugify(token.name);
      // Regex for generic color names (e.g., 'Color', 'Fill', '#FFF', 'bg-blue', 'Primary Color') or hex-like slugs
      const genericColorPatterns = /^(color|fill|background|bg|clr|primary|secondary|accent|neutral|brand|#?[0-9a-f]{3,8})$/i;
      const isPotentiallyGeneric = 
        genericColorPatterns.test(token.name.toLowerCase().replace(/\s+/g, '')) || 
        genericColorPatterns.test(colorName.replace(/-/g, ''));

      if (colorName === 'default-token' || isPotentiallyGeneric || colorName.length <= 2 || /^tw-/.test(colorName)) {
        // If slug is default, original name seems generic, slug is too short, or it's a fallback from slugify itself,
        // create a more specific name from the color value.
        const valueBasedName = `color-${token.value.replace('#', '')}`;
        const newColorName = slugify(valueBasedName);
        // Only use the new name if it's different and not 'default-token'
        if (newColorName !== 'default-token' && newColorName !== colorName) {
          colorName = newColorName;
        }
      }
      // Prevent overwriting if names clash after slugification, though Map in parser should prevent this for values
      if (theme.colors && !theme.colors[colorName]) {
        theme.colors[colorName] = token.value;
      } else if (theme.colors) {
        // Handle potential clash by appending a suffix (simple strategy)
        let i = 1;
        while(theme.colors[`${colorName}-${i}`]) {
          i++;
        }
        theme.colors[`${colorName}-${i}`] = token.value;
      }
    });
  }

  // Process Text Styles for Font Families and Font Sizes
  const fontFamilies: { [key: string]: string[] } = {};
  const fontSizes: { [key: string]: string | [string, { lineHeight?: string; letterSpacing?: string }] } = {};
  const fontWeights: { [key: string]: string } = {};

  if (textStyleTokens.length > 0) {
    textStyleTokens.forEach(token => {
      // Font Family
      const fontFamilySlug = slugify(token.fontFamily);
      if (fontFamilySlug && !fontFamilies[fontFamilySlug]) {
        // Tailwind expects an array of strings or a single string for font families
        // For simplicity, we'll assume a single font first. If it contains commas, split it.
        fontFamilies[fontFamilySlug] = token.fontFamily.includes(',') ? token.fontFamily.split(',').map(f => f.trim()) : [token.fontFamily];
      }

      // Font Size
      // Naming strategy: use slugified token name if available and descriptive, else a generic one
      let fontSizeName = slugify(token.name);
      const genericFontSizePatterns = /^(font|text|style|text-style|type|typography|h\d|p\d*|body\d*|caption\d*|label\d*|default-token|heading\d*|paragraph\d*|display\d*|title\d*)$/i;
      const isPotentiallyGeneric = 
        genericFontSizePatterns.test(token.name.toLowerCase().replace(/\s+/g, '')) || 
        genericFontSizePatterns.test(fontSizeName.replace(/-/g,'')) || 
        fontSizeName.length < 3;

      if (fontSizeName === 'default-token' || isPotentiallyGeneric || /^tw-/.test(fontSizeName)) {
        // Construct a more descriptive name if original is generic or slugification failed
        let descriptiveName = fontFamilySlug;
        descriptiveName += `-${token.fontSize}px`;
        if (token.fontWeight) {
          // Append fontWeight if it's a meaningful value (not default like 400)
          if (token.fontWeight !== 400) { 
            descriptiveName += `-${token.fontWeight}`;
          }
        }
        if (token.lineHeight && typeof token.lineHeight.value === 'number') {
          let lineHeightStr = '';
          if (token.lineHeight.unit === 'PIXELS') {
            lineHeightStr = `${token.lineHeight.value}px`;
          } else if (token.lineHeight.unit === 'PERCENT_FONT') {
            // For naming, represent percentage as 'p' suffix, e.g., 120p for 120%
            lineHeightStr = `${token.lineHeight.value}p`; 
          } else if (token.lineHeight.unit === 'AUTO') {
            lineHeightStr = 'auto';
          }

          if (lineHeightStr && lineHeightStr !== 'auto' && token.lineHeight.value !== 0) { // Add line height if specified, not auto, and not zero
             descriptiveName += `-${lineHeightStr.replace(/\s+|px/g, '')}`;
          }
        }
        const newFontSizeName = slugify(descriptiveName);
        if (newFontSizeName !== 'default-token' && newFontSizeName !== fontSizeName) {
            fontSizeName = newFontSizeName;
        }
      }
      // Final slugify, in case the descriptive name still needs it (e.g. if fontFamilySlug had issues)
      fontSizeName = slugify(fontSizeName);
      
      if (!fontSizes[fontSizeName]) {
        let tailwindLineHeight: string | undefined = undefined;
        if (token.lineHeight && typeof token.lineHeight.value === 'number' && token.lineHeight.value !== 0) {
          if (token.lineHeight.unit === 'PIXELS') {
            tailwindLineHeight = `${token.lineHeight.value}px`;
          } else if (token.lineHeight.unit === 'PERCENT_FONT') {
            tailwindLineHeight = `${token.lineHeight.value / 100}`;
          } else if (token.lineHeight.unit === 'AUTO') {
            tailwindLineHeight = 'normal';
          }
        }

        let tailwindLetterSpacing: string | undefined = undefined;
        if (token.letterSpacing && typeof token.letterSpacing.value === 'number' && token.letterSpacing.value !== 0) {
          // Assuming letterSpacing unit is PIXELS as per TextStyleToken, convert to em for better scalability in Tailwind if preferred, or use px.
          // For now, using px as it's directly from Figma.
          tailwindLetterSpacing = `${token.letterSpacing.value}px`;
        }

        const hasLineHeight = tailwindLineHeight && tailwindLineHeight !== 'normal';
        const hasLetterSpacing = tailwindLetterSpacing;

        if (hasLineHeight || hasLetterSpacing) {
          const typographyDetails: { lineHeight?: string; letterSpacing?: string } = {};
          if (hasLineHeight) typographyDetails.lineHeight = tailwindLineHeight;
          if (hasLetterSpacing) typographyDetails.letterSpacing = tailwindLetterSpacing;
          fontSizes[fontSizeName] = [`${token.fontSize}px`, typographyDetails];
        } else {
          fontSizes[fontSizeName] = `${token.fontSize}px`;
        }
      }

      // Process FontWeight
      if (token.fontWeight) {
        // Use a slugified version of the text style name for unique font weight keys if needed,
        // or map to standard weight names.
        // For simplicity, we'll use the numeric value as key for now, Tailwind accepts this.
        // A more robust approach could map to Tailwind's named weights (thin, light, normal, bold, etc.)
        const weightKey = slugify(`${fontFamilySlug}-${token.fontWeight}`); // e.g., inter-700
        if (!fontWeights[weightKey]) {
          fontWeights[weightKey] = String(token.fontWeight);
        }
        // Also, consider adding generic weight names if the numeric value matches standard ones.
        const standardWeights: {[key: number]: string} = {100: 'thin', 200: 'extralight', 300: 'light', 400: 'normal', 500: 'medium', 600: 'semibold', 700: 'bold', 800: 'extrabold', 900: 'black'};
        if (standardWeights[token.fontWeight] && !fontWeights[standardWeights[token.fontWeight]]) {
            fontWeights[standardWeights[token.fontWeight]] = String(token.fontWeight);
        }
      }
    });

    if (Object.keys(fontFamilies).length > 0) {
      theme.fontFamily = fontFamilies;
    }
    if (Object.keys(fontSizes).length > 0) {
      theme.fontSize = fontSizes;
    }
    if (Object.keys(fontWeights).length > 0) {
      theme.fontWeight = fontWeights;
    }
  }

  return theme;
};
