/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { BaseComponent } from '../base_component';

/**
 * A basic Results placeholder UI component.
 * Does not have any functionality.
 */
export class Results extends BaseComponent {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.RESULTS;
    this.label = 'Results';
    this.description = 'OpenSearch results';
    this.inputs = [{ id: 'input', label: 'Input', acceptMultiple: false }];
  }
}
