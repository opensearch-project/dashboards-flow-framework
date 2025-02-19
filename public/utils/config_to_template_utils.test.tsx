/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom';
import { updatePathForExpandedQuery } from './config_to_template_utils';

describe('config_to_template_utils', () => {
  beforeEach(() => {});
  describe('updatePathForExpandedQuery', () => {
    test('term query', () => {
      expect(
        updatePathForExpandedQuery('query.term.a') === 'query.term.a.value'
      );
      expect(
        updatePathForExpandedQuery('query.term.a.value') ===
          'query.term.a.value'
      );
      expect(
        updatePathForExpandedQuery('$.query.term.a') === '$.query.term.a.value'
      );
      expect(
        updatePathForExpandedQuery('a.b.c.d.query.term.a') ===
          'a.b.c.d.query.term.a.value'
      );
      expect(
        updatePathForExpandedQuery('query.bool.must[0].term.a') ===
          'query.bool.must[0].term.a.value'
      );
    });
    test('prefix query', () => {
      expect(
        updatePathForExpandedQuery('query.prefix.a') === 'query.prefix.a.value'
      );
      expect(
        updatePathForExpandedQuery('query.prefix.a.value') ===
          'query.prefix.a.value'
      );
    });
    test('fuzzy query', () => {
      expect(
        updatePathForExpandedQuery('query.fuzzy.a') === 'query.fuzzy.a.value'
      );
      expect(
        updatePathForExpandedQuery('query.fuzzy.a.value') ===
          'query.fuzzy.a.value'
      );
    });
    test('wildcard query', () => {
      expect(
        updatePathForExpandedQuery('query.wildcard.a') ===
          'query.wildcard.a.wildcard'
      );
      expect(
        updatePathForExpandedQuery('query.wildcard.a.wildcard') ===
          'query.wildcard.a.wildcard'
      );
    });
    test('regexp query', () => {
      expect(
        updatePathForExpandedQuery('query.regexp.a') === 'query.regexp.a.value'
      );
      expect(
        updatePathForExpandedQuery('query.regexp.a.value') ===
          'query.regexp.a.value'
      );
    });
    test('match query', () => {
      expect(
        updatePathForExpandedQuery('query.match.a') === 'query.match.a.query'
      );
      expect(
        updatePathForExpandedQuery('query.match.a.query') ===
          'query.match.a.query'
      );
    });
    test('match bool prefix query', () => {
      expect(
        updatePathForExpandedQuery('query.match_bool_prefix.a') ===
          'query.match_bool_prefix.a.query'
      );
      expect(
        updatePathForExpandedQuery('query.match_bool_prefix.a.query') ===
          'query.match_bool_prefix.a.query'
      );
    });
    test('match phrase query', () => {
      expect(
        updatePathForExpandedQuery('query.match_phrase.a') ===
          'query.match_phrase.a.query'
      );
      expect(
        updatePathForExpandedQuery('query.match_phrase.a.query') ===
          'query.match_phrase.a.query'
      );
    });
    test('match phrase prefix query', () => {
      expect(
        updatePathForExpandedQuery('query.match_phrase_prefix.a') ===
          'query.match_phrase_prefix.a.query'
      );
      expect(
        updatePathForExpandedQuery('query.match_phrase_prefix.a.query') ===
          'query.match_phrase_prefix.a.query'
      );
    });
    test('aggs query', () => {
      expect(
        updatePathForExpandedQuery('aggs.avg_a.avg.field') ===
          'aggregations.avg_a.avg.field'
      );
      expect(
        updatePathForExpandedQuery('aggs.b.c.d.aggs.avg_a.avg.field') ===
          'aggregations.b.c.d.aggregations.avg_a.avg.field'
      );
    });
  });
});
