import fs from 'fs/promises';


/**
 * Ensures that a directory exists. If it doesn't, it creates it.
 * Behaves like 'mkdir -p'.
 * @param dirPath The absolute path to the directory.
 */
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error: unknown) {
    // Ignore EEXIST error (directory already exists), rethrow others
    if (error instanceof Error && (error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
};
