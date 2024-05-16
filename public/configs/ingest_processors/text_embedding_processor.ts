/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_TYPE } from '../../../common';
import { generateId } from '../../utils';
import { ModelProcessor } from './model_processor';

/**
 * A specialized text embedding processor config
 */
export class TextEmbeddingProcessor extends ModelProcessor {
  constructor() {
    super();
    this.id = generateId('text_embedding_processor');
    this.name = 'Text embedding processor';
    this.type = MODEL_TYPE.TEXT_EMBEDDING;
    this.fields = [
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
  }
}
