import { ParsedFigmaData } from '../types/FigmaTypes';
// import { NextJsGeneratorConfig } from '../types/GeneratorConfig'; // Removed as it's not defined
import { AvailableModule } from '../cli'; // Assuming AvailableModule is exported from cli/index.ts

export interface InstallContext {
  projectPath: string;
  projectName: string;
  selectedModules: AvailableModule[]; // Modules selected by the user
  // Potentially other global configurations or parsed Figma data if needed early
}

export interface GenerationContext {
  projectPath: string;
  projectName: string;
  parsedFigmaData?: ParsedFigmaData; // Optional, as not all generation steps might have it
  // nextJsConfig?: NextJsGeneratorConfig; // Removed - to be defined later if needed
  selectedModules: AvailableModule[];
  // other relevant data like generated tailwind theme, etc.
}

export interface ModuleHooks {
  /**
   * Called before any files for the module are copied or processed during initial project setup.
   * Useful for pre-flight checks or modifying the project context.
   */
  beforeInstall?: (context: InstallContext) => Promise<void>;

  /**
   * Called after all files for the module have been copied and basic project structure is in place.
   * Useful for tasks like updating package.json, adding .env variables, or running setup scripts.
   */
  afterInstall?: (context: InstallContext) => Promise<void>;

  /**
   * Called before the main generation logic for a specific part of the project (e.g., before Next.js files are written).
   * This might be more granular in the future.
   */
  beforeGeneration?: (context: GenerationContext) => Promise<void>;

  /**
   * Called after the main generation logic for a specific part of the project has completed.
   * Useful for post-processing, cleanup, or logging.
   */
  afterGeneration?: (context: GenerationContext) => Promise<void>;
}
