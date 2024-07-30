/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateId } from '../../utils';
import { SplitProcessor } from '../split_processor';

/**
 * The split processor in the context of ingest
 */
export class SplitIngestProcessor extends SplitProcessor {
  constructor() {
    super();
    this.id = generateId('split_processor_ingest');
  }
}
