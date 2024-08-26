/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PROCESSOR_TYPE } from '../../../common';
import { Processor } from '../processor';

/**
 * The normalization processor config. Used in search flows.
 */
export class NormalizationProcessor extends Processor {
  constructor() {
    super();
    this.type = PROCESSOR_TYPE.NORMALIZATION;
    this.name = 'Normalization Processor';
    this.fields = [];
    this.optionalFields = [
      {
        id: 'weights',
        type: 'string',
      },
      {
        id: 'normalization_technique',
        type: 'select',
        selectOptions: ['min_max', 'l2'],
      },
      {
        id: 'combination_technique',
        type: 'select',
        selectOptions: ['arithmetic_mean', 'geometric_mean', 'harmonic_mean'],
      },
      {
        id: 'description',
        type: 'string',
      },
      {
        id: 'tag',
        type: 'string',
      },
    ];
  }
}
