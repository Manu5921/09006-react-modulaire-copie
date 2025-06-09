import { ModuleManifest } from '../../types/ModuleManifest';

export function validateModuleManifest(manifest: any, moduleId: string): manifest is ModuleManifest {
  const errors: string[] = [];
  if (typeof manifest.name !== 'string' || manifest.name.trim() === '') {
    errors.push('manifest.name must be a non-empty string.');
  }
  if (typeof manifest.description !== 'string' || manifest.description.trim() === '') {
    errors.push('manifest.description must be a non-empty string.');
  }
  if (typeof manifest.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    errors.push('manifest.version must be a valid semver string (e.g., "1.0.0").');
  }
  if (!Array.isArray(manifest.dependencies) || !manifest.dependencies.every((dep: any) => typeof dep === 'string')) {
    errors.push('manifest.dependencies must be an array of strings.');
  }

  // Optional fields validation (type check if present)
  if (manifest.pages !== undefined && (!Array.isArray(manifest.pages) || !manifest.pages.every((p: any) => typeof p === 'string'))) {
    errors.push('If present, manifest.pages must be an array of strings.');
  }
  if (manifest.components !== undefined && (!Array.isArray(manifest.components) || !manifest.components.every((c: any) => typeof c === 'string'))) {
    errors.push('If present, manifest.components must be an array of strings.');
  }
  if (manifest.services !== undefined && (!Array.isArray(manifest.services) || !manifest.services.every((s: any) => typeof s === 'string'))) {
    errors.push('If present, manifest.services must be an array of strings.');
  }
  if (manifest.hooks !== undefined && (!Array.isArray(manifest.hooks) || !manifest.hooks.every((h: any) => typeof h === 'string'))) {
    errors.push('If present, manifest.hooks must be an array of strings.');
  }
  if (manifest.routes !== undefined && (typeof manifest.routes !== 'object' || manifest.routes === null || !Object.values(manifest.routes).every((r: any) => typeof r === 'string'))) {
    errors.push('If present, manifest.routes must be an object mapping strings to strings.');
  }

  if (errors.length > 0) {
    console.warn(`Warning: Invalid manifest for module '${moduleId}':\n  - ${errors.join('\n  - ')}`);
    return false;
  }
  return true;
}
