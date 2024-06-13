/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateId } from '../../utils';
import { MLProcessor } from '../ml_processor';

/**
 * The ML processor in the context of ingest
 */
export class MLIngestProcessor extends MLProcessor {
  constructor() {
    super();
    this.id = generateId('ml_processor_ingest');
  }
}
