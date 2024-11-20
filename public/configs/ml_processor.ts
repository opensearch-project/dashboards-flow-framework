/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PROCESSOR_TYPE } from '../../common';
import { Processor } from './processor';

/**
 * A base ML processor config. Used in ingest and search flows.
 * The interfaces are identical across ingest / search request / search response processors.
 */
export abstract class MLProcessor extends Processor {
  constructor() {
    super();
    this.type = PROCESSOR_TYPE.ML;
    this.name = 'ML Inference Processor';
    this.fields = [
      {
        id: 'model',
        type: 'model',
      },
      {
        id: 'input_map',
        type: 'inputMapArray',
      },
      {
        id: 'output_map',
        type: 'mapArray',
      },
    ];
    this.optionalFields = [
      {
        id: 'model_config',
        type: 'json',
      },
      {
        id: 'full_response_path',
        type: 'boolean',
        value: false,
      },
      {
        id: 'ignore_missing',
        type: 'boolean',
        value: false,
      },
      {
        id: 'ignore_failure',
        type: 'boolean',
        value: false,
      },
      {
        id: 'max_prediction_tasks',
        type: 'number',
        value: 10,
      },
      {
        id: 'tag',
        type: 'string',
      },
      {
        id: 'description',
        type: 'string',
      },
    ];
  }
}
