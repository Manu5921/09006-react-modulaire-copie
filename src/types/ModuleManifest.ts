/**
 * Defines the structure of a module's manifest file (manifest.json).
 */
export interface ModuleManifest {
  name: string;
  description: string;
  version: string;
  dependencies: string[];
  pages?: string[]; // Relative paths to page files within the module's 'pages' directory (e.g., "index.tsx", "[slug].tsx")
  components?: string[]; // Relative paths to component files within the module's 'components' directory (e.g., "MyComponent.tsx", "forms/LoginForm.tsx")
  services?: string[]; // Relative paths to service files within the module's 'services' directory (e.g., "authService.ts")
  hooks?: string[]; // Relative paths to hook files within the module's 'hooks' directory (e.g., "useAuth.ts")
  data?: string[]; // Relative paths to data files (e.g., "data/my-data.ts")
  types?: string[]; // Relative paths to type definition files (e.g., "types/my-types.ts")
  routes?: Array<{ path: string; file: string; }>; // Mapping of public routes to their corresponding Next.js app router page file path within the module (e.g., { "/login": "auth/login/page.tsx", "/blog": "blog/page.tsx" })
  defaultEnabled?: boolean; // Indicates if the module should be selected by default
}
