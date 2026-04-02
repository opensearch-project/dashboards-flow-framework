/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom';
import {
  generateId,
  getObjsFromJSONLines,
  getPlaceholdersFromQuery,
  containsSameValues,
  containsEmptyValues,
  injectParameters,
  camelCaseToTitleString,
  sanitizeJSONPath,
  isValidWorkflow,
  getObjFromJsonOrYamlString,
  hasProvisionedIngestResources,
  hasProvisionedSearchResources,
  getResourcesToBeForceDeleted,
  parseStringOrJson,
  sanitizeJSON,
  formatRouteServiceError,
  formatDisplayVersion,
  getFieldValue,
  parseErrorsFromIngestResponse,
  getTransformedQuery,
  getExistingVectorField,
  removeVectorFieldFromIndexMappings,
} from './utils';
import {
  WORKFLOW_RESOURCE_TYPE,
  WORKFLOW_STEP_TYPE,
  WorkflowConfig,
} from '../../common';

describe('utils', () => {
  describe('generateId', () => {
    test('generates unique IDs with prefix', () => {
      const id = generateId('test');
      expect(id).toMatch(/^test_/);
    });
    test('generates ID without prefix', () => {
      const id = generateId();
      expect(id).toMatch(/^_/);
    });
  });

  describe('getObjsFromJSONLines', () => {
    test('parses valid JSON lines', () => {
      expect(getObjsFromJSONLines('{"a":1}\n{"b":2}')).toEqual([
        { a: 1 },
        { b: 2 },
      ]);
    });
    test('returns empty array for invalid input', () => {
      expect(getObjsFromJSONLines('not json')).toEqual([]);
    });
    test('returns empty array for undefined', () => {
      expect(getObjsFromJSONLines(undefined)).toEqual([]);
    });
  });

  describe('getPlaceholdersFromQuery', () => {
    test('extracts placeholders', () => {
      expect(getPlaceholdersFromQuery('{{a}} and {{b}}')).toEqual(['a', 'b']);
    });
    test('deduplicates placeholders', () => {
      expect(getPlaceholdersFromQuery('{{a}} {{a}}')).toEqual(['a']);
    });
    test('returns empty for no placeholders', () => {
      expect(getPlaceholdersFromQuery('no placeholders')).toEqual([]);
    });
  });

  describe('containsSameValues', () => {
    test('returns true for same values', () => {
      expect(containsSameValues(['a', 'b'], ['b', 'a'])).toBe(true);
    });
    test('returns false for different lengths', () => {
      expect(containsSameValues(['a'], ['a', 'b'])).toBe(false);
    });
    test('returns false for different values', () => {
      expect(containsSameValues(['a', 'b'], ['a', 'c'])).toBe(false);
    });
  });

  describe('containsEmptyValues', () => {
    test('returns true when empty value exists', () => {
      expect(containsEmptyValues([{ name: 'a', value: '' }])).toBe(true);
    });
    test('returns false when all values present', () => {
      expect(containsEmptyValues([{ name: 'a', value: 'v' }])).toBe(false);
    });
  });

  describe('injectParameters', () => {
    test('replaces placeholders with values', () => {
      expect(
        injectParameters(
          [{ name: 'q', value: 'hello' }],
          'search {{q}}'
        )
      ).toBe('search hello');
    });
    test('replaces multiple occurrences', () => {
      expect(
        injectParameters(
          [{ name: 'x', value: '1' }],
          '{{x}} and {{x}}'
        )
      ).toBe('1 and 1');
    });
  });

  describe('camelCaseToTitleString', () => {
    test('converts snake_case to title', () => {
      expect(camelCaseToTitleString('hello_world')).toBe('Hello World');
    });
    test('handles single word', () => {
      expect(camelCaseToTitleString('hello')).toBe('Hello');
    });
  });

  describe('sanitizeJSONPath', () => {
    test('converts numeric dot notation to bracket', () => {
      expect(sanitizeJSONPath('$.results.0.value')).toBe('$.results[0].value');
    });
    test('wraps keys with dashes in quotes', () => {
      expect(sanitizeJSONPath('$.my-key.value')).toBe('$["my-key"].value');
    });
  });

  describe('isValidWorkflow', () => {
    test('returns true when name exists', () => {
      expect(isValidWorkflow({ name: 'test' })).toBe(true);
    });
    test('returns false when name missing', () => {
      expect(isValidWorkflow({})).toBe(false);
    });
    test('returns false for undefined', () => {
      expect(isValidWorkflow(undefined)).toBe(false);
    });
  });

  describe('getObjFromJsonOrYamlString', () => {
    test('parses JSON', () => {
      expect(getObjFromJsonOrYamlString('{"a":1}')).toEqual({ a: 1 });
    });
    test('parses YAML', () => {
      expect(getObjFromJsonOrYamlString('a: 1')).toEqual({ a: 1 });
    });
    test('returns undefined for invalid input', () => {
      expect(getObjFromJsonOrYamlString(undefined)).toBe('undefined');
    });
  });

  describe('hasProvisionedIngestResources', () => {
    test('returns true with ingest pipeline resource', () => {
      expect(
        hasProvisionedIngestResources({
          resourcesCreated: [
            { stepType: WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE, id: '1', type: '' },
          ],
        } as any)
      ).toBe(true);
    });
    test('returns true with index resource', () => {
      expect(
        hasProvisionedIngestResources({
          resourcesCreated: [
            { stepType: WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE, id: '1', type: '' },
          ],
        } as any)
      ).toBe(true);
    });
    test('returns false with no matching resources', () => {
      expect(
        hasProvisionedIngestResources({
          resourcesCreated: [
            { stepType: WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE, id: '1', type: '' },
          ],
        } as any)
      ).toBe(false);
    });
    test('returns false for undefined workflow', () => {
      expect(hasProvisionedIngestResources(undefined)).toBe(false);
    });
  });

  describe('hasProvisionedSearchResources', () => {
    test('returns true with search pipeline resource', () => {
      expect(
        hasProvisionedSearchResources({
          resourcesCreated: [
            { stepType: WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE, id: '1', type: '' },
          ],
        } as any)
      ).toBe(true);
    });
    test('returns false with no matching resources', () => {
      expect(hasProvisionedSearchResources({ resourcesCreated: [] } as any)).toBe(false);
    });
  });

  describe('getResourcesToBeForceDeleted', () => {
    test('returns comma-delimited IDs for matching resources', () => {
      expect(
        getResourcesToBeForceDeleted({
          resourcesCreated: [
            { type: WORKFLOW_RESOURCE_TYPE.INDEX_NAME, id: 'idx1', stepType: '' },
            { type: WORKFLOW_RESOURCE_TYPE.PIPELINE_ID, id: 'pipe1', stepType: '' },
          ],
        } as any)
      ).toBe('idx1,pipe1');
    });
    test('returns undefined when no matching resources', () => {
      expect(
        getResourcesToBeForceDeleted({ resourcesCreated: [] } as any)
      ).toBeUndefined();
    });
    test('returns undefined for undefined workflow', () => {
      expect(getResourcesToBeForceDeleted(undefined)).toBeUndefined();
    });
  });

  describe('parseStringOrJson', () => {
    test('parses JSON string into object', () => {
      expect(parseStringOrJson('{"a":1}')).toEqual({ a: 1 });
    });
    test('returns plain string if not JSON', () => {
      expect(parseStringOrJson('hello')).toBe('hello');
    });
    test('returns non-string values as-is', () => {
      expect(parseStringOrJson(42)).toBe(42);
    });
    test('returns falsy values as-is', () => {
      expect(parseStringOrJson(undefined)).toBeUndefined();
    });
  });

  describe('sanitizeJSON', () => {
    test('trims strings', () => {
      expect(sanitizeJSON('  hello  ')).toBe('hello');
    });
    test('recursively sanitizes arrays', () => {
      expect(sanitizeJSON(['  a  ', '  b  '])).toEqual(['a', 'b']);
    });
    test('passes through booleans', () => {
      expect(sanitizeJSON(true)).toBe(true);
    });
    test('strips __proto__ keys', () => {
      const result = sanitizeJSON({ __proto__: 'bad', safe: 'ok' });
      expect(result.__proto__).toBeUndefined();
      expect(result.safe).toBeDefined();
    });
    test('strips event handler keys', () => {
      const result = sanitizeJSON({ onclick: 'bad', safe: 'ok' });
      expect(result.onclick).toBeUndefined();
    });
    test('sanitizes known string fields', () => {
      expect(sanitizeJSON({ name: 123 })).toEqual({ name: '' });
      expect(sanitizeJSON({ name: 'valid' })).toEqual({ name: 'valid' });
    });
    test('sanitizes known array fields', () => {
      expect(sanitizeJSON({ tools: 'not-array' })).toEqual({ tools: [] });
    });
    test('sanitizes known obj fields', () => {
      expect(sanitizeJSON({ parameters: 'not-obj' })).toEqual({ parameters: {} });
    });
    test('sanitizes known boolean fields', () => {
      expect(sanitizeJSON({ include_output_in_agent_response: 'not-bool' })).toEqual({
        include_output_in_agent_response: false,
      });
    });
    test('returns empty obj for non-object/non-string/non-array/non-bool', () => {
      expect(sanitizeJSON(42)).toEqual({});
    });
  });

  describe('formatRouteServiceError', () => {
    test('formats error with body message', () => {
      expect(
        formatRouteServiceError({ body: { message: 'fail' } }, 'Prefix')
      ).toBe('Prefix: fail');
    });
    test('formats error with message', () => {
      expect(
        formatRouteServiceError({ message: 'fail' }, 'Prefix')
      ).toBe('Prefix: fail');
    });
    test('formats unknown error', () => {
      expect(formatRouteServiceError({}, 'Prefix')).toBe('Prefix: Unknown error');
    });
  });

  describe('formatDisplayVersion', () => {
    test('returns major.minor', () => {
      expect(formatDisplayVersion('3.0.0-beta1')).toBe('3.0');
    });
  });

  describe('getFieldValue', () => {
    test('finds top-level field', () => {
      expect(getFieldValue({ a: 1 }, 'a')).toBe(1);
    });
    test('finds nested field', () => {
      expect(getFieldValue({ a: { b: { c: 2 } } }, 'c')).toBe(2);
    });
    test('returns undefined for missing field', () => {
      expect(getFieldValue({ a: 1 }, 'z')).toBeUndefined();
    });
    test('returns undefined for non-object', () => {
      expect(getFieldValue(undefined as any, 'a')).toBeUndefined();
    });
  });

  describe('parseErrorsFromIngestResponse', () => {
    test('returns error reason when errors exist', () => {
      expect(
        parseErrorsFromIngestResponse({
          errors: true,
          items: [{ index: { error: { reason: 'bad mapping' } } }],
        })
      ).toBe('bad mapping');
    });
    test('returns undefined when no errors', () => {
      expect(parseErrorsFromIngestResponse({ errors: false })).toBeUndefined();
    });
  });

  describe('getTransformedQuery', () => {
    test('returns query_template value from last processor', () => {
      const config = {
        search: {
          enrichRequest: {
            processors: [
              { optionalFields: [{ id: 'query_template', value: 'query1' }] },
              { optionalFields: [{ id: 'query_template', value: 'query2' }] },
            ],
          },
        },
      } as unknown as WorkflowConfig;
      expect(getTransformedQuery(config)).toBe('query2');
    });
    test('returns undefined when no query_template', () => {
      const config = {
        search: { enrichRequest: { processors: [] } },
      } as unknown as WorkflowConfig;
      expect(getTransformedQuery(config)).toBeUndefined();
    });
  });

  describe('getExistingVectorField', () => {
    test('finds knn_vector field', () => {
      expect(
        getExistingVectorField({
          properties: { embedding: { type: 'knn_vector' }, title: { type: 'text' } },
        })
      ).toBe('embedding');
    });
    test('returns undefined when no vector field', () => {
      expect(
        getExistingVectorField({ properties: { title: { type: 'text' } } })
      ).toBeUndefined();
    });
  });

  describe('removeVectorFieldFromIndexMappings', () => {
    test('removes knn_vector field from mappings', () => {
      const mappings = JSON.stringify({
        properties: {
          embedding: { type: 'knn_vector', dimension: 3 },
          title: { type: 'text' },
        },
      });
      const result = JSON.parse(removeVectorFieldFromIndexMappings(mappings));
      expect(result.properties.embedding).toBeUndefined();
      expect(result.properties.title).toBeDefined();
    });
    test('returns original string on invalid JSON', () => {
      expect(removeVectorFieldFromIndexMappings('not json')).toBe('not json');
    });
  });
});
