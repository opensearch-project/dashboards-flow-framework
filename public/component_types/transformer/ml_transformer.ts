/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS, PROCESSOR_CONTEXT } from '../../../common';
import { BaseTransformer } from './base_transformer';

/**
 * A base ML transformer UI component representing ML inference processors.
 * Input/output descriptions depends on the processor context (ingest, search request, or search response)
 */
export class MLTransformer extends BaseTransformer {
  constructor(context: PROCESSOR_CONTEXT) {
    super('ML Processor', 'A general ML processor', context);
    this.type = COMPONENT_CLASS.ML_TRANSFORMER;
  }
}
