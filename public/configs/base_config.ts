/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IConfig, IConfigField } from '../../common';

/**
 * A base UI config class.
 */
export abstract class BaseConfig implements IConfig {
  id: string;
  fields: IConfigField[];

  // No-op constructor. If there are general / defaults for field values, add in here.
  constructor() {
    this.id = '';
    this.fields = [];
  }

  // Persist a standard toObj() fn that all component classes can use. This is necessary
  // so we have standard JS Object when serializing comoponent state in redux.
  toObj() {
    return Object.assign({}, this);
  }
}
