/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateId } from '../../utils';
import { SortProcessor } from '../sort_processor';

/**
 * The sort processor in the context of search response
 */
export class SortSearchResponseProcessor extends SortProcessor {
  constructor() {
    super();
    this.id = generateId('sort_processor_search_response');
  }
}
