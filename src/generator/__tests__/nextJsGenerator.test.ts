import fs from 'fs/promises'; // This will be the mocked version by default
import path from 'path'; // This will be the mocked version by default (usually not an issue)
import { copyModuleAssets } from '../nextJsGenerator'; // For testing with mocked fs

// Mock fs/promises globally for most tests
jest.mock('fs/promises');

// Mock console.log, console.warn, console.error to spy on calls for some tests
const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('copyModuleAssets (mocked fs)', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clears log mocks and fs operation mocks
  });

  const projectPath = '/test-project';
  const moduleSourceBasePath = '/modules-source';

  test('should return early if assetPathsInManifest is empty or undefined', async () => {
    await copyModuleAssets(moduleSourceBasePath, 'test-module', projectPath, 'components', [], 'components/modules');
    expect(fs.mkdir).not.toHaveBeenCalled();
    expect(fs.copyFile).not.toHaveBeenCalled();

    await copyModuleAssets(moduleSourceBasePath, 'test-module', projectPath, 'services', undefined as any, 'services');
    expect(fs.mkdir).not.toHaveBeenCalled();
    expect(fs.copyFile).not.toHaveBeenCalled();
  });

  test('should successfully copy a single asset', async () => {
    const assetType = 'components';
    const moduleId = 'auth';
    const assetPaths = ['components/LoginForm.tsx'];
    const targetSubDir = path.join('components', 'modules'); // path.join will use mocked path if path is mocked

    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.copyFile as jest.Mock).mockResolvedValue(undefined);
    // Mock readFile and writeFile for the import rewriting part
    (fs.readFile as jest.Mock).mockResolvedValue('import "../data/user";');
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);


    await copyModuleAssets(moduleSourceBasePath, moduleId, projectPath, assetType, assetPaths, targetSubDir);

    const sourceFilePath = path.join(moduleSourceBasePath, assetPaths[0]);
    const expectedDestFilePath = path.join(projectPath, targetSubDir, moduleId, 'LoginForm.tsx');

    expect(mockLog).toHaveBeenCalledWith(`    Copying ${assetType} for module ${moduleId}...`);
    expect(fs.access).toHaveBeenCalledWith(sourceFilePath);
    expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(expectedDestFilePath), { recursive: true });
    expect(fs.copyFile).toHaveBeenCalledWith(sourceFilePath, expectedDestFilePath);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining(`Copied ${assetType}: ${assetPaths[0]} to ${path.relative(projectPath, expectedDestFilePath)}`));
  });

  test('should warn and skip if asset source file is not found', async () => {
    const assetType = 'services';
    const moduleId = 'user';
    const assetPaths = ['services/UserService.ts'];
    const targetSubDir = 'services';

    const sourceFilePath = path.join(moduleSourceBasePath, assetPaths[0]);
    const enoentError = new Error(`ENOENT: no such file or directory, access '${sourceFilePath}'`);
    (enoentError as any).code = 'ENOENT';
    (enoentError as any).path = sourceFilePath; 
    (fs.access as jest.Mock).mockRejectedValue(enoentError);

    await copyModuleAssets(moduleSourceBasePath, moduleId, projectPath, assetType, assetPaths, targetSubDir);

    expect(fs.access).toHaveBeenCalledWith(sourceFilePath);
    expect(mockWarn).toHaveBeenCalledWith(`      Warning: Asset file not found: ${sourceFilePath}. Skipping copy of ${assetType} '${assetPaths[0]}' for module ${moduleId}.`);
    expect(fs.mkdir).not.toHaveBeenCalled();
    expect(fs.copyFile).not.toHaveBeenCalled();
  });
});


// --- Tests for functions requiring actual file system ---
describe('File System Operations (with actual fs)', () => {
  let actualFs: typeof import('fs/promises');
  let actualPathModule: typeof import('path'); // Renamed to avoid conflict with 'path' variable if any
  let copyDirRecursiveFunc: typeof import('../nextJsGenerator').copyDirectoryRecursive;
  let ensureDirExistsFunc: typeof import('../../utils/file').ensureDirectoryExists;

  let testDirRoot: string; // To be defined in beforeAll

  beforeAll(async () => {
    actualPathModule = jest.requireActual('path');
    actualFs = jest.requireActual('fs/promises'); // actualFs is now defined for the whole describe block
    testDirRoot = actualPathModule.join(__dirname, 'fs_test_area_actual');
    await actualFs.rm(testDirRoot, { recursive: true, force: true }); // Clean up before any tests run
  });

  beforeEach(async () => {
    jest.resetModules();
    jest.unmock('fs/promises');

    // Re-assign actualFs and actualPathModule in case resetModules has side effects on them, though usually it doesn't on direct requires.
    actualFs = jest.requireActual('fs/promises');
    actualPathModule = jest.requireActual('path');

    const generatorModuleActual = jest.requireActual('../nextJsGenerator');
    copyDirRecursiveFunc = generatorModuleActual.copyDirectoryRecursive;

    const utilsFileModuleActual = jest.requireActual('../../utils/file');
    ensureDirExistsFunc = utilsFileModuleActual.ensureDirectoryExists;

    await actualFs.mkdir(testDirRoot, { recursive: true });
  });

  afterEach(async () => {
    await actualFs.rm(testDirRoot, { recursive: true, force: true });
    jest.mock('fs/promises');
  });

  describe('copyDirectoryRecursive', () => {
    // Define sourceDir and targetDir as functions to get fresh paths in each test using actualPathModule
    const sourceDir = () => actualPathModule.join(testDirRoot, 'source');
    const targetDir = () => actualPathModule.join(testDirRoot, 'target');

    beforeEach(async () => {
        await actualFs.mkdir(sourceDir(), { recursive: true });
        await actualFs.mkdir(targetDir(), { recursive: true });
    });

    test('should copy a directory with multiple files and subdirectories', async () => {
      await actualFs.mkdir(actualPathModule.join(sourceDir(), 'subdir1'), { recursive: true });
      await actualFs.writeFile(actualPathModule.join(sourceDir(), 'file1.txt'), 'content1');
      await actualFs.writeFile(actualPathModule.join(sourceDir(), 'subdir1', 'file2.txt'), 'content2');
      // ... (add more files/dirs as in previous attempts)
      await copyDirRecursiveFunc(sourceDir(), targetDir());
      expect(await actualFs.readFile(actualPathModule.join(targetDir(), 'file1.txt'), 'utf8')).toBe('content1');
      expect(await actualFs.readFile(actualPathModule.join(targetDir(), 'subdir1', 'file2.txt'), 'utf8')).toBe('content2');
    });

    test('should copy an empty directory', async () => {
      const emptySource = actualPathModule.join(sourceDir(), 'emptySub');
      await actualFs.mkdir(emptySource, {recursive: true});
      await copyDirRecursiveFunc(emptySource, actualPathModule.join(targetDir(), 'emptySubTarget'));
      const stat = await actualFs.stat(actualPathModule.join(targetDir(), 'emptySubTarget'));
      expect(stat.isDirectory()).toBe(true);
      expect(await actualFs.readdir(actualPathModule.join(targetDir(), 'emptySubTarget'))).toEqual([]);
    });

    test('should do nothing if source directory is empty (target will be created)', async () => {
        await copyDirRecursiveFunc(sourceDir(), targetDir()); // sourceDir() is empty here
        const targetContents = await actualFs.readdir(targetDir());
        expect(targetContents.length).toBe(0);
    });

    test('should throw an error if source directory does not exist', async () => {
      const nonExistentSourceDir = actualPathModule.join(testDirRoot, 'nonExistentSource');
      await expect(copyDirRecursiveFunc(nonExistentSourceDir, targetDir()))
        .rejects.toThrow(expect.objectContaining({ code: 'ENOENT' }));
    });

    test('should throw an error if target is a file (via ensureDirectoryExists)', async () => {
      const targetFilePath = actualPathModule.join(testDirRoot, 'targetFile.txt');
      await actualFs.writeFile(targetFilePath, 'this is a file');
      await expect(copyDirRecursiveFunc(sourceDir(), targetFilePath))
          .rejects.toThrow(expect.objectContaining({ code: 'EEXIST' }));
      await actualFs.unlink(targetFilePath);
    });
  });

  describe('ensureDirectoryExists', () => {
    test('should create directory if it does not exist', async () => {
      const newDirPath = actualPathModule.join(testDirRoot, 'newlyCreatedDir');
      await ensureDirExistsFunc(newDirPath);
      const stats = await actualFs.stat(newDirPath);
      expect(stats.isDirectory()).toBe(true);
    });

    test('should not throw if directory already exists', async () => {
      const existingDirPath = actualPathModule.join(testDirRoot, 'alreadyExistsDir');
      await actualFs.mkdir(existingDirPath, { recursive: true });
      await expect(ensureDirExistsFunc(existingDirPath)).resolves.not.toThrow();
    });

    test('should throw error if path is an existing file', async () => {
      const filePath = actualPathModule.join(testDirRoot, 'existingFile.txt');
      await actualFs.writeFile(filePath, 'hello');
      await expect(ensureDirExistsFunc(filePath)).rejects.toThrow('EEXIST');
      await actualFs.unlink(filePath);
    });
  });
});


// --- Tests for generateNextJsProject logic (using mocked fs) ---
import { generateNextJsProject } from '../nextJsGenerator'; // Re-import for clarity, uses mocked fs from top
import { AvailableModule } from '../../cli';
import * as generatorModuleToSpy from '../nextJsGenerator'; // For spying on copyDirectoryRecursive

describe('generateNextJsProject (mocked fs)', () => {
  const outputBaseDir = '/test-output';
  const projectName = 'my-test-project';
  const projectPath = path.join(outputBaseDir, projectName); // Mocked path
  const appDir = path.join(projectPath, 'app');
  const layoutFilePath = path.join(appDir, 'layout.tsx');
  // Corrected modulesSourceDir to be absolute path from project root
  const modulesSourceDir = path.resolve(process.cwd(), 'src', 'modules');


  const baseFigmaData = { fileId: 'figma-id', apiToken: 'figma-token', data: {} } as any;
  const baseTailwindTheme = { theme: { extend: {} } } as any;
  let copyDirectoryRecursiveSpyInternal: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks(); // Resets fs mocks and log mocks

    // Spy on console.error and make it throw to reveal hidden errors
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((message) => {
      // For some known warnings that use console.error but aren't critical failures for these tests
      if (typeof message === 'string' && message.includes('Error copying page')) {
        return; // Don't throw for this specific non-critical error
      }
      throw new Error(`console.error was called: ${message}`);
    });


    // Default behavior for fs mocks used by generateNextJsProject
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fs.readFile as jest.Mock).mockImplementation(async (filePath) => {
      if (filePath === path.join(projectPath, 'package.json')) {
        return JSON.stringify({ name: projectName, version: '0.1.0', dependencies: {}, devDependencies: {} });
      }
      if (filePath === layoutFilePath) {
        return '{/* Navigation will be injected here */}';
      }
      return '{}';
    });
    (fs.copyFile as jest.Mock).mockResolvedValue(undefined);

    // More flexible fs.access mock needed for page and asset checks
    (fs.access as jest.Mock).mockImplementation(async (p: string) => {
      // Default to ENOENT, but allow specific paths to be "found" by other mocks if needed
      // For example, specific page paths or asset paths can be added to a set of "existing" paths in each test.
      // For now, keep default as not found. Tests that need fs.access to pass must mock it specifically.
      const enoent = new Error(`ENOENT by default mock for path: ${p}`);
      (enoent as any).code = 'ENOENT';
      throw enoent;
    });

    copyDirectoryRecursiveSpyInternal = jest.spyOn(generatorModuleToSpy, 'copyDirectoryRecursive')
                                     .mockResolvedValue(undefined);
  });

  afterEach(() => {
    copyDirectoryRecursiveSpyInternal.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Module Asset Copying', () => {
    test('should attempt to copy assets if module has an assets directory', async () => {
      const selectedModules: AvailableModule[] = [{ id: 'faq', manifest: { name: 'FAQ', version: '1.0.0', components:[], services:[], hooks:[], data:[], types:[] } as any }];
      const faqModuleSourcePath = path.join(modulesSourceDir, 'faq');
      const faqAssetsSourceDir = path.join(faqModuleSourcePath, 'assets');
      const faqAssetsTargetDir = path.join(projectPath, 'public', 'modules', 'faq');

      // SIMPLIFIED fs.access mock for this specific test: always resolve successfully.
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      await generateNextJsProject(baseFigmaData, baseTailwindTheme, outputBaseDir, projectName, selectedModules);

      expect(fs.access).toHaveBeenCalledWith(faqAssetsSourceDir); // Check that asset dir was checked
      expect(copyDirectoryRecursiveSpyInternal).toHaveBeenCalledWith(faqAssetsSourceDir, faqAssetsTargetDir);
      expect(fs.mkdir).toHaveBeenCalledWith(faqAssetsTargetDir, { recursive: true });
    });

    test('should not attempt to copy assets if module does not have an assets directory', async () => {
      const selectedModules: AvailableModule[] = [{ id: 'contact', manifest: { name: 'Contact', version: '1.0.0', components:[], services:[], hooks:[], data:[], types:[] } as any }];
      const contactModuleSourcePath = path.join(modulesSourceDir, 'contact');
      const contactAssetsSourceDir = path.join(contactModuleSourcePath, 'assets');

      // fs.access mock: asset dir does not exist, other accesses (like for pages) also don't exist by default
      (fs.access as jest.Mock).mockImplementation(async (p: string) => {
        const enoent = new Error(`ENOENT for ${p}`); (enoent as any).code = 'ENOENT'; throw enoent;
      });

      await generateNextJsProject(baseFigmaData, baseTailwindTheme, outputBaseDir, projectName, selectedModules);

      expect(fs.access).toHaveBeenCalledWith(contactAssetsSourceDir); // Asset dir is checked
      expect(copyDirectoryRecursiveSpyInternal).not.toHaveBeenCalled();
      // Check that the target asset directory was not explicitly created by asset logic
      const contactAssetsTargetDir = path.join(projectPath, 'public', 'modules', 'contact');
      const mkdirCalls = (fs.mkdir as jest.Mock).mock.calls;
      const contactAssetDirCreationCall = mkdirCalls.find(call => call[0] === contactAssetsTargetDir);
      expect(contactAssetDirCreationCall).toBeUndefined();
    });
  });

  describe('NavLink Generation', () => {
    test('should generate correct navLinks for various route configurations', async () => {
      const blogModulePath = path.join(modulesSourceDir, 'blog');
      const userModulePath = path.join(modulesSourceDir, 'user');

      const selectedModulesData: AvailableModule[] = [
        { id: 'blog', manifest: { name: 'Blog Module', version: '1.0.0', components:[], services:[], hooks:[], data:[], types:[], routes: [{ path: '/', file: 'pages/blog-home.tsx' }, { path: '/posts', file: 'pages/blog-posts.tsx' }] } as any },
        { id: 'user', manifest: { name: 'User Module', version: '1.0.0', components:[], services:[], hooks:[], data:[], types:[], routes: [{ path: '/profile', file: 'pages/user-profile.tsx' }] } as any },
      ];

      // Mock fs.access to allow page files to be "found"
      const expectedPagePaths = [
        path.join(blogModulePath, 'pages/blog-home.tsx'),
        path.join(blogModulePath, 'pages/blog-posts.tsx'),
        path.join(userModulePath, 'pages/user-profile.tsx')
      ];
      (fs.access as jest.Mock).mockImplementation(async (p: string) => {
        // console.log(`[NavLink Test fs.access mock] Checking path: ${p}`);
        if (expectedPagePaths.includes(p)) {
          // console.log(`[NavLink Test fs.access mock] FOUND page: ${p}`);
          return undefined; // Page file exists
        }
        // For asset checks or other unexpected paths, let them fail
        const enoent = new Error(`Mocked fs.access: ENOENT for path ${p} in NavLink test. Expected pages: ${expectedPagePaths.join(', ')}`);
        (enoent as any).code = 'ENOENT';
        throw enoent;
      });

      let writtenLayoutContent = '';
      // Capture layout content
      const originalWriteFile = fs.writeFile as jest.Mock;
      originalWriteFile.mockImplementation(async (filePath: string, content: any) => {
        if (filePath === layoutFilePath) {
          writtenLayoutContent = content as string;
        }
      });
      // Ensure readFile for layout returns the placeholder
      const originalReadFile = fs.readFile as jest.Mock;
      originalReadFile.mockImplementation(async (filePath: string) => {
        if (filePath === layoutFilePath) return '{/* Navigation will be injected here */}';
        if (filePath.endsWith('package.json')) return JSON.stringify({ name: projectName, dependencies:{} });
        return 'export default function Page() {}'; // Default content for copied pages
      });

      await generateNextJsProject(baseFigmaData, baseTailwindTheme, outputBaseDir, projectName, selectedModulesData);

      expect(writtenLayoutContent).toContain('<li><a href="/">Blog Module Accueil</a></li>');
      expect(writtenLayoutContent).toContain('<li><a href="/posts">Blog Module Posts</a></li>');
      expect(writtenLayoutContent).toContain('<li><a href="/profile">User Module Profile</a></li>');
    });
  });
});
