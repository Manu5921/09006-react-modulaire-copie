import fs from 'fs/promises';
import path from 'path';
import { ModuleManifest } from '../../types/ModuleManifest';
import { getAvailableModules, AvailableModule } from '../index'; 

// Mock fs/promises at the very top
jest.mock('fs/promises');


describe('getAvailableModules', () => {
  const MOCK_MODULES_PATH = path.join(__dirname, '..', '..', 'modules'); // Used by getAvailableModules internally
  let mockConsoleWarn: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    // Reset fs mocks
    (fs.readdir as jest.Mock).mockReset();
    (fs.readFile as jest.Mock).mockReset();

    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
  });

  test('should return an empty array if modules directory is empty or contains no directories', async () => {
    (fs.readdir as jest.Mock).mockResolvedValue([]); // No entries
    const modules = await getAvailableModules(); // Call the original function
    expect(modules).toEqual([]);
    expect(fs.readdir).toHaveBeenCalledWith(MOCK_MODULES_PATH, { withFileTypes: true });
  });

  test('should return a valid module if found', async () => {
    const mockModuleDir = { name: 'auth-module', isDirectory: () => true, path: '' }; // path is required by Dirent
    const mockManifestContent: ModuleManifest = {
      name: 'Auth Module',
      version: '1.0.0',
      description: 'Handles authentication',
      dependencies: ['some-dep'],
      pages: ['login.tsx'],
    };

    (fs.readdir as jest.Mock).mockResolvedValue([mockModuleDir]);
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockManifestContent));
    // The default mockImplementation for mockedValidateModuleManifest should return true for mockManifestContent

    const modules = await getAvailableModules(); // Call the original function

    expect(modules).toHaveLength(1);
    expect(modules[0].id).toBe('auth-module');
    expect(modules[0].manifest).toEqual(mockManifestContent);
    expect(fs.readFile).toHaveBeenCalledWith(path.join(MOCK_MODULES_PATH, 'auth-module', 'manifest.json'), 'utf-8');
  });

  // TODO: Add more tests for getAvailableModules:
  // - Module with unreadable/corrupt manifest.json (fs.readFile rejects or returns invalid JSON)
  // - Module with manifest deemed invalid by mockedValidateModuleManifest (returns false)
  // - Mix of valid and invalid modules
  // - fs.readdir itself throws an error
});
