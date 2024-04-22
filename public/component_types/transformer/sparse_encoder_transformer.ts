/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CATEGORY, COMPONENT_CLASS } from '../../../common';
import { MLTransformer } from '.';

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
    this.categories = [COMPONENT_CATEGORY.INGEST];
    this.baseClasses = [...this.baseClasses, this.type];
    this.inputs = [
      {
        id: 'document',
        label: 'Document',
        baseClass: COMPONENT_CLASS.DOCUMENT,
        acceptMultiple: false,
      },
      {
        id: 'query',
        label: 'Query',
        baseClass: COMPONENT_CLASS.QUERY,
        acceptMultiple: false,
      },
    ];
    this.createFields = [
      {
        label: 'Sparse Encoding Model',
        id: 'model',
        type: 'model',
        helpText:
          'A sparse encoding model to be used for generating sparse vectors.',
        helpLink:
          'https://opensearch.org/docs/latest/ml-commons-plugin/integrating-ml-models/#choosing-a-model',
      },
      {
        label: 'Input Field',
        id: 'inputField',
        type: 'string',
        helpText:
          'The name of the document field from which to obtain text for generating sparse embeddings.',
        helpLink:
          'https://opensearch.org/docs/latest/ingest-pipelines/processors/sparse-encoding/#configuration-parameters',
      },
      {
        label: 'Vector Field',
        id: 'vectorField',
        type: 'string',
        helpText: `The name of the document's vector field in which to store the generated sparse embeddings.`,
        helpLink:
          'https://opensearch.org/docs/latest/ingest-pipelines/processors/sparse-encoding/#configuration-parameters',
      },
    ];
    this.outputs = [
      {
        label: 'Transformed Document',
        baseClasses: [COMPONENT_CLASS.DOCUMENT],
      },
      {
        label: 'Transformed Query',
        baseClasses: [COMPONENT_CLASS.QUERY],
      },
    ];
  }
}
