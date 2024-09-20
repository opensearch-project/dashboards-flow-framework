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
    this.label = 'Search Request';
    this.description = 'An OpenSearch search request';
    this.outputs = [
      {
        id: 'search_request',
        label: this.label,
      },
    ];
  }
}
