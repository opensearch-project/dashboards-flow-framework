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
      ...(this.optionalFields || []),
      {
        id: 'one_to_one',
        type: 'boolean',
      },
      {
        id: 'override',
        type: 'boolean',
      },
      // ext_output is not a field stored in the processor. We expose it as if it is,
      // to let users easily toggle saving the output under "ext.ml_inference" or not
      {
        id: 'ext_output',
        type: 'boolean',
        value: true,
      },
    ];
  }
}
