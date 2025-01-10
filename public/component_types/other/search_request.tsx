/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { BaseComponent } from '../base_component';

/**
 * A basic search request placeholder UI component.
 * Does not have any functionality.
 */
export class SearchRequest extends BaseComponent {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.SEARCH_REQUEST;
    this.label = 'Query';
    this.description = 'Search request';
    this.outputs = [
      {
        id: 'search_request',
        label: '',
      },
    ];
  }
}
