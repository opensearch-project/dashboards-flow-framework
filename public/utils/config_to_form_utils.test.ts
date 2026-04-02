/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom';
import { getInitialValue } from './config_to_form_utils';

describe('config_to_form_utils', () => {
  describe('getInitialValue', () => {
    test('returns "[]" for jsonArray', () => {
      expect(getInitialValue('jsonArray')).toBe('[]');
    });
    test('returns [] for map', () => {
      expect(getInitialValue('map')).toEqual([]);
    });
    test('returns [] for mapArray', () => {
      expect(getInitialValue('mapArray')).toEqual([]);
    });
    test('returns [] for inputMapArray', () => {
      expect(getInitialValue('inputMapArray')).toEqual([]);
    });
    test('returns [] for outputMapArray', () => {
      expect(getInitialValue('outputMapArray')).toEqual([]);
    });
    test('returns false for boolean', () => {
      expect(getInitialValue('boolean')).toBe(false);
    });
    test('returns 0 for number', () => {
      expect(getInitialValue('number')).toBe(0);
    });
  });
});
