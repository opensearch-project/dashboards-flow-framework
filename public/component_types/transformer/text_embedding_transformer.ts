/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { MLTransformer } from './ml_transformer';

/**
 * A specialized text embedding ML transformer UI component
 */
export class TextEmbeddingTransformer extends MLTransformer {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.TEXT_EMBEDDING_TRANSFORMER;
    this.label = 'Text Embedder';
    this.description = 'A specialized ML transformer for embedding text';
  }
}
