/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CATEGORY, COMPONENT_CLASS } from '../../utils';
import { BaseComponent } from '../base_component';

/**
 * A base indexer UI component
 */
export class Indexer extends BaseComponent {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.INDEXER;
    this.label = 'Indexer';
    this.description = 'A general indexer';
    this.categories = [COMPONENT_CATEGORY.INGEST, COMPONENT_CATEGORY.SEARCH];
    this.allowsCreation = true;
    this.baseClasses = [this.type];
    this.inputs = [
      {
        id: 'transformer',
        label: 'Transformer',
        // TODO: may need to change to be looser. it should be able to take
        // in other component types
        baseClass: COMPONENT_CLASS.TRANSFORMER,
        optional: false,
        acceptMultiple: false,
      },
    ];
    this.fields = [
      {
        label: 'Index Name',
        name: 'indexName',
        type: 'select',
        optional: false,
        advanced: false,
      },
    ];
    this.createFields = [
      {
        label: 'Index Name',
        name: 'indexName',
        type: 'string',
        optional: false,
        advanced: false,
      },
      {
        label: 'Mappings',
        name: 'indexMappings',
        type: 'json',
        placeholder: 'Enter an index mappings JSON blob...',
        optional: false,
        advanced: false,
      },
    ];
    this.outputs = [
      {
        label: this.label,
        baseClasses: this.baseClasses,
      },
    ];
  }
}
