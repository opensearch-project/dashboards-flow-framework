/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../utils';
import { BaseTransformer } from './base_transformer';

/**
 * A generic ML transformer UI component
 */
export class MLTransformer extends BaseTransformer {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.ML_TRANSFORMER;
    this.label = 'ML Transformer';
    this.description = 'A general ML transformer';
    this.baseClasses = [...this.baseClasses, this.type];
  }
}
