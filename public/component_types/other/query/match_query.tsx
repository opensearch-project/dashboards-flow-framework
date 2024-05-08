/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../../common';
import { Query } from './query';

/**
 * A basic match query placeholder UI component.
 * Does not have any functionality.
 */
export class MatchQuery extends Query {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.MATCH_QUERY;
    this.label = 'Match Query';
    this.description = 'An OpenSearch match query';
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
