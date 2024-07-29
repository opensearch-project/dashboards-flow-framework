/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateId } from '../../utils';
import { SortProcessor } from '../sort_processor';

/**
 * The sort processor in the context of ingest
 */
export class SortIngestProcessor extends SortProcessor {
  constructor() {
    super();
    this.id = generateId('sort_processor_ingest');
  }
}
