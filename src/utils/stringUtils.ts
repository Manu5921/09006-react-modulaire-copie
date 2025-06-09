export const slugify = (text: string | null | undefined, defaultSlug: string = 'default-slug'): string => {
  if (text === null || text === undefined || typeof text !== 'string' || text.trim() === '') {
    return defaultSlug;
  }
  let slug = text.toString().normalize('NFKD').toLowerCase().trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]+/g, '') // Remove all non-alphanumeric chars (including underscore) except hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with a single one
  
  slug = slug.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Ensure slug doesn't start with a number or consist only of numbers, and prefix if so
  if (/^\d/.test(slug) || /^\d+$/.test(slug)) {
    slug = `item-${slug}`;
  } else if (slug.startsWith('-')) { // Should be caught by previous replace, but as a safeguard
    slug = `item-${slug.substring(1)}`;
  }
  
  // If the slugging process results in an empty string or just a hyphen, return the default slug
  return slug === '' || slug === '-' ? defaultSlug : slug;
};
