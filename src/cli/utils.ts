// src/cli/utils.ts
import { ModuleManifest } from '../types/ModuleManifest';

/**
 * Validates a module manifest.
 * @param manifest The manifest object to validate.
 * @param moduleId The ID of the module (for logging purposes).
 * @returns True if the manifest is valid, false otherwise.
 */
export function validateModuleManifest(manifest: any, moduleId: string): manifest is ModuleManifest {
  if (typeof manifest !== 'object' || manifest === null) {
    console.warn(`[${moduleId}] manifest is not an object.`);
    return false;
  }

  if (typeof manifest.name !== 'string' || manifest.name.trim() === '') {
    console.warn(`[${moduleId}] manifest.name must be a non-empty string.`);
    return false;
  }

  if (typeof manifest.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    console.warn(`[${moduleId}] manifest.version must be a valid semver string (e.g., "1.0.0")`);
    return false;
  }

  if (typeof manifest.description !== 'string' || manifest.description.trim() === '') {
    console.warn(`[${moduleId}] manifest.description must be a non-empty string.`);
    return false;
  }

  if (!Array.isArray(manifest.dependencies) || !manifest.dependencies.every((d: any) => typeof d === 'string')) {
    console.warn(`[${moduleId}] manifest.dependencies must be an array of strings.`);
    return false;
  }

  // Optional fields validation
  if (manifest.pages !== undefined && (!Array.isArray(manifest.pages) || !manifest.pages.every((p: any) => typeof p === 'string'))) {
    console.warn(`[${moduleId}] If present, manifest.pages must be an array of strings.`);
    return false;
  }

  if (manifest.components !== undefined && (!Array.isArray(manifest.components) || !manifest.components.every((c: any) => typeof c === 'string'))) {
    console.warn(`[${moduleId}] If present, manifest.components must be an array of strings.`);
    return false;
  }

  if (manifest.services !== undefined && (!Array.isArray(manifest.services) || !manifest.services.every((s: any) => typeof s === 'string'))) {
    console.warn(`[${moduleId}] If present, manifest.services must be an array of strings.`);
    return false;
  }
  
  if (manifest.hooks !== undefined && (!Array.isArray(manifest.hooks) || !manifest.hooks.every((h: any) => typeof h === 'string'))) {
    console.warn(`[${moduleId}] If present, manifest.hooks must be an array of strings.`);
    return false;
  }


  // Validate routes field
  if (manifest.routes !== undefined) {
    if (!Array.isArray(manifest.routes)) {
      console.warn(`[${moduleId}] If present, manifest.routes must be an array.`);
      return false;
    }
    
    for (let i = 0; i < manifest.routes.length; i++) {
      const route = manifest.routes[i];
      
      if (typeof route !== 'object' || route === null) {
        console.warn(`[${moduleId}] manifest.routes[${i}] must be an object.`);
        return false;
      }
      
      if (typeof route.path !== 'string' || route.path.trim() === '') {
        console.warn(`[${moduleId}] manifest.routes[${i}].path must be a non-empty string.`);
        return false;
      }
      
      if (typeof route.file !== 'string' || route.file.trim() === '') {
        console.warn(`[${moduleId}] manifest.routes[${i}].file must be a non-empty string.`);
        return false;
      }
    }
  }

  // Validate optional defaultEnabled field
  if (manifest.defaultEnabled !== undefined && typeof manifest.defaultEnabled !== 'boolean') {
    console.warn(`[${moduleId}] If present, manifest.defaultEnabled must be a boolean.`);
    return false;
  }

  return true;
}
