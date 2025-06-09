import { generateTailwindThemeObject } from '../tailwindConfigGenerator';
import { ColorToken, TextStyleToken } from '../../types/FigmaTypes';

describe('generateTailwindThemeObject', () => {
  const dummyFigmaStyleId = 'figma-style-id-123'; // Reusable dummy ID

  test('should return an empty theme for no tokens', () => {
    const theme = generateTailwindThemeObject([], []);
    expect(theme).toEqual({});
  });

  // --- Color Token Tests ---
  describe('Color Tokens', () => {
    test('should process basic color tokens', () => {
      const colorTokens: ColorToken[] = [
        { name: 'Primary Blue', value: '#007bff', figmaStyleId: dummyFigmaStyleId },
        { name: 'Accent Green', value: '#28a745', figmaStyleId: dummyFigmaStyleId },
      ];
      const theme = generateTailwindThemeObject(colorTokens, []);
      expect(theme.colors).toEqual({
        'primary-blue': '#007bff',
        'accent-green': '#28a745',
      });
    });

    test('should slugify color names', () => {
      const colorTokens: ColorToken[] = [
        { name: 'Primary Brand Color (Dark)', value: '#0056b3', figmaStyleId: dummyFigmaStyleId },
      ];
      const theme = generateTailwindThemeObject(colorTokens, []);
      expect(theme.colors).toEqual({
        'primary-brand-color-dark': '#0056b3',
      });
    });

    test('should generate value-based names for generic or problematic names', () => {
      const colorTokens: ColorToken[] = [
        { name: 'Color', value: '#FF0000', figmaStyleId: dummyFigmaStyleId },
        { name: '#FFF', value: '#FFFFFF', figmaStyleId: dummyFigmaStyleId },
        { name: 'bg', value: '#00FF00', figmaStyleId: dummyFigmaStyleId },
        { name: 'Primary', value: '#0000FF', figmaStyleId: dummyFigmaStyleId }
      ];
      const theme = generateTailwindThemeObject(colorTokens, []);
      expect(theme.colors).toEqual({
        'color-ff0000': '#FF0000',
        'color-ffffff': '#FFFFFF',
        'color-00ff00': '#00FF00',
        'color-0000ff': '#0000FF',
      });
    });

    test('should handle color name clashes by appending suffix', () => {
      const colorTokens: ColorToken[] = [
        { name: 'Brand Color', value: '#FFA500', figmaStyleId: dummyFigmaStyleId },
        { name: 'brand-color', value: '#FFC0CB', figmaStyleId: dummyFigmaStyleId },
      ];
      const theme = generateTailwindThemeObject(colorTokens, []);
      expect(theme.colors).toEqual({
        'brand-color': '#FFA500',
        'brand-color-1': '#FFC0CB',
      });
    });
  });

  // --- Text Style Token Tests ---
  describe('TextStyle Tokens', () => {
    test('should process basic font families', () => {
      const textStyleTokens: TextStyleToken[] = [
        { name: 'Main Font', fontFamily: 'Inter', fontSize: 16, fontWeight: 400, lineHeight: { value: 20, unit: 'PIXELS'}, letterSpacing: { value: 0, unit: 'PIXELS'}, figmaStyleId: dummyFigmaStyleId },
        { name: 'Secondary Font', fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: { value: 20, unit: 'PIXELS'}, letterSpacing: { value: 0, unit: 'PIXELS'}, figmaStyleId: dummyFigmaStyleId },
      ];
      const theme = generateTailwindThemeObject([], textStyleTokens);
      expect(theme.fontFamily).toEqual({
        'inter': ['Inter'],
        'roboto-sans-serif': ['Roboto', 'sans-serif'],
      });
    });

    test('should process font sizes (simple and complex)', () => {
      const textStyleTokens: TextStyleToken[] = [
        { name: 'Body Text', fontFamily: 'Arial', fontSize: 16, fontWeight: 400, lineHeight: { value: 24, unit: 'PIXELS' }, letterSpacing: { value: 0.5, unit: 'PIXELS'}, figmaStyleId: dummyFigmaStyleId },
        { name: 'Small Info', fontFamily: 'Arial', fontSize: 12, fontWeight: 400, lineHeight: { value: 150, unit: 'PERCENT_FONT'}, letterSpacing: { value: 0, unit: 'PIXELS'}, figmaStyleId: dummyFigmaStyleId },
        { name: 'Tiny Legal', fontFamily: 'Arial', fontSize: 10, fontWeight: 400, lineHeight: {value: 150, unit: 'PERCENT_FONT'}, letterSpacing: { value: 0, unit: 'PIXELS'}, figmaStyleId: dummyFigmaStyleId }
      ];

      const theme = generateTailwindThemeObject([], textStyleTokens);
      const bodyTextKey = Object.keys(theme.fontSize!).find(k => k.includes('arial-16px') && k.includes('24px') && k.includes('0dot5px'));
      expect(bodyTextKey).toBeDefined();
      expect(theme.fontSize![bodyTextKey!]).toEqual(['16px', { lineHeight: '24px', letterSpacing: '0.5px' }]);

      const smallInfoKey = Object.keys(theme.fontSize!).find(k => k.includes('arial-12px') && k.includes('150p'));
      expect(smallInfoKey).toBeDefined();
      expect(theme.fontSize![smallInfoKey!]).toEqual(['12px', { lineHeight: '1.5' }]);

      const tinyLegalKey = Object.keys(theme.fontSize!).find(k => k.includes('arial-10px') && k.includes('150p'));
      expect(tinyLegalKey).toBeDefined();
      expect(theme.fontSize![tinyLegalKey!]).toEqual(['10px', { lineHeight: '1.5' }]);
    });

    test('should generate descriptive names for font sizes if original is generic', () => {
      const textStyleTokens: TextStyleToken[] = [
        { name: 'H1', fontFamily: 'Georgia', fontSize: 32, fontWeight: 700, lineHeight: { value: 120, unit: 'PERCENT_FONT' }, letterSpacing: { value: 0, unit: 'PIXELS'}, figmaStyleId: dummyFigmaStyleId },
      ];
      const theme = generateTailwindThemeObject([], textStyleTokens);
      const generatedName = Object.keys(theme.fontSize!)[0];
      expect(generatedName).toContain('georgia');
      expect(generatedName).toContain('32px');
      expect(generatedName).toContain('700');
      expect(generatedName).toContain('120p');
      expect(theme.fontSize![generatedName]).toEqual(['32px', { lineHeight: '1.2' }]);
    });

    test('should process font weights', () => {
      const textStyleTokens: TextStyleToken[] = [
        { name: 'Normal text', fontFamily: 'Helvetica', fontSize: 16, fontWeight: 400, lineHeight: { value: 20, unit: 'PIXELS'}, letterSpacing: { value: 0, unit: 'PIXELS'}, figmaStyleId: dummyFigmaStyleId },
        { name: 'Bold title', fontFamily: 'Helvetica', fontSize: 24, fontWeight: 700, lineHeight: { value: 30, unit: 'PIXELS'}, letterSpacing: { value: 0, unit: 'PIXELS'}, figmaStyleId: dummyFigmaStyleId },
      ];
      const theme = generateTailwindThemeObject([], textStyleTokens);
      expect(theme.fontWeight).toEqual({
        'helvetica-400': '400',
        'normal': '400',
        'helvetica-700': '700',
        'bold': '700',
      });
    });
  });

  // --- Mixed Token Tests ---
  describe('Mixed Tokens', () => {
    test('should process both color and text style tokens correctly', () => {
      const colorTokens: ColorToken[] = [
        { name: 'Canvas Background', value: '#F0F0F0', figmaStyleId: dummyFigmaStyleId },
      ];
      const textStyleTokens: TextStyleToken[] = [
        { name: 'Default Body', fontFamily: 'Lato', fontSize: 15, fontWeight: 400, lineHeight: { value: 160, unit: 'PERCENT_FONT'}, letterSpacing: { value: 0.2, unit: 'PIXELS'}, figmaStyleId: dummyFigmaStyleId },
      ];
      const theme = generateTailwindThemeObject(colorTokens, textStyleTokens);

      expect(theme.colors).toEqual({
        'canvas-background': '#F0F0F0',
      });
      // Check for the generated descriptive key, not 'default-body'
      const expectedKey = 'lato-15px-160p-0dot2px'; // Based on current descriptive name logic
      expect(theme.fontSize).toHaveProperty(expectedKey);
      expect(theme.fontSize![expectedKey]).toEqual(['15px', { lineHeight: '1.6', letterSpacing: '0.2px' }]);
      expect(theme.fontFamily).toEqual({ 'lato': ['Lato'] });
      expect(theme.fontWeight).toEqual({ 'lato-400': '400', 'normal': '400' });
    });
  });
});
