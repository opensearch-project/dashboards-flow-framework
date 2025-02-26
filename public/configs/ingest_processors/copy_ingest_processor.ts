/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PROCESSOR_TYPE } from '../../../common';
import { generateId } from '../../utils';
import { Processor } from '../processor';

/**
 * The copy ingest processor
 */
export class CopyIngestProcessor extends Processor {
  constructor() {
    super();
    this.name = 'Copy Processor';
    this.type = PROCESSOR_TYPE.COPY;
    this.id = generateId('copy_processor_ingest');
    this.fields = [
      {
        id: 'source_field',
        type: 'string',
      },
      {
        id: 'target_field',
        type: 'string',
      },
    ];
    this.optionalFields = [
      {
        id: 'ignore_missing',
        type: 'boolean',
        value: false,
      },
      {
        id: 'override_target',
        type: 'boolean',
        value: false,
      },
      {
        id: 'remove_source',
        type: 'boolean',
        value: false,
      },
      {
        id: 'ignore_failure',
        type: 'boolean',
        value: false,
      },
      {
        id: 'description',
        type: 'textArea',
      },
      {
        id: 'tag',
        type: 'string',
      },
    ];
  }
}
