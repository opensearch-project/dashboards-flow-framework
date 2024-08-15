/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { BaseComponent } from '../base_component';

/**
 * A base indexer UI component
 */
export class BaseIndexer extends BaseComponent {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.INDEXER;
    this.label = 'Index';
    this.description = 'An OpenSearch index';
    this.inputs = [
      {
        id: 'input',
        label: 'Input',
        acceptMultiple: false,
      },
    ];
    this.outputs = [
      {
        id: 'output',
        label: 'Output',
      },
    ];
  }
}
