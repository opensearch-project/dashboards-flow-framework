/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseConfig } from '../base_config';

/**
 * A base ingest processor config
 */
export abstract class BaseIngestProcessor extends BaseConfig {
  name: string;
  type: string;
  constructor() {
    super();
    this.name = '';
    this.type = '';
  }
}
