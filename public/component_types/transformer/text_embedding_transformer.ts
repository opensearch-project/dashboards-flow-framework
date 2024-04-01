/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MLTransformer } from '.';

/**
 * A specialized text embedding ML transformer UI component
 */
export class TextEmbeddingTransformer extends MLTransformer {
  constructor() {
    super();
    this.label = 'Text Embedding Transformer';
    this.description = 'A specialized ML transformer for embedding text';
    this.inputs = [];
    this.createFields = [
      {
        label: 'Model ID',
        name: 'modelId',
        type: 'string',
        optional: false,
        advanced: false,
      },
      {
        label: 'Input Field',
        name: 'inputField',
        type: 'string',
        optional: false,
        advanced: false,
      },
      {
        label: 'Output Field',
        name: 'outputField',
        type: 'string',
        optional: false,
        advanced: false,
      },
    ];
    this.outputs = [
      {
        label: this.label,
        baseClasses: this.baseClasses,
      },
    ];
  }
}
