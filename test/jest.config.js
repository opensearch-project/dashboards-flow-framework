/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  rootDir: '../',
  roots: ['<rootDir>'],
  coverageDirectory: './coverage',
  // we mock any non-js-related files and return an empty module. This is needed due to errors
  // when jest tries to interpret these types of files.
  moduleNameMapper: {
    '\\.(css|less|scss|sass|svg)$': '<rootDir>/test/mocks/empty_mock.ts',
    // Direct mock for the html_id_generator module that's causing the error
    '@elastic/eui/lib/services/accessibility/html_id_generator':
      '<rootDir>/test/mocks/html_id_generator.ts',

    // UUID mocks as backup
    '^uuid$': '<rootDir>/test/mocks/uuid_mock.ts',
    '^uuid/.*$': '<rootDir>/test/mocks/uuid_mock.ts',
  },
  testEnvironment: 'jest-environment-jsdom',
  coverageReporters: ['lcov', 'text', 'cobertura'],
  testMatch: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx',
    '!**/models/**',
    '!**/node_modules/**',
    '!**/index.js',
    '!<rootDir>/public/app.js',
    '!<rootDir>/index.js',
    '!<rootDir>/babel.config.js',
    '!<rootDir>/test/**',
    '!<rootDir>/server/**',
    '!<rootDir>/coverage/**',
    '!<rootDir>/scripts/**',
    '!<rootDir>/build/**',
    '!**/vendor/**',
  ],
  clearMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/offline-module-cache/'],
  testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: ['<rootDir>/node_modules'],
};
