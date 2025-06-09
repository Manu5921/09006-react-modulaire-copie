import fs from 'fs/promises'; // Import for type casting first
jest.mock('fs/promises'); // Mock fs/promises at the top level, after its import for typing

import * as cliIndex from '../index'; // Ajustez le chemin si nécessaire
import { ModuleManifest } from '../../types/ModuleManifest';


describe('validateModuleManifest', () => {
  let mockWarn: jest.SpyInstance;

  beforeEach(() => {
    mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const moduleId = 'test-module';

  test('should return true for a valid manifest', () => {
    const manifest: ModuleManifest = {
      name: 'Test Module',
      version: '1.0.0',
      description: 'A test module.',
      dependencies: [], // Ajout du champ obligatoire
      pages: ['auth/login.tsx'], // Array of strings (relative paths)
      components: ['auth/LoginForm.tsx'], // Array of strings
      services: ['authService.ts'], // Array of strings
      hooks: ['useAuth.ts'], // Array of strings
      // 'id' and 'icon' are not part of ModuleManifest, removing them.
      // 'routes' is optional, so it's fine to omit it for a basic valid manifest.
    };
    expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(true);
    expect(mockWarn).not.toHaveBeenCalled();
  });

  // Note: The 'id' field was removed from the test manifest as it's not in ModuleManifest type.
  // The 'icon' field was also removed for the same reason.

  test('should return false and warn if required field "name" is missing', () => {
    const manifest = {
      id: 'auth',
      // name: 'Authentication Module', // Missing
      version: '1.0.0',
      description: 'Handles user authentication.',
      dependencies: [], // Ajout du champ obligatoire
      pages: [],
    } as any;
    expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(false);
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(`[${moduleId}] manifest.name must be a non-empty string.`));
  });

  test('should return false and warn if required field "version" is missing', () => {
    const manifest = {
      id: 'auth',
      name: 'Authentication Module',
      // version: '1.0.0', // Missing
      description: 'Handles user authentication.',
      dependencies: [], // Ajout du champ obligatoire
      pages: [],
    } as any;
    expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(false);
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(`[${moduleId}] manifest.version must be a valid semver string (e.g., "1.0.0")`));
  });

  test('should handle optional field "pages" correctly', () => {
    // Case 1: 'pages' field is missing - manifest should still be valid
    const manifestMissingPages = {
      name: 'Test Module No Pages',
      version: '1.0.0',
      description: 'A test module that does not define pages.',
      dependencies: [], // Ajout du champ obligatoire
      // pages field is intentionally absent
    } as any;
    expect(cliIndex.validateModuleManifest(manifestMissingPages, moduleId)).toBe(true);
    expect(mockWarn).not.toHaveBeenCalled(); // No warning if 'pages' is just missing
    mockWarn.mockClear();

    // Case 2: 'pages' field is present but has an invalid type - manifest should be invalid
    const manifestInvalidPageType = {
      name: 'Authentication Module',
      version: '1.0.0',
      description: 'Valid description for testing pages type.',
      dependencies: [], // Ajout du champ obligatoire
      pages: { path: 'not-an-array' }, // Invalid type for 'pages'
    } as any;
    expect(cliIndex.validateModuleManifest(manifestInvalidPageType, moduleId)).toBe(false);
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(`[${moduleId}] If present, manifest.pages must be an array of strings.`));
  });

  // Ajoutez d'autres tests pour les champs optionnels mais avec types incorrects (components, services, hooks, dependencies, icon)
  // Et pour les structures internes incorrectes (e.g., page item sans 'name' ou 'path')

    test('should return true for a valid manifest with routes', () => {
      const manifest: ModuleManifest = {
        name: 'Test Module with Routes',
        version: '1.0.0',
        description: 'A test module that includes API routes.',
        dependencies: [],
        routes: [
          { path: '/api/items', file: 'api/items.ts' },
          { path: '/api/users/:id', file: 'api/users/[id].ts' },
        ],
      };
      expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(true);
      expect(mockWarn).not.toHaveBeenCalled();
    });

    test('should return false and warn if routes is not an array', () => {
      const manifest = {
        name: 'Test Routes Not Array',
        version: '1.0.0',
        description: 'routes is not an array.',
        dependencies: [],
        routes: { path: '/api/test', file: 'api/test.ts' }, // Invalid: not an array
      } as any;
      expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(false);
      expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(`[${moduleId}] If present, manifest.routes must be an array.`));
    });

    test('should return false and warn if a route item is not an object', () => {
      const manifest = {
        name: 'Test Route Item Not Object',
        version: '1.0.0',
        description: 'A route item is not an object.',
        dependencies: [],
        routes: ['/api/not-an-object'], // Invalid: item is a string
      } as any;
      expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(false);
      expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(`[${moduleId}] manifest.routes[0] must be an object.`));
    });

    test('should return false and warn if route.path is missing or invalid', () => {
      const manifest = {
        name: 'Test Route Path Invalid',
        version: '1.0.0',
        description: 'A route path is invalid.',
        dependencies: [],
        routes: [{ file: 'api/file.ts' }], // Invalid: path missing
      } as any;
      expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(false);
      expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(`[${moduleId}] manifest.routes[0].path must be a non-empty string.`));
    });

    test('should return false and warn if route.file is missing or invalid', () => {
      const manifest = {
        name: 'Test Route File Invalid',
        version: '1.0.0',
        description: 'A route file is invalid.',
        dependencies: [],
        routes: [{ path: '/api/path' }], // Invalid: file missing
      } as any;
      expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(false);
      expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(`[${moduleId}] manifest.routes[0].file must be a non-empty string.`));
    });


    describe('defaultEnabled field validation', () => {
      const baseManifest = {
        name: 'Test DefaultEnabled',
        version: '1.0.0',
        description: 'Testing defaultEnabled.',
        dependencies: [],
      };

      test('should return true if defaultEnabled is true', () => {
        const manifest = { ...baseManifest, defaultEnabled: true };
        expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(true);
        expect(mockWarn).not.toHaveBeenCalled();
      });

      test('should return true if defaultEnabled is false', () => {
        const manifest = { ...baseManifest, defaultEnabled: false };
        expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(true);
        expect(mockWarn).not.toHaveBeenCalled();
      });

      test('should return true if defaultEnabled is not present (optional)', () => {
        const manifest = { ...baseManifest }; // defaultEnabled is undefined
        expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(true);
        expect(mockWarn).not.toHaveBeenCalled();
      });

      test('should return false and warn if defaultEnabled is not a boolean (e.g., string)', () => {
        const manifest = { ...baseManifest, defaultEnabled: 'true' } as any;
        expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(false);
        expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(`[${moduleId}] If present, manifest.defaultEnabled must be a boolean.`));
      });

      test('should return false and warn if defaultEnabled is not a boolean (e.g., number)', () => {
        const manifest = { ...baseManifest, defaultEnabled: 1 } as any;
        expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(false);
        expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(`[${moduleId}] If present, manifest.defaultEnabled must be a boolean.`));
      });

      test('should return false and warn if defaultEnabled is not a boolean (e.g., object)', () => {
        const manifest = { ...baseManifest, defaultEnabled: {} } as any;
        expect(cliIndex.validateModuleManifest(manifest, moduleId)).toBe(false);
        expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(`[${moduleId}] If present, manifest.defaultEnabled must be a boolean.`));
      });
    });

  afterEach(() => {
    mockWarn.mockRestore();
  });
});


// Tests for getAvailableModules have been moved to src/cli/__tests__/getAvailableModules.test.ts

// TODO: Add tests for runCli, potentially in a separate file due to inquirer mocking complexities
