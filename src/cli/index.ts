import inquirer from 'inquirer';
import dotenv from 'dotenv';
import { parseFigmaFile } from '../figma/parser';
import { ParsedFigmaData } from '../types/FigmaTypes';
import { generateTailwindThemeObject } from '../generator/tailwindConfigGenerator';
import { TailwindThemeConfig } from '../types/GeneratorConfig';
import { generateNextJsProject } from '../generator/nextJsGenerator';
import fs from 'fs/promises';
import path from 'path';
import { ModuleManifest } from '../types/ModuleManifest';
import { validateModuleManifest } from './utils';
import { slugify } from '../utils/string';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ModuleHooks } from '../modules/hooks';

// Load environment variables from .env file
dotenv.config();

// Export utils for external use
export { validateModuleManifest };

export interface AvailableModule {
  id: string; // directory name
  manifest: ModuleManifest;
  hooks?: ModuleHooks;
}

/**
 * Reads the modules directory, validates manifests, and returns available modules.
 */
export async function getAvailableModules(): Promise<AvailableModule[]> {
  const modulesDir = path.join(__dirname, '..', 'modules');
  const availableModulesList: AvailableModule[] = [];
  
  try {
    const moduleDirs = await fs.readdir(modulesDir, { withFileTypes: true });
    
    for (const dirent of moduleDirs) {
      if (dirent.isDirectory()) {
        const manifestPath = path.join(modulesDir, dirent.name, 'manifest.json');
        
        try {
          const manifestContent = await fs.readFile(manifestPath, 'utf-8');
          const parsedManifest = JSON.parse(manifestContent);
          
          if (validateModuleManifest(parsedManifest, dirent.name)) {
            const moduleInfo: AvailableModule = { 
              id: dirent.name, 
              manifest: parsedManifest 
            };

            // Try to load hooks if they exist
            const hooksFilePath = path.join(modulesDir, dirent.name, 'hooks.ts');
            try {
              await fs.access(hooksFilePath);
              // Dynamically import the hooks module
              // Note: Adjust path for ES Modules vs CommonJS if necessary, or use a dynamic import wrapper
              const hooksModule: Record<string, any> = await import(hooksFilePath);
              const expectedHookExportName = `${dirent.name}ModuleHooks`; // e.g., blogModuleHooks
              
              // Check for named export first, then default export, then direct module export
              if (hooksModule && typeof hooksModule[expectedHookExportName] === 'function') {
                moduleInfo.hooks = hooksModule[expectedHookExportName] as ModuleHooks;
                console.log(`Successfully loaded hooks for module '${dirent.name}' via ${expectedHookExportName}.`);
              } else if (hooksModule && typeof hooksModule.default === 'function') {
                moduleInfo.hooks = hooksModule.default as ModuleHooks;
                console.log(`Successfully loaded default hooks for module '${dirent.name}'.`);
              } else if (hooksModule && typeof hooksModule === 'function') {
                // This case might be less common for structured hooks but included for completeness
                moduleInfo.hooks = hooksModule as ModuleHooks;
                console.log(`Successfully loaded module export as hooks for module '${dirent.name}'.`);
              } else if (hooksModule && hooksModule[expectedHookExportName]) {
                // If it's an object but not a function (e.g. an object containing hooks)
                moduleInfo.hooks = hooksModule[expectedHookExportName] as ModuleHooks;
                console.log(`Successfully loaded hooks (non-function) for module '${dirent.name}' via ${expectedHookExportName}.`);
              }
            } catch (hookError: unknown) {
              if (hookError instanceof Error && (hookError as NodeJS.ErrnoException).code === 'ENOENT') {
                // Hooks file doesn't exist - this is fine, hooks are optional
              } else {
                // Log other errors if hooks file exists but fails to load/parse
                console.warn(`Warning: Could not load hooks for module '${dirent.name}' from ${hooksFilePath}:`, hookError);
              }
            }
            
            availableModulesList.push(moduleInfo);
          } else {
            // validateModuleManifest already logs warnings for invalid manifests
            console.warn(`Skipping module '${dirent.name}' due to invalid manifest.`);
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`Warning: Could not read or parse manifest for module ${dirent.name}: ${errorMessage}`);
        }
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error reading modules directory:', errorMessage);
    // Potentially re-throw or handle more gracefully depending on desired CLI behavior
  }
  
  return availableModulesList;
}

async function runCli() {
  const argv = await yargs(hideBin(process.argv))
    .option('figmaId', { 
      alias: 'f', 
      type: 'string', 
      description: 'Figma File ID or URL' 
    })
    .option('projectName', { 
      alias: 'p', 
      type: 'string', 
      description: 'Name for the generated project' 
    })
    .option('outputDir', { 
      alias: 'o', 
      type: 'string', 
      description: 'Output directory for the project' 
    })
    .option('modules', { 
      alias: 'm', 
      type: 'string', 
      description: 'Comma-separated list of module IDs to include (e.g., "blog,auth")' 
    })
    .help()
    .alias('help', 'h')
    .argv;

  console.log('Welcome to the Project Generator CLI!');
  
  const figmaApiToken = process.env.FIGMA_API_TOKEN;
  if (!figmaApiToken) {
    console.error('Error: FIGMA_API_TOKEN not found in .env file. Please create a .env file with FIGMA_API_TOKEN=your_token.');
    process.exit(1);
  }

  try {
    // --- Get Figma File ID ---
    let figmaFileId: string;
    if (typeof argv.figmaId === 'string' && argv.figmaId.length > 0) {
      figmaFileId = argv.figmaId;
      // Extract file ID if it's a URL
      try {
        const url = new URL(figmaFileId);
        const pathParts = url.pathname.split('/');
        const fileIdIndex = pathParts.findIndex(part => part === 'file' || part === 'design');
        if (fileIdIndex !== -1 && pathParts[fileIdIndex + 1]) {
          figmaFileId = pathParts[fileIdIndex + 1];
        }
      } catch (_e) { 
        // Not a URL, assume it's already an ID
      }
      console.log(`Using Figma ID from command line: ${figmaFileId}`);
    } else {
      const figmaAnswer = await inquirer.prompt([{
        type: 'input',
        name: 'figmaFileId',
        message: 'Enter the Figma File ID (or URL):',
        validate: (input: string) => input.length > 0 || 'File ID cannot be empty.',
        filter: (input: string) => {
          try {
            const url = new URL(input);
            const pathParts = url.pathname.split('/');
            const fileIdIndex = pathParts.findIndex(part => part === 'file' || part === 'design');
            if (fileIdIndex !== -1 && pathParts[fileIdIndex + 1]) {
              return pathParts[fileIdIndex + 1];
            }
          } catch (_e) {
            // Not a URL, return as-is
          }
          return input;
        }
      }]);
      figmaFileId = (figmaAnswer as { figmaFileId: string }).figmaFileId;
    }

    // --- Parse Figma Data ---
    let parsedData: ParsedFigmaData;
    let tailwindTheme: TailwindThemeConfig = {};

    if (figmaFileId === 'test-skip-figma') {
      console.log('🧪 Test mode: Skipping Figma parsing (figmaId="test-skip-figma").');
      // Provide minimal mock data to allow the rest of the CLI to function
      parsedData = {
        fileName: 'mockFile.fig',
        lastModified: new Date().toISOString(),
        version: '1.0',
        document: {
          id: 'mock-doc-id',
          name: 'Mock Document',
          type: 'DOCUMENT',
          childrenCount: 0
        },
        colorTokens: [],
        textStyleTokens: []
      };
      // Tailwind theme will remain empty, which is fine for skipping generation
    } else {
      console.log('\nAttempting to parse Figma file...');
      parsedData = await parseFigmaFile(figmaFileId, figmaApiToken);
      console.log('Successfully parsed Figma data.');

      if (parsedData.colorTokens?.length || parsedData.textStyleTokens?.length) {
        console.log('\nGenerating Tailwind CSS theme configuration...');
        tailwindTheme = generateTailwindThemeObject(
          parsedData.colorTokens || [], 
          parsedData.textStyleTokens || []
        );
        console.log('Tailwind Theme Configuration generated.');
      }
    }

    // --- Load Available Modules ---
    const availableModules = await getAvailableModules();

    // --- Ask if user wants to generate project (only if not fully automated by args) ---
    let generateProjectDecision = true;
    if (!argv.projectName && !argv.modules && !argv.figmaId) { // Heuristic: if these are set, assume non-interactive mode
      const projectDecisionAnswer = await inquirer.prompt([{
        type: 'confirm',
        name: 'generateProject',
        message: 'Do you want to generate a Next.js project?',
        default: true
      }]);
      generateProjectDecision = (projectDecisionAnswer as { generateProject: boolean }).generateProject;
    }

    if (generateProjectDecision) {
      // --- Get Project Name ---
      let projectName: string;
      if (typeof argv.projectName === 'string' && argv.projectName.length > 0) {
        projectName = slugify(argv.projectName); // Ensure slugified if from args
        console.log(`Using project name from command line: ${projectName}`);
      } else {
        const defaultProjectName = slugify(parsedData.fileName || 'my-nextjs-app');
        const nameAnswer = await inquirer.prompt([{
          type: 'input',
          name: 'projectName',
          message: 'Enter the project name:',
          default: defaultProjectName,
          validate: (input: string) => input.length > 0 || 'Project name cannot be empty.',
          filter: (input: string) => slugify(input) // Slugify interactive input
        }]);
        projectName = (nameAnswer as { projectName: string }).projectName;
      }

      // --- Get Output Directory ---
      let outputDir: string;
      if (typeof argv.outputDir === 'string' && argv.outputDir.length > 0) {
        outputDir = argv.outputDir;
        console.log(`Using output directory from command line: ${outputDir}`);
      } else {
        const dirAnswer = await inquirer.prompt([{
          type: 'input',
          name: 'outputDir',
          message: 'Enter the output directory (e.g., . for current, my-projects):',
          default: '.'
        }]);
        outputDir = (dirAnswer as { outputDir: string }).outputDir;
      }

      // --- Select Modules with defaultEnabled support ---
      let selectedModuleIds: string[] = [];
      if (typeof argv.modules === 'string' && argv.modules.length > 0) {
        const idsFromArg = argv.modules.split(',').map(m => m.trim()).filter(m => m);
        // Validate module IDs from args against available modules
        selectedModuleIds = idsFromArg.filter(id => 
          availableModules.some(am => am.id === id)
        );
        const invalidModules = idsFromArg.filter(id => 
          !availableModules.some(am => am.id === id)
        );
        if (invalidModules.length > 0) {
          console.warn(`Warning: Invalid or not found modules from command line: ${invalidModules.join(', ')}`);
        }
        console.log(`Using modules from command line: ${selectedModuleIds.join(', ')}`);
      } else if (availableModules.length > 0) {
        const moduleAnswer = await inquirer.prompt([{
          type: 'checkbox',
          name: 'selectedModules',
          message: 'Select modules to include:',
          choices: availableModules.map((mod: AvailableModule) => ({
            name: `${mod.manifest.name} (${mod.id}) - ${mod.manifest.description}`,
            value: mod.id,
            checked: mod.manifest.defaultEnabled === true  // ✅ defaultEnabled support
          }))
        }]);
        selectedModuleIds = (moduleAnswer as { selectedModules: string[] }).selectedModules;
      } else {
        console.log('No available modules found to select.');
      }

      // --- Generate Project ---
      if (projectName && outputDir) {
        console.log(`\nGenerating Next.js project '${projectName}' in '${path.resolve(outputDir, projectName)}'...`);
        const modulesToInclude = availableModules.filter(mod => selectedModuleIds.includes(mod.id));
        
        await generateNextJsProject(
          parsedData,
          tailwindTheme,
          outputDir,
          projectName,
          modulesToInclude
        );
        
        const projectPath = outputDir === '.' ? projectName : path.join(outputDir, projectName);
        console.log(`\n✅ Next.js project '${projectName}' generated successfully!`);
        console.log(`To get started:\n\n  cd ${projectPath}\n  npm install\n  npm run dev\n`);
      } else {
        // This case should ideally not be reached if prompts/args are handled correctly
        console.error('Error: Project name or output directory was not properly set. Aborting generation.');
      }
    } else {
      console.log('Project generation skipped by user.');
    }

  } catch (error: any) {
    console.error('\nAn error occurred during CLI execution:');
    if (error.isTtyError) {
      // Inquirer specific error
      console.error('  Prompt rendering failed in the current environment. Try using command line arguments.');
    } else {
      // General error
      console.error(`  ${error.message}`);
    }
    // console.error(error); // Full error for debugging if needed
    process.exit(1);
  }
}

// Execute CLI if this file is run directly
if (require.main === module) {
  runCli().catch((error: any) => {
    // Catch unhandled promise rejections from runCli
    if (error && error.isTtyError) {
      console.error('CLI Error: Prompt rendering failed. Your terminal environment might not be supported.');
    } else if (error instanceof Error) {
      console.error('CLI Error:', error.message);
    } else {
      console.error('CLI Error:', error);
    }
    process.exit(1);
  });
}
