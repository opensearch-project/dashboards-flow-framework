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
        type: 'mapArray',
      },
      {
        id: 'output_map',
        type: 'mapArray',
      },
    ];
  }
}
