/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { BaseComponent } from '../base_component';

/**
 * A basic document placeholder UI component.
 * Does not have any functionality.
 */
export class Document extends BaseComponent {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.DOCUMENT;
    this.label = 'Document';
    this.outputs = [
      {
        id: 'document',
        label: '',
      },
    ];
  }
}
