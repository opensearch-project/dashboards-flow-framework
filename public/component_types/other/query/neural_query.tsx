/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../../common';
import { Query } from './query';

/**
 * A basic neural query placeholder UI component.
 * Does not have any functionality.
 */
export class NeuralQuery extends Query {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.NEURAL_QUERY;
    this.label = 'Neural query';
    this.description = 'An OpenSearch neural query';
    this.inputs = [];
    this.baseClasses = [...this.baseClasses, this.type];
    this.outputs = [
      {
        label: this.label,
        baseClasses: this.baseClasses,
      },
    ];
  }
}
