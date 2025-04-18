/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PROCESSOR_TYPE } from '../../../common';
import { Processor } from '../processor';
import { generateId } from '../../utils';

/**
 * The normalization processor config. Used in search flows.
 */
export class NormalizationProcessor extends Processor {
  constructor() {
    super();
    this.id = generateId('normalization_processor');
    this.type = PROCESSOR_TYPE.NORMALIZATION;
    this.name = 'Normalization Processor';
    this.fields = [];
    this.optionalFields = [
      {
        id: 'weights',
        type: 'string',
        value: '0.5, 0.5',
      },
      {
        id: 'normalization_technique',
        type: 'select',
        selectOptions: ['min_max', 'l2'],
        value: 'min_max',
      },
      {
        id: 'combination_technique',
        type: 'select',
        selectOptions: ['arithmetic_mean', 'geometric_mean', 'harmonic_mean'],
        value: 'arithmetic_mean',
      },
      {
        id: 'description',
        type: 'textArea',
      },
      {
        id: 'tag',
        type: 'string',
      },
    ];
  }
}
