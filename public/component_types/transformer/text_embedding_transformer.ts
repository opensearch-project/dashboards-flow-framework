/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { MLTransformer } from '.';

/**
 * A specialized text embedding ML transformer UI component
 */
export class TextEmbeddingTransformer extends MLTransformer {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.TEXT_EMBEDDING_TRANSFORMER;
    this.label = 'Text Embedding Transformer';
    this.description = 'A specialized ML transformer for embedding text';
    this.baseClasses = [...this.baseClasses, this.type];
    this.inputs = [];
    this.createFields = [
      {
        label: 'Model ID',
        id: 'modelId',
        type: 'select',
        selectType: 'model',
        helpText: 'The deployed text embedding model to use for embedding.',
        helpLink:
          'https://opensearch.org/docs/latest/ml-commons-plugin/integrating-ml-models/#choosing-a-model',
      },
      {
        label: 'Input Field',
        id: 'inputField',
        type: 'string',
        helpText:
          'The name of the field from which to obtain text for generating text embeddings.',
        helpLink:
          'https://opensearch.org/docs/latest/ingest-pipelines/processors/text-embedding/',
      },

      {
        label: 'Vector Field',
        id: 'vectorField',
        type: 'string',
        helpText:
          '	The name of the vector field in which to store the generated text embeddings.',
        helpLink:
          'https://opensearch.org/docs/latest/ingest-pipelines/processors/text-embedding/',
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
