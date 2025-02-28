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
      expect(updatePathForExpandedQuery('query.term.a')).toEqual(
        'query.term.a.value'
      );
      expect(updatePathForExpandedQuery('query.term.a.value')).toEqual(
        'query.term.a.value'
      );
      expect(updatePathForExpandedQuery('query.term.abc')).toEqual(
        'query.term.abc.value'
      );
      expect(updatePathForExpandedQuery('query.term.abc.value')).toEqual(
        'query.term.abc.value'
      );
      expect(updatePathForExpandedQuery('$.query.term.abc.value')).toEqual(
        '$.query.term.abc.value'
      );
      expect(updatePathForExpandedQuery('query.bool.must[0].term.abc')).toEqual(
        'query.bool.must[0].term.abc.value'
      );
      expect(
        updatePathForExpandedQuery('query.bool.must[0].term.ab_c')
      ).toEqual('query.bool.must[0].term.ab_c.value');
    });
    test('prefix query', () => {
      expect(updatePathForExpandedQuery('query.prefix.a')).toEqual(
        'query.prefix.a.value'
      );
      expect(updatePathForExpandedQuery('query.prefix.a.value')).toEqual(
        'query.prefix.a.value'
      );
      expect(updatePathForExpandedQuery('query.prefix.abc')).toEqual(
        'query.prefix.abc.value'
      );
      expect(updatePathForExpandedQuery('query.prefix.abc.value')).toEqual(
        'query.prefix.abc.value'
      );
    });
    test('fuzzy query', () => {
      expect(updatePathForExpandedQuery('query.fuzzy.a')).toEqual(
        'query.fuzzy.a.value'
      );
      expect(updatePathForExpandedQuery('query.fuzzy.a.value')).toEqual(
        'query.fuzzy.a.value'
      );
      expect(updatePathForExpandedQuery('query.fuzzy.abc')).toEqual(
        'query.fuzzy.abc.value'
      );
      expect(updatePathForExpandedQuery('query.fuzzy.abc.value')).toEqual(
        'query.fuzzy.abc.value'
      );
    });
    test('wildcard query', () => {
      expect(updatePathForExpandedQuery('query.wildcard.a')).toEqual(
        'query.wildcard.a.wildcard'
      );
      expect(updatePathForExpandedQuery('query.wildcard.a.wildcard')).toEqual(
        'query.wildcard.a.wildcard'
      );
      expect(updatePathForExpandedQuery('query.wildcard.abc')).toEqual(
        'query.wildcard.abc.wildcard'
      );
      expect(updatePathForExpandedQuery('query.wildcard.abc.wildcard')).toEqual(
        'query.wildcard.abc.wildcard'
      );
    });
    test('regexp query', () => {
      expect(updatePathForExpandedQuery('query.regexp.a')).toEqual(
        'query.regexp.a.value'
      );
      expect(updatePathForExpandedQuery('query.regexp.a.value')).toEqual(
        'query.regexp.a.value'
      );
      expect(updatePathForExpandedQuery('query.regexp.abc')).toEqual(
        'query.regexp.abc.value'
      );
      expect(updatePathForExpandedQuery('query.regexp.abc.value')).toEqual(
        'query.regexp.abc.value'
      );
    });
    test('match query', () => {
      expect(updatePathForExpandedQuery('query.match.a')).toEqual(
        'query.match.a.query'
      );
      expect(updatePathForExpandedQuery('query.match.a.query')).toEqual(
        'query.match.a.query'
      );
      expect(updatePathForExpandedQuery('query.match.item_text')).toEqual(
        'query.match.item_text.query'
      );
      expect(updatePathForExpandedQuery('query.match.item_text.query')).toEqual(
        'query.match.item_text.query'
      );
    });
    test('match bool prefix query', () => {
      expect(
        updatePathForExpandedQuery('query.match_bool_prefix.a.query')
      ).toEqual('query.match_bool_prefix.a.query');
      expect(
        updatePathForExpandedQuery('query.match_bool_prefix.item_text')
      ).toEqual('query.match_bool_prefix.item_text.query');
      expect(
        updatePathForExpandedQuery('query.match_bool_prefix.item_text.query')
      ).toEqual('query.match_bool_prefix.item_text.query');
    });
    test('match phrase query', () => {
      expect(updatePathForExpandedQuery('query.match_phrase.a.query')).toEqual(
        'query.match_phrase.a.query'
      );
      expect(
        updatePathForExpandedQuery('query.match_phrase.item_text')
      ).toEqual('query.match_phrase.item_text.query');
      expect(
        updatePathForExpandedQuery('query.match_phrase.item_text.query')
      ).toEqual('query.match_phrase.item_text.query');
    });
    test('match phrase prefix query', () => {
      expect(
        updatePathForExpandedQuery('query.match_phrase_prefix.a.query')
      ).toEqual('query.match_phrase_prefix.a.query');
      expect(
        updatePathForExpandedQuery('query.match_phrase_prefix.item_text')
      ).toEqual('query.match_phrase_prefix.item_text.query');
      expect(
        updatePathForExpandedQuery('query.match_phrase_prefix.item_text.query')
      ).toEqual('query.match_phrase_prefix.item_text.query');
    });
    test('aggs query', () => {
      expect(updatePathForExpandedQuery('aggs.avg_a.avg.field')).toEqual(
        'aggregations.avg_a.avg.field'
      );
      expect(
        updatePathForExpandedQuery('aggs.b.c.d.aggs.avg_a.avg.field')
      ).toEqual('aggregations.b.c.d.aggregations.avg_a.avg.field');
      expect(
        updatePathForExpandedQuery('aggs.b.c.d_e_f.aggs.avg_a.avg.field_abc')
      ).toEqual('aggregations.b.c.d_e_f.aggregations.avg_a.avg.field_abc');
    });
  });
});
