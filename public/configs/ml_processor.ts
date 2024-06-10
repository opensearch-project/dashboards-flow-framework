/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseConfig } from './base_config';

/**
 * A generic ML processor config. Used in ingest and search flows.
 * The interfaces are identical across ingest / search request / search response processors.
 */
export abstract class MLProcessor extends BaseConfig {
  constructor() {
    super();
    this.fields = [
      {
        label: 'Model',
        id: 'model',
        type: 'model',
        helpText: 'The model ID.',
        helpLink:
          'https://opensearch.org/docs/latest/ml-commons-plugin/integrating-ml-models/#choosing-a-model',
      },
      {
        label: 'Input Map',
        id: 'inputMap',
        type: 'string',
        helpText: `An array specifying how to map fields from the ingested document to the model’s input.`,
        helpLink:
          'https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/#configuration-parameters',
      },
      {
        label: 'Output Map',
        id: 'outputMap',
        type: 'string',
        helpText: `An array specifying how to map the model’s output to new fields.`,
        helpLink:
          'https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/#configuration-parameters',
      },
    ];
  }
}
