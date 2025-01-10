/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { BaseComponent } from '../base_component';

/**
 * A basic search response placeholder UI component.
 * Does not have any functionality.
 */
export class SearchResponse extends BaseComponent {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.SEARCH_RESPONSE;
    this.label = 'Search Results';
    this.inputs = [{ id: 'search_response', label: '', acceptMultiple: false }];
  }
}
