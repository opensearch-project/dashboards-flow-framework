/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PROCESSOR_TYPE, SORT_ORDER } from '../../common';
import { Processor } from './processor';

/**
 * A base sort processor config. Used in ingest and search flows.
 * The interfaces are identical across ingest / search response processors.
 */
export abstract class SortProcessor extends Processor {
  constructor() {
    super();
    this.type = PROCESSOR_TYPE.SORT;
    this.name = 'Sort Processor';
    this.fields = [
      {
        id: 'field',
        type: 'string',
      },
    ];
    this.optionalFields = [
      {
        id: 'order',
        type: 'select',
        selectOptions: [SORT_ORDER.ASC, SORT_ORDER.DESC],
        value: SORT_ORDER.ASC,
      },
      {
        id: 'target_field',
        type: 'string',
      },
      {
        id: 'description',
        type: 'textArea',
      },
      {
        id: 'tag',
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
