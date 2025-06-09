import { ParsedFigmaData } from '../types/FigmaTypes';
import { TailwindThemeConfig } from '../types/GeneratorConfig';
import { AvailableModule } from '../cli'; // Assuming AvailableModule is exported from cli/index.ts
import { InstallContext } from '../modules/hooks';
import fs from 'fs/promises';
import path from 'path';

import { ensureDirectoryExists } from '../utils/file';
import { DEFAULT_PROJECT_CONFIG } from '../config/defaults';

// TODO: Define more specific types for project configuration if needed

// Helper function to recursively copy a directory
async function copyDirectoryRecursive(source: string, target: string) {
  await ensureDirectoryExists(target);
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

export async function copyModuleAssets(
  moduleSourceBasePath: string,
  moduleId: string,
  projectPath: string,
  assetType: 'components' | 'services' | 'hooks',
  assetPathsInManifest: string[], // e.g., ["components/LoginForm.tsx"] or ["MyHook.tsx"]
  targetBaseSubDir: string // e.g., path.join('components', 'modules') or 'services' or 'hooks'
) {
  if (!assetPathsInManifest || assetPathsInManifest.length === 0) {
    return;
  }
  console.log(`    Copying ${assetType} for module ${moduleId}...`);

  // Determine the final target directory for this module's assets of this type
  // e.g., projectPath/components/modules/auth or projectPath/services/auth
  const targetModuleSpecificDir = path.join(projectPath, targetBaseSubDir, moduleId);
  // For components, we use a 'modules' subdirectory to group them, e.g., components/modules/auth
  // For services and hooks, they go directly under services/auth or hooks/auth (or services/modules/auth if preferred, adjust targetBaseSubDir)
  // Current plan: components/modules/auth, services/auth, hooks/auth

  for (const assetPathInManifest of assetPathsInManifest) {
    // assetPathInManifest is like "components/LoginForm.tsx" or "services/AuthService.ts" or just "MyHook.tsx"
    const sourceFilePath = path.join(moduleSourceBasePath, assetPathInManifest);

    // Determine the relative path for the destination, stripping the base type directory if present
    // e.g., "LoginForm.tsx" from "components/LoginForm.tsx"
    // e.g., "subdir/MyComponent.tsx" from "components/subdir/MyComponent.tsx"
    // e.g., "MyHook.tsx" remains "MyHook.tsx"
    let relativeDestPath = assetPathInManifest;
    const typeSpecificDirPrefix = assetType + path.sep; // e.g. "components/"
    if (assetPathInManifest.startsWith(typeSpecificDirPrefix)) {
      relativeDestPath = assetPathInManifest.substring(typeSpecificDirPrefix.length);
    }
    
    const destinationFilePath = path.join(targetModuleSpecificDir, relativeDestPath);

    try {
      await fs.access(sourceFilePath); // Check if file exists and is accessible
      await ensureDirectoryExists(path.dirname(destinationFilePath));
      await fs.copyFile(sourceFilePath, destinationFilePath);
      console.log(`      Copied ${assetType}: ${assetPathInManifest} to ${path.relative(projectPath, destinationFilePath)}`);

      // If it's a component, rewrite internal imports for data/types
      if (assetType === 'components') {
        let componentContent = await fs.readFile(destinationFilePath, 'utf-8');
        const originalComponentContent = componentContent;

        // Rewrite ../data/... to ../../../lib/modules/[moduleId]/data/...
        const dataImportRegexComponent = /(from\s+['"])(\.\.\/data\/)([^'"]+)(['"])/g;
        const dataReplacementComponent = `$1../../../lib/modules/${moduleId}/data/$3$4`;
        componentContent = componentContent.replace(dataImportRegexComponent, dataReplacementComponent);

        // Rewrite ../types/... to ../../../lib/modules/[moduleId]/types/...
        const typesImportRegexComponent = /(from\s+['"])(\.\.\/types\/)([^'"]+)(['"])/g;
        const typesReplacementComponent = `$1../../../lib/modules/${moduleId}/types/$3$4`;
        componentContent = componentContent.replace(typesImportRegexComponent, typesReplacementComponent);

        if (componentContent !== originalComponentContent) {
          await fs.writeFile(destinationFilePath, componentContent, 'utf-8');
          console.log(`        Rewrote import paths in ${path.relative(projectPath, destinationFilePath)}`);
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === 'ENOENT' && nodeError.path === sourceFilePath) {
          console.warn(`      Warning: Asset file not found: ${sourceFilePath}. Skipping copy of ${assetType} '${assetPathInManifest}' for module ${moduleId}.`);
        } else {
          console.error(`      Error copying ${assetType} '${assetPathInManifest}' for module ${moduleId} from ${sourceFilePath} to ${destinationFilePath}:`, error);
        }
      } else {
        console.error(`      An unexpected error occurred while copying ${assetType} '${assetPathInManifest}' for module ${moduleId} from ${sourceFilePath} to ${destinationFilePath}:`, error);
      }
    }
  }
}

async function copyModuleDataOrTypes(
  moduleSourceBasePath: string, 
  moduleId: string,             
  projectPath: string,          
  dataType: 'data' | 'types',  
  filesInManifest: string[]     
) {
  if (!filesInManifest || filesInManifest.length === 0) {
    return;
  }
  console.log(`    Copying ${dataType} files for module ${moduleId}...`);

  const targetModuleSpecificDir = path.join(projectPath, 'lib', 'modules', moduleId, dataType);

  for (const fileRelativePathInManifest of filesInManifest) {
    const sourceFilePath = path.join(moduleSourceBasePath, fileRelativePathInManifest);

    let relativeDestPath = fileRelativePathInManifest;
    const typeSpecificDirPrefix = dataType + path.sep;
    if (fileRelativePathInManifest.startsWith(typeSpecificDirPrefix)) {
      relativeDestPath = fileRelativePathInManifest.substring(typeSpecificDirPrefix.length);
    }
    
    const destinationFilePath = path.join(targetModuleSpecificDir, relativeDestPath);

    try {
      await fs.access(sourceFilePath);
      await ensureDirectoryExists(path.dirname(destinationFilePath));
      await fs.copyFile(sourceFilePath, destinationFilePath);
      console.log(`      Copied ${dataType} file: ${fileRelativePathInManifest} to ${path.relative(projectPath, destinationFilePath)}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === 'ENOENT' && nodeError.path === sourceFilePath) {
          console.warn(`      Warning: ${dataType} file not found: ${sourceFilePath}. Skipping copy.`);
        } else {
          console.error(`      Error copying ${dataType} file '${fileRelativePathInManifest}' for module ${moduleId}:`, error);
        }
      } else {
        console.error(`      An unexpected error occurred while copying ${dataType} file '${fileRelativePathInManifest}' for module ${moduleId}:`, error);
      }
    }
  }
}

/**
 * Generates a Next.js project structure with Tailwind CSS integration.
 * @param parsedFigmaData - The parsed data from Figma.
 * @param tailwindTheme - The generated Tailwind theme configuration.
 * @param outputBaseDir - The base directory where the project folder will be created.
 * @param projectName - The name of the project, used for the project folder and package.json.
 */
export const generateNextJsProject = async (
  parsedFigmaData: ParsedFigmaData, // Retained for future use
  tailwindTheme: TailwindThemeConfig,
  outputBaseDir: string,
  projectName: string,
  selectedModules: AvailableModule[] = []
): Promise<void> => {
  const projectPath = path.join(outputBaseDir, projectName);

  const installContext: InstallContext = {
    projectPath,
    projectName,
    selectedModules,
  };

  try {
    // --- Call beforeInstall hooks ---    
    console.log('\n🔧 Running beforeInstall hooks...');
    for (const mod of selectedModules) {
      if (mod.hooks && typeof mod.hooks.beforeInstall === 'function') {
        console.log(`   - Running beforeInstall for ${mod.id}...`);
        await mod.hooks.beforeInstall(installContext);
      }
    }
    console.log('✅ beforeInstall hooks completed.');
    // --- 1. Create base project directory & subdirectories ---
    await ensureDirectoryExists(projectPath);
    const appDir = path.join(projectPath, 'app');
    const publicDir = path.join(projectPath, 'public');
    await Promise.all([
      ensureDirectoryExists(appDir),
      ensureDirectoryExists(publicDir),
      ensureDirectoryExists(path.join(projectPath, 'components', 'modules')),
      ensureDirectoryExists(path.join(projectPath, 'services')),
      ensureDirectoryExists(path.join(projectPath, 'hooks')),
    ]);
    console.log(`Created project structure in: ${projectPath}`);

    // --- 2. Generate package.json ---
    const packageJsonContent: Record<string, any> = {
      name: projectName,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
      dependencies: {
        next: `^${DEFAULT_PROJECT_CONFIG.nextjs.version}`,
        react: '^18',
        'react-dom': '^18',
      },
      devDependencies: {
        typescript: '^5',
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
        tailwindcss: '^3.4.1',
        postcss: '^8',
        autoprefixer: '^10',
        eslint: '^8',
        'eslint-config-next': DEFAULT_PROJECT_CONFIG.nextjs.version,
      },
    };
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJsonContent, null, 2)
    );
    console.log('Generated package.json');

    // --- 3. Generate tailwind.config.js ---
    const tailwindConfigContent = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: ${JSON.stringify(tailwindTheme, null, 2)},
  },
  plugins: [],
};
`;
    await fs.writeFile(
      path.join(projectPath, 'tailwind.config.js'),
      tailwindConfigContent
    );
    console.log('Generated tailwind.config.js');

    // --- 4. Generate postcss.config.js ---
    const postcssConfigContent = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
    await fs.writeFile(
      path.join(projectPath, 'postcss.config.js'),
      postcssConfigContent
    );
    console.log('Generated postcss.config.js');

    // --- 5. Generate app/globals.css ---
    const globalsCssContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  /* Add global styles here */
}
`;
    await fs.writeFile(path.join(appDir, 'globals.css'), globalsCssContent);
    console.log('Generated app/globals.css');

    // --- 6. Generate app/layout.tsx (initial) ---
    let initialLayoutTsxContent = `
import type { Metadata } from 'next';
import './globals.css';
${selectedModules.some(mod => mod.id === 'auth') ? "import { SessionProvider } from 'next-auth/react';" : ""}

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Generated by Next.js Modular Project Generator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Navigation will be injected here */}
        ${selectedModules.some(mod => mod.id === 'auth') ? "<SessionProvider>{children}</SessionProvider>" : "{children}"}
      </body>
    </html>
  );
}
`;
    await fs.writeFile(path.join(appDir, 'layout.tsx'), initialLayoutTsxContent);
    console.log('Generated app/layout.tsx');

    // --- 7. Generate app/page.tsx (initial) ---
    const pageTsxContent = `
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to ${projectName}
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          This Next.js project was generated from your Figma design.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Start by editing <code>app/page.tsx</code>
        </p>
      </div>
    </main>
  );
}
`;
    await fs.writeFile(path.join(appDir, 'page.tsx'), pageTsxContent);
    console.log('Generated app/page.tsx');

    // --- 8. Generate .gitignore ---
    const gitignoreContent = `
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Environment Variables
.env*.local
.env

# TypeScript
*.tsbuildinfo
next-env.d.ts
`;
    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);
    console.log('Generated .gitignore');

    // --- 9. Integrate selected modules (files and configurations) ---
    if (selectedModules && selectedModules.length > 0) {
      console.log('\nIntegrating selected modules...');
      const modulesSourceDir = path.resolve(__dirname, '..', '..', 'src', 'modules');
      const navLinks: string[] = [];
      const collectedDependencies: { [key: string]: string } = {};

      for (const moduleInfo of selectedModules) {
        const { id: moduleId, manifest } = moduleInfo;
        console.log(`  Processing module: ${manifest.name} (ID: ${moduleId})`);
        const moduleSourceBasePath = path.join(modulesSourceDir, moduleId);

        // Create module-specific app routes and collect nav links
        if (manifest.routes) {
          for (const route of manifest.routes) {
            const { path: routePath, file: pageFileRelative } = route;

            // Assuming pageFileRelative is relative to the module's source base path
            const sourcePagePath = path.join(moduleSourceBasePath, pageFileRelative);
            
            const routePathNormalized = route.path.startsWith('/') ? route.path.substring(1) : route.path;
            const targetPageDir = path.join(appDir, routePathNormalized);
            const targetPagePath = path.join(targetPageDir, 'page.tsx'); // For App Router, file must be page.tsx

            try {
              await fs.access(sourcePagePath);
              await ensureDirectoryExists(targetPageDir);
              await fs.copyFile(sourcePagePath, targetPagePath);
              console.log(`    Copied page for route ${routePath}: ${pageFileRelative} to ${path.relative(projectPath, targetPagePath)}`);

              // Rewrite relative import paths within the copied page
              let pageContent = await fs.readFile(targetPagePath, 'utf-8');
              const originalPageContent = pageContent;

              // Rewrite ../../components/... to ../../components/modules/[moduleId]/...
              const componentImportRegex = /(from\s+['"])(\.\.\/\.\.\/components\/)([^'"]+)(['"])/g;
              const componentReplacement = `$1../../components/modules/${moduleId}/$3$4`;
              pageContent = pageContent.replace(componentImportRegex, componentReplacement);

              // Rewrite ../../data/... to ../../lib/modules/[moduleId]/data/...
              const dataImportRegexPage = /(from\s+['"])(\.\.\/\.\.\/data\/)([^'"]+)(['"])/g;
              const dataReplacementPage = `$1../../lib/modules/${moduleId}/data/$3$4`;
              pageContent = pageContent.replace(dataImportRegexPage, dataReplacementPage);

              // Rewrite ../../types/... to ../../lib/modules/[moduleId]/types/...
              const typesImportRegexPage = /(from\s+['"])(\.\.\/\.\.\/types\/)([^'"]+)(['"])/g;
              const typesReplacementPage = `$1../../lib/modules/${moduleId}/types/$3$4`;
              pageContent = pageContent.replace(typesImportRegexPage, typesReplacementPage);
              
              if (pageContent !== originalPageContent) {
                await fs.writeFile(targetPagePath, pageContent, 'utf-8');
                console.log(`    Rewrote import paths in ${path.relative(projectPath, targetPagePath)}`);
              }
              
              let routeNamePart = '';
              if (routePathNormalized === '') {
                routeNamePart = 'Accueil'; 
              } else {
                const pathSegments = routePathNormalized.split('/');
                const nonEmptySegments = pathSegments.filter(segment => segment.length > 0);
                routeNamePart = nonEmptySegments.pop() || moduleId;
              }
              
              const linkName = `${manifest.name} ${routeNamePart.charAt(0).toUpperCase() + routeNamePart.slice(1)}`;
              navLinks.push(`<li><a href="/${routePathNormalized.replace(/\\/g, '/')}">${linkName}</a></li>`);

            } catch (error: unknown) {
              if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
                 console.warn(`    Warning: Page file not found: ${sourcePagePath}. Skipping copy for route '${routePath}' of module '${moduleId}'.`);
              } else {
                console.error(`    Error copying page ${pageFileRelative} for module ${moduleId}, route ${routePath}:`, error);
              }
            }
          }
        }

        await copyModuleAssets(moduleSourceBasePath, moduleId, projectPath, 'components', manifest.components || [], path.join('components', 'modules'));
        await copyModuleAssets(moduleSourceBasePath, moduleId, projectPath, 'services', manifest.services || [], 'services');
        await copyModuleAssets(moduleSourceBasePath, moduleId, projectPath, 'hooks', manifest.hooks || [], 'hooks');

        // Copy data and types files
        await copyModuleDataOrTypes(moduleSourceBasePath, moduleId, projectPath, 'data', manifest.data || []);
        await copyModuleDataOrTypes(moduleSourceBasePath, moduleId, projectPath, 'types', manifest.types || []);

        // Copy static assets from module's assets/ directory
        const moduleAssetsSourceDir = path.join(moduleSourceBasePath, 'assets');
        try {
          await fs.access(moduleAssetsSourceDir); // Check if assets directory exists
          const moduleAssetsTargetDir = path.join(projectPath, 'public', 'modules', moduleId);
          await ensureDirectoryExists(moduleAssetsTargetDir);
          console.log(`    Copying static assets for module ${moduleId} from ${moduleAssetsSourceDir} to ${moduleAssetsTargetDir}`);
          await copyDirectoryRecursive(moduleAssetsSourceDir, moduleAssetsTargetDir);
          console.log(`      Copied static assets for module ${moduleId}.`);
        } catch (error: unknown) {
          const nodeError = error as NodeJS.ErrnoException;
          if (nodeError.code === 'ENOENT') {
            // This is fine, means the module simply has no static assets directory
            // console.log(`    No static assets directory found for module ${moduleId} at ${moduleAssetsSourceDir}. Skipping.`);
          } else {
            console.error(`    Error accessing assets directory for module ${moduleId} at ${moduleAssetsSourceDir}:`, error);
          }
        }


        if (manifest.dependencies && manifest.dependencies.length > 0) {
            const deps: string[] = manifest.dependencies;
            deps.forEach(dep => {
                // manifest.dependencies is string[], so dep is string. No need for typeof check.
                if (!collectedDependencies[dep]) {
                    collectedDependencies[dep] = '*'; // Default to '*' for now
                }
            });
        }
      }

      if (Object.keys(collectedDependencies).length > 0) {
        const currentPackageJsonPath = path.join(projectPath, 'package.json');
        const currentPackageJsonData = await fs.readFile(currentPackageJsonPath, 'utf-8');
        const currentPackageJson = JSON.parse(currentPackageJsonData);
        let modified = false;
        for (const [dep, version] of Object.entries(collectedDependencies)) {
            if (!currentPackageJson.dependencies[dep]) {
                currentPackageJson.dependencies[dep] = version;
                modified = true;
            }
        }
        if (modified) {
            await fs.writeFile(currentPackageJsonPath, JSON.stringify(currentPackageJson, null, 2));
            console.log('Updated package.json with aggregated module dependencies.');
        }
      }

      if (navLinks.length > 0) {
        const layoutFilePath = path.join(appDir, 'layout.tsx');
        let layoutContent = await fs.readFile(layoutFilePath, 'utf-8');
        const navigationHtml = `
          <header style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ddd', marginBottom: '1rem' }}>
            <nav>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '15px' }}>
                <li><a href="/">Home</a></li>
                ${navLinks.join('\n                ')}
              </ul>
            </nav>
          </header>
        `;
        layoutContent = layoutContent.replace(
          '{/* Navigation will be injected here */}',
          navigationHtml
        );
        await fs.writeFile(layoutFilePath, layoutContent);
        console.log('Updated app/layout.tsx with module navigation links.');
      }
    }

    // --- Call afterInstall hooks ---    
    console.log('\n🔧 Running afterInstall hooks...');
    for (const mod of selectedModules) {
      if (mod.hooks && typeof mod.hooks.afterInstall === 'function') {
        console.log(`   - Running afterInstall for ${mod.id}...`);
        await mod.hooks.afterInstall(installContext);
      }
    }
    console.log('✅ afterInstall hooks completed.');

    console.log(`\n🎉 Project '${projectName}' generated successfully in ${projectPath}`);
    console.log(`\nTo get started:\n  cd ${path.relative(process.cwd(), projectPath)}\n  npm install\n  npm run dev`);

    console.log(`\nBase Next.js project '${projectName}' generation completed in ${projectPath}.`);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error generating Next.js project: ${error.message}`);
    } else {
      console.error('An unknown error occurred during Next.js project generation:', error);
    }
    throw error;
  }
};
