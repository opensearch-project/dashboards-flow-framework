/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PROCESSOR_TYPE } from '../../common';
import { Processor } from './processor';

/**
 * A base split processor config. Used in ingest and search flows.
 * The interfaces are identical across ingest / search response processors.
 */
export abstract class SplitProcessor extends Processor {
  constructor() {
    super();
    this.type = PROCESSOR_TYPE.SPLIT;
    this.name = 'Split Processor';
    this.fields = [
      {
        id: 'field',
        type: 'string',
      },
      {
        id: 'separator',
        type: 'string',
      },
    ];
    this.optionalFields = [
      // TODO: although listed in docs, this field doesn't seem to exist. Fails
      // at regular API level.
      // {
      //   id: 'preserve_field',
      //   type: 'boolean',
      //   value: false,
      // },
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
