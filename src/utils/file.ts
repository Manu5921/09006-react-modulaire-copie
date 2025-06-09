import fs from 'fs/promises';


/**
 * Ensures that a directory exists. If it doesn't, it creates it.
 * Behaves like 'mkdir -p'.
 * If the path exists but is a file, it will throw an error (EEXIST from mkdir).
 * @param dirPath The absolute path to the directory.
 */
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error: unknown) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EEXIST') {
      // If mkdir threw EEXIST, it means path exists.
      // We need to check if this existing path is a directory.
      // If it's not a directory (e.g., it's a file), then this is an error condition,
      // and we should let the original EEXIST error propagate.
      let stat;
      try {
        stat = await fs.stat(dirPath);
      } catch (statError) {
        // If fs.stat itself fails after fs.mkdir threw EEXIST,
        // this is an unexpected state. Rethrow the original mkdir error.
        throw error;
      }

      if (!stat.isDirectory()) {
        // Path exists but is not a directory. This is an error.
        // Rethrow the original EEXIST error from fs.mkdir.
        throw error;
      }
      // If path exists and is a directory, then EEXIST is acceptable (mkdir did nothing).
    } else {
      // For any other error (e.g., permissions), rethrow it.
      throw error;
    }
  }
};
