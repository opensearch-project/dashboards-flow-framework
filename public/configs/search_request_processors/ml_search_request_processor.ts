/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigFieldType } from 'common';
import { generateId } from '../../utils';
import { MLProcessor } from '../ml_processor';

/**
 * The ML processor in the context of search request
 */
export class MLSearchRequestProcessor extends MLProcessor {
  constructor(includeQueryTemplate: boolean = true) {
    super();
    this.id = generateId('ml_processor_search_request');
    this.optionalFields = [
      ...(includeQueryTemplate
        ? [{
            id: 'query_template',
            type: 'jsonString' as ConfigFieldType,
          }]
        : []),
        ...(this.optionalFields || []),
    ];
  }
}
