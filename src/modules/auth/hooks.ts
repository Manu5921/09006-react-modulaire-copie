import { ModuleHooks, InstallContext } from '../hooks'; // Adjusted path
import { updateEnvExample } from '../../utils/envFileHelper';

// Placeholder for environment variables specific to the auth module
const AUTH_ENV_VARS: Record<string, string> = {
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'YOUR_NEXTAUTH_SECRET_HERE_CHANGE_ME',
  // Add other auth-related env variables here (e.g., for providers like GITHUB_ID, GITHUB_SECRET)
};


export const authModuleHooks: ModuleHooks = {
  afterInstall: async (context: InstallContext) => {
    console.log(`Executing afterInstall hook for auth module in project: ${context.projectName}`);
    try {
      await updateEnvExample(context.projectPath, AUTH_ENV_VARS, '# Auth Module Environment Variables\n# These are required for NextAuth.js to function correctly.\n');
      // You could also add dependencies to package.json here if not handled by manifest alone
      // e.g., await addDependenciesToPackageJson(context.projectPath, ['next-auth', '@auth/prisma-adapter']);
    } catch (error) {
      console.error('Error during auth module afterInstall hook:', error);
      // Decide if this error should halt the process or just be logged
    }
  },
};
