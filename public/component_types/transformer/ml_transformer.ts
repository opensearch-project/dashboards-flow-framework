/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { BaseTransformer } from './base_transformer';

/**
 * A generic ML inference transformer. Can be used across ingest, search request, and search response.
 * Under the hood, using the implemented ML inference processors.
 * Ref (ingest): https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/
 */
export class MLTransformer extends BaseTransformer {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.ML_TRANSFORMER;
    this.label = 'ML Processor';
    this.description = 'A general ML processor';
  }
}
