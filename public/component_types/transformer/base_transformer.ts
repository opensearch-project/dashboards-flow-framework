/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { BaseComponent } from '../base_component';

/**
 * A base transformer UI component
 */
export abstract class BaseTransformer extends BaseComponent {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.TRANSFORMER;
    this.label = 'Transformer';
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
