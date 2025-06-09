const eslintJs = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  eslintJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked, // Uses type information
  {
    languageOptions: {
      parserOptions: {
        project: true, // Automatically find tsconfig.json
        tsconfigRootDir: __dirname, // Base directory for tsconfig.json path
      },
    },
  },
  {
    // Custom rules or overrides can be placed here
    // For example, to allow 'any' type (often discouraged but useful during refactoring):
    // rules: {
    //   '@typescript-eslint/no-explicit-any': 'off',
    //   '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }]
    // }
  },
  {
    // Files/directories to ignore
    ignores: ["node_modules/", "dist/"],
  }
);
