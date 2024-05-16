/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_TYPE } from '../../../common';
import { BaseIngestProcessor } from './base_ingest_processor';

/**
 * A base model processor config
 */
export abstract class ModelProcessor extends BaseIngestProcessor {
  type: MODEL_TYPE;
  constructor() {
    super();
  }
}
