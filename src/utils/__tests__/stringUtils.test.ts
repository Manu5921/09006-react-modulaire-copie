import { slugify } from '../stringUtils';

describe('slugify', () => {
  test('should convert basic strings', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('  Leading and Trailing Spaces  ')).toBe('leading-and-trailing-spaces');
  });

  test('should handle special characters', () => {
    expect(slugify('Hello!@#$%^&*()_+World')).toBe('helloworld');
    expect(slugify('Crème brûlée')).toBe('creme-brulee');
  });

  test('should handle multiple hyphens', () => {
    expect(slugify('Hello---World')).toBe('hello-world');
    expect(slugify('Hello - World')).toBe('hello-world');
  });

  test('should handle leading/trailing hyphens after processing', () => {
    expect(slugify('-Hello-World-')).toBe('hello-world');
    expect(slugify('!Hello-World!')).toBe('hello-world'); // Special chars removed, then hyphens trimmed
  });

  test('should prefix numbers or numeric-only slugs', () => {
    expect(slugify('123 Test')).toBe('item-123-test');
    expect(slugify('456')).toBe('item-456');
    expect(slugify('  789  ')).toBe('item-789');
  });

  test('should handle empty, null, or undefined inputs with default slug', () => {
    expect(slugify('')).toBe('default-slug');
    expect(slugify('   ')).toBe('default-slug');
    expect(slugify(null)).toBe('default-slug');
    expect(slugify(undefined)).toBe('default-slug');
  });

  test('should use custom default slug if provided', () => {
    expect(slugify('', 'custom-default')).toBe('custom-default');
    expect(slugify(null, 'another-default')).toBe('another-default');
  });

  test('should handle slugs that become empty after processing', () => {
    expect(slugify('!@#$%')).toBe('default-slug');
    expect(slugify('---')).toBe('default-slug');
  });

  test('should handle mixed case and accents', () => {
    expect(slugify('Ça Va Bien?')).toBe('ca-va-bien');
    expect(slugify('Déjà Vu')).toBe('deja-vu');
  });
});
