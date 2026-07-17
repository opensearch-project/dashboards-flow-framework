/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  rootDir: '../',
  roots: ['<rootDir>'],
  coverageDirectory: './coverage',
  setupFilesAfterEnv: ['jest-location-mock', '<rootDir>/test/setup.ts'],
  // we mock any non-js-related files and return an empty module. This is needed due to errors
  // when jest tries to interpret these types of files.
  moduleNameMapper: {
    '\\.(css|less|scss|sass|svg)$': '<rootDir>/test/mocks/empty_mock.ts',
    '@elastic/eui/lib/services/accessibility/html_id_generator':
      '<rootDir>/test/mocks/html_id_generator.ts',

    '^uuid$': '<rootDir>/test/mocks/uuid_mock.ts',
    '^uuid/.*$': '<rootDir>/test/mocks/uuid_mock.ts',
    // query-string v9 is pure ESM; this shim restores the default-import shape
    // (`import qs from 'query-string'`) under Jest's CJS transform.
    '^query-string$': '<rootDir>/test/mocks/query_string_mock.js',
  },
  testEnvironment: 'jest-environment-jsdom',
  testEnvironmentOptions: {
    // Set the default URL so window.location.origin is 'http://localhost:5601' rather than
    // 'http://localhost', avoiding the need for tests to mock window.location.origin.
    url: 'http://localhost:5601',
  },
  // Retain Jest 28 snapshot defaults; Jest 29 flipped escapeString and printBasicPrototype to false.
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
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
  // Transform selected ESM-only deps that ship untranspiled `export`/`import` syntax.
  // jsonpath-plus (+ jsep deps) and query-string (+ its ESM deps) are pure ESM and must
  // be babel-transformed for the CJS Jest runtime.
  transformIgnorePatterns: [
    '[/\\\\]node_modules(?![/\\\\](jsonpath-plus|jsep|@jsep-plugin[/\\\\][^/\\\\]+|query-string|decode-uri-component|filter-obj|split-on-first))[/\\\\].+\\.js$',
  ],
};
