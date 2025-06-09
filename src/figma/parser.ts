import { Client, Node as FigmaNode, TypeStyle, Paint, Color } from 'figma-js';
import { ColorToken, TextStyleToken, ParsedFigmaData } from '../types/FigmaTypes';

// Helper function to convert Figma's 0-1 RGBA to #RRGGBB hex
function figmaColorToHex(figmaColor: Color): string {
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(figmaColor.r)}${toHex(figmaColor.g)}${toHex(figmaColor.b)}`.toUpperCase();
}

/**
 * Traverses the Figma node tree recursively to find all styleable nodes (TEXT, RECTANGLE, etc.)
 * and extracts their styles if they are not already part of published styles.
 * This is particularly useful for files that don't use published styles extensively.
 */
const traverseNode = (node: FigmaNode, collectedColors: Map<string, ColorToken>, collectedTextStyles: Map<string, TextStyleToken>) => {
  // Extract colors from fills
  if ('fills' in node && Array.isArray(node.fills)) {
    for (const paint of node.fills as Paint[]) {
      if (paint.type === 'SOLID' && paint.color && paint.visible !== false) {
        const hexValue = figmaColorToHex(paint.color);
        if (!collectedColors.has(hexValue)) {
          collectedColors.set(hexValue, {
            // Attempt to use layer name, fallback to hex. FigmaStyleId and description are N/A here.
            name: node.name && !node.name.startsWith('Rectangle') && !node.name.startsWith('Frame') ? node.name : `Color ${hexValue.toUpperCase()}`,
            value: hexValue,
            figmaStyleId: '', // Not applicable when scanning nodes directly
            // description: node.name, // Could use layer name as description if useful
          });
        }
      }
    }
  }

  // Extract text styles
  if (node.type === 'TEXT' && node.style) {
    const ts = node.style;
    let lineHeightValue = 0;
    let lineHeightUnit: TextStyleToken['lineHeight']['unit'] = 'AUTO';

    if (ts.lineHeightUnit === 'PIXELS') {
      lineHeightValue = ts.lineHeightPx;
      lineHeightUnit = 'PIXELS';
    } else if (ts.lineHeightUnit === 'FONT_SIZE_%') {
      lineHeightValue = ts.lineHeightPercentFontSize || 0;
      lineHeightUnit = 'PERCENT_FONT';
    } else {
      lineHeightValue = ts.lineHeightPx; // Default or AUTO
      lineHeightUnit = 'AUTO';
    }

    const styleKey = `${ts.fontFamily}-${ts.fontWeight}-${ts.fontSize}-${lineHeightValue}${lineHeightUnit}-${ts.letterSpacing}`;
    if (!collectedTextStyles.has(styleKey)) {
      collectedTextStyles.set(styleKey, {
        name: node.name || `Text Style ${ts.fontFamily} ${ts.fontSize}px`,
        fontFamily: ts.fontFamily,
        fontWeight: ts.fontWeight,
        fontSize: ts.fontSize,
        lineHeight: { value: lineHeightValue, unit: lineHeightUnit },
        letterSpacing: { value: ts.letterSpacing, unit: 'PIXELS' }, // Assuming pixels from API
        figmaStyleId: '', // Not applicable
        // description: node.name,
      });
    }
  }

  // Recursively traverse children
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children as FigmaNode[]) {
      traverseNode(child, collectedColors, collectedTextStyles);
    }
  }
};

export const parseFigmaFile = async (fileId: string, apiToken: string): Promise<ParsedFigmaData> => {
  if (!fileId) {
    throw new Error('Figma file ID is required.');
  }
  if (!apiToken) {
    throw new Error('Figma API token is required.');
  }

  console.log(`Fetching Figma file: ${fileId}...`);

  const client = Client({
    personalAccessToken: apiToken,
  });

  try {
    // Fetch the full document structure
    const { data: fileData } = await client.file(fileId);
    console.log(`Successfully fetched Figma file: "${fileData.name}"`);

    const colorTokenMap = new Map<string, ColorToken>();
    const textStyleTokenMap = new Map<string, TextStyleToken>();

    // Start traversal from the document node's children (pages)
    if (fileData.document && fileData.document.children) {
      for (const pageNode of fileData.document.children) {
        traverseNode(pageNode, colorTokenMap, textStyleTokenMap);
      }
    }

    const colorTokens = Array.from(colorTokenMap.values());
    const textStyleTokens = Array.from(textStyleTokenMap.values());

    console.log(`Found ${colorTokens.length} unique color tokens:`);
    colorTokens.forEach(t => console.log(`  - Color: ${t.name}: ${t.value}${t.description ? ` (${t.description})` : ''}`));
    console.log(`Found ${textStyleTokens.length} unique text style tokens:`);
    textStyleTokens.forEach(t => {
      const lhUnitDisplay = t.lineHeight.unit === 'PERCENT_FONT' ? '%' : (t.lineHeight.unit === 'PIXELS' ? 'px' : ' auto');
      console.log(`  - Text: ${t.name}: ${t.fontFamily} ${t.fontWeight} ${t.fontSize}px, LH ${t.lineHeight.value}${lhUnitDisplay} LS ${t.letterSpacing.value}px${t.description ? ` (${t.description})` : ''}`);
    });

    return {
      fileName: fileData.name,
      lastModified: fileData.lastModified,
      version: fileData.version,
      document: {
        id: fileData.document.id,
        name: fileData.document.name,
        type: fileData.document.type,
        childrenCount: fileData.document.children?.length || 0,
      },
      colorTokens,
      textStyleTokens,
    };
  } catch (error: unknown) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error parsing Figma file:', errorMessage);
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const errResponse = (error as { response?: { data?: unknown } }).response;
      if (errResponse && typeof errResponse === 'object' && 'data' in errResponse && errResponse.data) {
        console.error('Figma API Error Details:', errResponse.data);
      }
    }
    throw new Error(`Failed to parse Figma file: ${errorMessage}`);
  }
};

// Placeholder for a function to test the parser (optional)
// async function testParser() {
//   const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID; // Replace with your Figma File ID or use env var
//   const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN; // Replace with your Figma API Token or use env var

//   if (!FIGMA_FILE_ID || !FIGMA_API_TOKEN) {
//     console.error('Please provide FIGMA_FILE_ID and FIGMA_API_TOKEN environment variables or update the script.');
//     return;
//   }

//   try {
//     const parsedData = await parseFigmaFile(FIGMA_FILE_ID, FIGMA_API_TOKEN);
//     console.log('Parsed Figma Data:', JSON.stringify(parsedData, null, 2));
//   } catch (error) {
//     // Error is already logged in parseFigmaFile
//   }
// }

// // Uncomment to run the test (ensure you have set up FIGMA_FILE_ID and FIGMA_API_TOKEN)
// // testParser();

