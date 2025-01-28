/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CATEGORY, COMPONENT_CLASS } from '../../../common';
import { BaseComponent } from '../base_component';

/**
 * A basic index placeholder UI component. Input/output depends on ingest or search context.
 * Does not have any functionality.
 */
export class BaseIndex extends BaseComponent {
  constructor(category: COMPONENT_CATEGORY) {
    super();
    this.type = COMPONENT_CLASS.INDEX;
    this.label = 'Index';
    this.description =
      category === COMPONENT_CATEGORY.INGEST
        ? 'Index for ingesting data'
        : 'Retrieval index';
    this.inputs = [
      {
        id:
          category === COMPONENT_CATEGORY.INGEST
            ? 'document'
            : 'search_request',
        label: category === COMPONENT_CATEGORY.INGEST ? '' : 'Search Request',
        acceptMultiple: false,
      },
    ];
    this.outputs =
      category === COMPONENT_CATEGORY.INGEST
        ? []
        : [
            {
              id: 'search_response',
              label: 'Search Response',
            },
          ];
  }
}
