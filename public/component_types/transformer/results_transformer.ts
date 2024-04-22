/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../utils';
import { BaseTransformer } from './base_transformer';

/**
 * A generic results transformer UI component
 */
export class ResultsTransformer extends BaseTransformer {
  constructor() {
    super();
    (this.type = COMPONENT_CLASS.RESULTS_TRANSFORMER),
      (this.label = 'Results Transformer');
    this.description = 'A general results transformer';
    this.baseClasses = [...this.baseClasses, this.type];
    this.inputs = [
      {
        id: 'results',
        label: 'Results',
        baseClass: COMPONENT_CLASS.RESULTS,
        acceptMultiple: false,
      },
    ];
    this.outputs = [
      {
        label: 'Transformed Results',
        baseClasses: [COMPONENT_CLASS.RESULTS],
      },
    ];
  }
}
