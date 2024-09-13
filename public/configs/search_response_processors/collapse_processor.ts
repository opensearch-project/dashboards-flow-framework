/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PROCESSOR_TYPE } from '../../../common';
import { Processor } from '../processor';
import { generateId } from '../../utils';

/**
 * The collapse processor config. Used in search flows.
 */
export class CollapseProcessor extends Processor {
  constructor() {
    super();
    this.id = generateId('collapse_processor');
    this.type = PROCESSOR_TYPE.COLLAPSE;
    this.name = 'Collapse Processor';
    this.fields = [
      {
        id: 'field',
        type: 'string',
      },
    ];
    this.optionalFields = [
      {
        id: 'context_prefix',
        type: 'string',
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
