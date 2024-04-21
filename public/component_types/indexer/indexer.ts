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
        id: 'document',
        label: 'Document',
        baseClass: COMPONENT_CLASS.DOCUMENT,
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
