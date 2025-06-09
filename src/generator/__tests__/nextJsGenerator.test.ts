import fs from 'fs/promises';
import path from 'path';
import { copyModuleAssets } from '../nextJsGenerator'; // Assurez-vous que le chemin est correct

// Mock fs/promises
jest.mock('fs/promises');

// Mock console.log, console.warn, console.error pour espionner les appels
const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('copyModuleAssets', () => {
  // Réinitialiser les mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const projectPath = '/test-project';
  const moduleSourceBasePath = '/modules-source';

  test('should return early if assetPathsInManifest is empty or undefined', async () => {
    await copyModuleAssets(moduleSourceBasePath, 'test-module', projectPath, 'components', [], 'components/modules');
    expect(fs.mkdir).not.toHaveBeenCalled();
    expect(fs.copyFile).not.toHaveBeenCalled();
    expect(mockLog).not.toHaveBeenCalledWith(expect.stringContaining('Copying components for module test-module'));

    await copyModuleAssets(moduleSourceBasePath, 'test-module', projectPath, 'services', undefined as any, 'services');
    expect(fs.mkdir).not.toHaveBeenCalled(); // Devrait toujours être 0 appel total si le premier cas n'appelle rien
    expect(fs.copyFile).not.toHaveBeenCalled();
  });

  test('should successfully copy a single asset', async () => {
    const assetType = 'components';
    const moduleId = 'auth';
    const assetPaths = ['components/LoginForm.tsx'];
    const targetSubDir = path.join('components', 'modules');

    // Mock implementations
    (fs.access as jest.Mock).mockResolvedValue(undefined); // File exists
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined); // Directory creation succeeds
    (fs.copyFile as jest.Mock).mockResolvedValue(undefined); // File copy succeeds

    await copyModuleAssets(moduleSourceBasePath, moduleId, projectPath, assetType, assetPaths, targetSubDir);

    const sourceFilePath = path.join(moduleSourceBasePath, assetPaths[0]);
    // Expected destination: /test-project/components/modules/auth/LoginForm.tsx
    // assetPaths[0] is 'components/LoginForm.tsx', relativeDestPath becomes 'LoginForm.tsx'
    const expectedDestFilePath = path.join(projectPath, targetSubDir, moduleId, 'LoginForm.tsx');

    expect(mockLog).toHaveBeenCalledWith(`    Copying ${assetType} for module ${moduleId}...`);
    expect(fs.access).toHaveBeenCalledWith(sourceFilePath);
    expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(expectedDestFilePath), { recursive: true });
    expect(fs.copyFile).toHaveBeenCalledWith(sourceFilePath, expectedDestFilePath);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining(`Copied ${assetType}: ${assetPaths[0]} to ${path.relative(projectPath, expectedDestFilePath)}`));
    expect(mockWarn).not.toHaveBeenCalled();
    expect(mockError).not.toHaveBeenCalled();
  });

  test('should warn and skip if asset source file is not found', async () => {
    const assetType = 'services';
    const moduleId = 'user';
    const assetPaths = ['services/UserService.ts'];
    const targetSubDir = 'services'; // e.g., services/user

    const sourceFilePath = path.join(moduleSourceBasePath, assetPaths[0]);
    const enoentError = new Error(`ENOENT: no such file or directory, access '${sourceFilePath}'`);
    (enoentError as any).code = 'ENOENT';
    (enoentError as any).path = sourceFilePath; 

    // Mock implementations
    (fs.access as jest.Mock).mockRejectedValue(enoentError); // File does not exist

    await copyModuleAssets(moduleSourceBasePath, moduleId, projectPath, assetType, assetPaths, targetSubDir);

    expect(mockLog).toHaveBeenCalledWith(`    Copying ${assetType} for module ${moduleId}...`);
    expect(fs.access).toHaveBeenCalledWith(sourceFilePath);
    expect(mockWarn).toHaveBeenCalledWith(`      Warning: Asset file not found: ${sourceFilePath}. Skipping copy of ${assetType} '${assetPaths[0]}' for module ${moduleId}.`);
    expect(fs.mkdir).not.toHaveBeenCalled();
    expect(fs.copyFile).not.toHaveBeenCalled();
    expect(mockError).not.toHaveBeenCalled();
  });

  test('should log an error if fs.mkdir fails', async () => {
    const assetType = 'hooks';
    const moduleId = 'data-fetching';
    const assetPaths = ['hooks/useCustomData.ts'];
    const targetSubDir = 'hooks'; // e.g., hooks/data-fetching

    const sourceFilePath = path.join(moduleSourceBasePath, assetPaths[0]);
    const mkdirError = new Error('Failed to create directory');

    // Mock implementations
    (fs.access as jest.Mock).mockResolvedValue(undefined); // File exists
    (fs.mkdir as jest.Mock).mockRejectedValue(mkdirError); // mkdir fails

    await copyModuleAssets(moduleSourceBasePath, moduleId, projectPath, assetType, assetPaths, targetSubDir);

    const expectedDestDir = path.join(projectPath, targetSubDir, moduleId);
    const expectedDestFilePath = path.join(expectedDestDir, 'useCustomData.ts');

    expect(mockLog).toHaveBeenCalledWith(`    Copying ${assetType} for module ${moduleId}...`);
    expect(fs.access).toHaveBeenCalledWith(sourceFilePath);
    expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(expectedDestFilePath), { recursive: true });
    expect(mockError).toHaveBeenCalledWith(
      `      Error copying ${assetType} '${assetPaths[0]}' for module ${moduleId} from ${sourceFilePath} to ${expectedDestFilePath}:`, 
      mkdirError
    );
    expect(fs.copyFile).not.toHaveBeenCalled();
    expect(mockWarn).not.toHaveBeenCalled();
  });

  test('should log an error if fs.copyFile fails', async () => {
    const assetType = 'components';
    const moduleId = 'shared';
    const assetPaths = ['components/Button.tsx'];
    const targetSubDir = path.join('components', 'modules');

    const sourceFilePath = path.join(moduleSourceBasePath, assetPaths[0]);
    const copyFileError = new Error('Failed to copy file');

    // Mock implementations
    (fs.access as jest.Mock).mockResolvedValue(undefined); // File exists
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined); // Directory creation succeeds
    (fs.copyFile as jest.Mock).mockRejectedValue(copyFileError); // copyFile fails

    await copyModuleAssets(moduleSourceBasePath, moduleId, projectPath, assetType, assetPaths, targetSubDir);

    const expectedDestDir = path.join(projectPath, targetSubDir, moduleId);
    const expectedDestFilePath = path.join(expectedDestDir, 'Button.tsx');

    expect(mockLog).toHaveBeenCalledWith(`    Copying ${assetType} for module ${moduleId}...`);
    expect(fs.access).toHaveBeenCalledWith(sourceFilePath);
    expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(expectedDestFilePath), { recursive: true });
    expect(fs.copyFile).toHaveBeenCalledWith(sourceFilePath, expectedDestFilePath);
    expect(mockError).toHaveBeenCalledWith(
      `      Error copying ${assetType} '${assetPaths[0]}' for module ${moduleId} from ${sourceFilePath} to ${expectedDestFilePath}:`, 
      copyFileError
    );
    expect(mockWarn).not.toHaveBeenCalled();
  });

  // D'autres tests viendront ici

});

import { generateNextJsProject } from '../nextJsGenerator';
import { AvailableModule } from '../../cli'; // AvailableModule is defined in the cli directory

describe('generateNextJsProject - NavLink Generation', () => {
  const outputBaseDir = '/test-output';
  const projectName = 'my-navlink-project';
  const projectPath = path.join(outputBaseDir, projectName);
  const appDir = path.join(projectPath, 'app');
  const layoutFilePath = path.join(appDir, 'layout.tsx');

  const baseFigmaData = { fileId: 'figma-id', apiToken: 'figma-token', data: {} } as any; // Données Figma minimales
  const baseTailwindTheme = { theme: { extend: {} } } as any; // Thème Tailwind minimal

  beforeEach(() => {
    jest.clearAllMocks();
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    // fs.writeFile is mocked specifically within the test to capture content

    (fs.readFile as jest.Mock).mockImplementation(async (filePath) => {
      if (filePath === path.join(projectPath, 'package.json')) {
        return JSON.stringify({ name: projectName, version: '0.1.0', dependencies: {}, devDependencies: {} });
      }
      if (filePath === layoutFilePath) {
        return `
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navigation will be injected here */}
        {children}
      </body>
    </html>
  );
`;
      }
      return '{}'; // Pour d'autres lectures de fichiers
    });
    (fs.copyFile as jest.Mock).mockResolvedValue(undefined); 
    (fs.access as jest.Mock).mockResolvedValue(undefined); 
  });

  test('should generate correct navLinks for various route configurations', async () => {
    const selectedModules: AvailableModule[] = [
      {
        id: 'blog',
        // path: '/path/to/blog', // This property is not part of AvailableModule and not used by generateNextJsProject
        manifest: {
          name: 'Blog Module',
          version: '1.0.0',
          description: 'Manages blog posts',
          dependencies: [],
          routes: [
            { path: '/', file: 'blog-home.tsx' },
            { path: '/posts', file: 'blog-posts.tsx' },
            { path: '/posts/new', file: 'blog-post-new.tsx' },
          ],
        } as any,
      },
      {
        id: 'user',
        // path: '/path/to/user', // This property is not part of AvailableModule
        manifest: {
          name: 'User Module',
          version: '1.0.0',
          description: 'Manages users',
          dependencies: [],
          routes: [
            { path: '/profile', file: 'user-profile.tsx' },
            { path: '/settings/account', file: 'user-settings-account.tsx' },
          ],
        } as any,
      },
       {
        id: 'docs',
        // path: '/path/to/docs', // This property is not part of AvailableModule
        manifest: {
          name: 'Documentation',
          version: '1.0.0',
          description: 'Project documentation',
          dependencies: [],
          // Pas de routes
        } as any,
      },
    ];

    let writtenLayoutContent = '';
    (fs.writeFile as jest.Mock).mockImplementation(async (filePath, content) => {
      if (filePath === layoutFilePath) {
        writtenLayoutContent = content as string;
      }
      // Allow other writeFile calls to proceed (e.g., package.json, tailwind.config.js)
      return Promise.resolve(); 
    });
    
    await generateNextJsProject(baseFigmaData, baseTailwindTheme, outputBaseDir, projectName, selectedModules);

    expect(fs.writeFile).toHaveBeenCalledWith(layoutFilePath, expect.any(String));
    
    expect(writtenLayoutContent).toContain('<li><a href="/blog">Blog Module Accueil</a></li>');
    expect(writtenLayoutContent).toContain('<li><a href="/blog/posts">Blog Module Posts</a></li>');
    expect(writtenLayoutContent).toContain('<li><a href="/blog/posts/new">Blog Module New</a></li>');
    expect(writtenLayoutContent).toContain('<li><a href="/user/profile">User Module Profile</a></li>');
    expect(writtenLayoutContent).toContain('<li><a href="/user/settings/account">User Module Account</a></li>');
    expect(writtenLayoutContent).not.toContain('Documentation'); 
  });
});
