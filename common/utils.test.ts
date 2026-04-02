/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  toFormattedDate,
  prettifyErrorMessage,
  getCharacterLimitedString,
  customStringify,
  customStringifySingleLine,
  isDependentOnModels,
  isVectorSearchUseCase,
  isRAGUseCase,
} from './utils';
import { WORKFLOW_TYPE } from './';

describe('common/utils', () => {
  describe('toFormattedDate', () => {
    test('formats timestamp', () => {
      const result = toFormattedDate(0);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('prettifyErrorMessage', () => {
    test('returns unknown for empty string', () => {
      expect(prettifyErrorMessage('')).toBe('Unknown error is returned.');
    });
    test('returns unknown for "undefined"', () => {
      expect(prettifyErrorMessage('undefined')).toBe('Unknown error is returned.');
    });
    test('returns raw message when no permissions match', () => {
      expect(prettifyErrorMessage('some error')).toBe('some error');
    });
    test('formats permissions error', () => {
      const raw =
        'no permissions for [cluster:admin/opensearch/ml] and User [name=admin, backend_roles=[]';
      expect(prettifyErrorMessage(raw)).toBe(
        'User admin has no permissions to [cluster:admin/opensearch/ml].'
      );
    });
  });

  describe('getCharacterLimitedString', () => {
    test('returns full string when under limit', () => {
      expect(getCharacterLimitedString('hello', 10)).toBe('hello');
    });
    test('truncates with ellipsis when over limit', () => {
      expect(getCharacterLimitedString('hello world', 8)).toBe('hello...');
    });
    test('returns empty string for undefined', () => {
      expect(getCharacterLimitedString(undefined, 10)).toBe('');
    });
  });

  describe('customStringify', () => {
    test('pretty prints object', () => {
      expect(customStringify({ a: 1 })).toBe('{\n  "a": 1\n}');
    });
    test('pretty prints array', () => {
      expect(customStringify([1, 2])).toBe('[\n  1,\n  2\n]');
    });
  });

  describe('customStringifySingleLine', () => {
    test('stringifies without whitespace', () => {
      expect(customStringifySingleLine({ a: 1 })).toBe('{"a":1}');
    });
  });

  describe('isVectorSearchUseCase', () => {
    test('returns true for semantic search', () => {
      expect(isVectorSearchUseCase(WORKFLOW_TYPE.SEMANTIC_SEARCH)).toBe(true);
    });
    test('returns true for hybrid search', () => {
      expect(isVectorSearchUseCase(WORKFLOW_TYPE.HYBRID_SEARCH)).toBe(true);
    });
    test('returns false for undefined', () => {
      expect(isVectorSearchUseCase(undefined)).toBe(false);
    });
    test('returns false for non-vector type', () => {
      expect(isVectorSearchUseCase(WORKFLOW_TYPE.CUSTOM)).toBe(false);
    });
  });

  describe('isDependentOnModels', () => {
    test('returns true for vector search types', () => {
      expect(isDependentOnModels(WORKFLOW_TYPE.SEMANTIC_SEARCH)).toBe(true);
    });
    test('returns false for non-vector types', () => {
      expect(isDependentOnModels(WORKFLOW_TYPE.CUSTOM)).toBe(false);
    });
  });

  describe('isRAGUseCase', () => {
    test('returns true for RAG types', () => {
      expect(isRAGUseCase(WORKFLOW_TYPE.VECTOR_SEARCH_WITH_RAG)).toBe(true);
      expect(isRAGUseCase(WORKFLOW_TYPE.HYBRID_SEARCH_WITH_RAG)).toBe(true);
    });
    test('returns false for non-RAG types', () => {
      expect(isRAGUseCase(WORKFLOW_TYPE.SEMANTIC_SEARCH)).toBe(false);
    });
    test('returns false for undefined', () => {
      expect(isRAGUseCase(undefined)).toBe(false);
    });
  });
});
