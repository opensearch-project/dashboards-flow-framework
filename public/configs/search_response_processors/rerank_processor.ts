/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PROCESSOR_TYPE } from '../../../common';
import { Processor } from '../processor';
import { generateId } from '../../utils';

/**
 * The rerank processor config. Used in search flows.
 * For now, only supports the by_field type. For details, see
 * https://opensearch.org/docs/latest/search-plugins/search-pipelines/rerank-processor/#the-by_field-rerank-type
 */
export class RerankProcessor extends Processor {
  constructor() {
    super();
    this.id = generateId('rerank_processor');
    this.type = PROCESSOR_TYPE.RERANK;
    this.name = 'Rerank Processor';
    this.fields = [
      {
        id: 'target_field',
        type: 'string',
      },
    ];
    this.optionalFields = [
      {
        id: 'remove_target_field',
        type: 'boolean',
        value: false,
      },
      {
        id: 'keep_previous_score',
        type: 'boolean',
        value: false,
      },
      {
        id: 'tag',
        type: 'string',
      },
      {
        id: 'description',
        type: 'string',
      },
      {
        id: 'ignore_failure',
        type: 'boolean',
        value: false,
      },
    ];
  }
}
