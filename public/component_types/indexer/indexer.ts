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
        acceptMultiple: false,
      },
    ];
    this.fields = [
      {
        label: 'Index Name',
        id: 'indexName',
        type: 'select',
      },
    ];
    this.createFields = [
      {
        label: 'Index Name',
        id: 'indexName',
        type: 'string',
      },
      // {
      //   label: 'Mappings',
      //   id: 'indexMappings',
      //   type: 'json',
      //   placeholder: 'Enter an index mappings JSON blob...',
      // },
    ];
    // this.outputs = [
    //   {
    //     label: this.label,
    //     baseClasses: this.baseClasses,
    //   },
    // ];
    this.outputs = [];
  }
}
