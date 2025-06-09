import fs from 'fs/promises';
import path from 'path';

/**
 * Adds or updates variables in a .env.example file in the generated project.
 * If the file doesn't exist, it will be created.
 * Comments and existing lines not matching the new keys are preserved.
 * @param projectPath The root path of the generated project.
 * @param envVars An object containing key-value pairs of environment variables to add/update.
 * @param comment Optional header comment to add if the file is created.
 */
export const updateEnvExample = async (
  projectPath: string, 
  envVars: Record<string, string>,
  comment: string = '# This is an example .env file. Copy to .env and fill in your values.\n# Variables added/updated by project-generator.\n'
): Promise<void> => {
  const envExamplePath = path.join(projectPath, '.env.example');
  let lines: string[] = [];

  try {
    await fs.access(envExamplePath);
  } catch (e: unknown) {
    if (e instanceof Error && (e as NodeJS.ErrnoException).code === 'ENOENT') {
      lines.push(comment.trimEnd()); // Add comment if file is new
    } else {
      // rethrow other errors or handle them
      // console.warn(`Warning accessing .env.example: ${e}`);
    }
  }

  try {
    const content = await fs.readFile(envExamplePath, 'utf-8');
    lines = content.split('\n');
  } catch (error: unknown) {
    // If the file doesn't exist and we haven't added the initial comment yet,
    // it's an expected case if we're creating the file for the first time.
    // The previous try-catch for fs.access should have handled adding the comment for new files.
    // So, if we reach here with ENOENT, it might be an unexpected scenario or a race condition.
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT' && lines.length === 0) {
        // This case should ideally be covered by the fs.access check, 
        // but as a fallback, ensure the comment is added if lines are empty.
        lines.push(comment.trimEnd());
    } else if (!(error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT')) {
        // Log and rethrow only if it's not an ENOENT error (file not found)
        // or if it is ENOENT but lines already have content (meaning it wasn't a fresh creation).
        console.error(`Error reading .env.example at ${envExamplePath}:`, error);
        throw error;
    }
    // If it's ENOENT and lines is not empty, it means fs.access added the comment, so we can proceed.
  }

  const newVars = { ...envVars }; // Create a mutable copy

  // Update existing lines or mark variable as processed
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split('=');
    const key = parts[0].trim();
    if (Object.prototype.hasOwnProperty.call(newVars, key)) {
      lines[i] = `${key}=${newVars[key]}`; // Update existing key
      delete newVars[key]; // Mark as processed
    }
  }

  // Add new variables that weren't in the file
  for (const [key, value] of Object.entries(newVars)) {
    lines.push(`${key}=${value}`);
  }
  
  // Ensure there's a trailing newline if there's content
  let outputContent = lines.join('\n');
  if (outputContent.trim() !== '' && !outputContent.endsWith('\n')) {
    outputContent += '\n';
  }

  try {
    await fs.writeFile(envExamplePath, outputContent);
    console.log(`Updated .env.example at ${envExamplePath}.`);
  } catch (error) {
    console.error(`Error writing .env.example at ${envExamplePath}:`, error);
    throw error;
  }
};
