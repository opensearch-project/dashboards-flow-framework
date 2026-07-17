/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * query-string v9 is a pure ESM module whose index.js has only a default export.
 * After the Babel + babel-plugin-add-module-exports pipeline the consumer's
 * `interopRequireDefault(require('query-string')).default` can resolve to `undefined`.
 *
 * This shim is the moduleNameMapper target for 'query-string'. It loads the real
 * package via a hardcoded node_modules path (relative to this file) so Jest's
 * moduleNameMapper does not intercept the require and recurse into this file.
 * query-string is hoisted to the parent repo's node_modules, four levels up from
 * this file (test/mocks -> test -> plugin -> plugins -> repo root).
 */

// eslint-disable-next-line import/no-dynamic-require
const mod = require('../../../../node_modules/query-string/index.js');

// Recover the actual API regardless of which shape the transform produced.
const api = mod && mod.__esModule && typeof mod.stringify !== 'function' ? mod.default : mod;

module.exports = {
  __esModule: true,
  default: api,
};
