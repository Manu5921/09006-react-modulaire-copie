/**
 * Defines the structure for the Tailwind CSS theme configuration object
 * that is generated from Figma tokens.
 */
export interface TailwindThemeConfig {
  colors?: { [key: string]: string };
  fontFamily?: { [key: string]: string[] | string };
  fontSize?: { [key: string]: string | [string, { lineHeight?: string; letterSpacing?: string }] };
  lineHeight?: { [key: string]: string };
  letterSpacing?: { [key: string]: string };
  fontWeight?: { [key: string]: string };
  // Add other Tailwind theme sections as needed, e.g.:
  // spacing?: { [key: string]: string };
  // borderRadius?: { [key: string]: string };
}

// You can add other generator-related configurations here in the future.
// For example, settings for the Next.js project structure, default dependencies, etc.
