/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
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
  }
}
