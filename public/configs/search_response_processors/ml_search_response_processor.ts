/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateId } from '../../utils';
import { MLProcessor } from '../ml_processor';

/**
 * The ML processor in the context of search response
 */
export class MLSearchResponseProcessor extends MLProcessor {
  constructor() {
    super();
    this.id = generateId('ml_processor_search_response');
    this.optionalFields = [
      {
        id: 'one_to_one',
        type: 'boolean',
      },
      ...(this.optionalFields || []),
    ];
  }
}
