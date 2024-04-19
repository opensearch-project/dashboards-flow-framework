/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CATEGORY, COMPONENT_CLASS } from '../../../common';
import { MLTransformer } from '.';

/**
 * A specialized text embedding ML transformer UI component
 */
export class TextEmbeddingTransformer extends MLTransformer {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.TEXT_EMBEDDING_TRANSFORMER;
    this.label = 'Text Embedder';
    this.description = 'A specialized ML transformer for embedding text';
    this.categories = [COMPONENT_CATEGORY.INGEST];
    this.baseClasses = [...this.baseClasses, this.type];
    this.inputs = [
      {
        id: 'document',
        label: 'Document',
        baseClass: COMPONENT_CLASS.DOCUMENT,
        acceptMultiple: false,
      },
    ];
    this.createFields = [
      {
        label: 'Text Embedding Model',
        id: 'model',
        type: 'model',
        helpText: 'A text embedding model for embedding text.',
        helpLink:
          'https://opensearch.org/docs/latest/ml-commons-plugin/integrating-ml-models/#choosing-a-model',
      },
      {
        label: 'Input Field',
        id: 'inputField',
        type: 'string',
        helpText:
          'The name of the document field from which to obtain text for generating text embeddings.',
        helpLink:
          'https://opensearch.org/docs/latest/ingest-pipelines/processors/text-embedding/',
      },
      {
        label: 'Vector Field',
        id: 'vectorField',
        type: 'string',
        helpText: `The name of the document's vector field in which to store the generated text embeddings.`,
        helpLink:
          'https://opensearch.org/docs/latest/ingest-pipelines/processors/text-embedding/',
      },
    ];
    this.outputs = [
      {
        label: 'Transformed Document',
        baseClasses: [COMPONENT_CLASS.DOCUMENT],
      },
    ];
  }
}
