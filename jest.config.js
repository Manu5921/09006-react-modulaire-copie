// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '^.+\.module\.(css|sass|scss)$': 'identity-obj-proxy',
    // Handle CSS imports (without CSS modules)
    '^.+\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    // Handle image imports
    '^.+\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': '<rootDir>/__mocks__/fileMock.js',
    // Handle module aliases
    // Ajustez ces alias si nécessaire pour correspondre à votre tsconfig.json
    '^@/components/(.*)$': '<rootDir>/src/components/$1', // Si vous avez des composants partagés hors modules
    '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@/public/(.*)$': '<rootDir>/public/$1',
  },
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json', // Assurez-vous que ce chemin est correct
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/test-contact-output/',
    '<rootDir>/test-faq-output/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
  ],
  collectCoverageFrom: [
    'src/modules/**/*.{js,jsx,ts,tsx}', // Cibler la couverture sur les composants des modules
    '!src/**/*.d.ts',
    '!src/**/index.{js,jsx,ts,tsx}', // Exclure les fichiers "barrel"
    // Exclure les parties du générateur lui-même de la couverture des tests unitaires des composants
    '!src/cli/**/*',
    '!src/figma/**/*',
    '!src/generator/**/*',
    '!src/templates/**/*',
  ],
  coverageThreshold: {
    global: { // Optionnel: définissez des seuils de couverture
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
