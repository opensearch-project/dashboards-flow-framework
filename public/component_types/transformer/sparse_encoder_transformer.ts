/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { MLTransformer } from './ml_transformer';

/**
 * A specialized sparse encoder ML transformer UI component
 */
export class SparseEncoderTransformer extends MLTransformer {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.SPARSE_ENCODER_TRANSFORMER;
    this.label = 'Sparse Encoder';
    this.description =
      'A specialized ML transformer to perform sparse encoding';
  }
}
