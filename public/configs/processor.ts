/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IProcessorConfig, PROCESSOR_TYPE } from '../../common';
import { BaseConfig } from './base_config';

/**
 * A base processor config class.
 */
export abstract class Processor extends BaseConfig {
  type: PROCESSOR_TYPE;

  // No-op constructor. If there are general / defaults for field values, add in here.
  constructor() {
    super();
  }

  toObj() {
    return {
      ...super.toObj(),
      type: this.type,
    } as IProcessorConfig;
  }
}
