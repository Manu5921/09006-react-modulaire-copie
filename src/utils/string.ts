export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with -
    .replace(/(^-|-$)+/g, '');    // Remove leading/trailing hyphens
};
