/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CATEGORY, COMPONENT_CLASS } from '../../utils';
import { BaseComponent } from '../base_component';
import {
  IComponent,
  IComponentField,
  IComponentInput,
  IComponentOutput,
  UIFlow,
} from '../interfaces';

/**
 * A k-NN index UI component
 */
export class KnnIndex extends BaseComponent implements IComponent {
  type: COMPONENT_CLASS;
  label: string;
  description: string;
  category: COMPONENT_CATEGORY;
  allowsCreation: boolean;
  isApplicationStep: boolean;
  allowedFlows: UIFlow[];
  baseClasses: COMPONENT_CLASS[];
  inputs: IComponentInput[];
  fields: IComponentField[];
  createFields: IComponentField[];
  outputs: IComponentOutput[];

  constructor() {
    super();
    this.type = COMPONENT_CLASS.KNN_INDEX;
    this.label = 'k-NN Index';
    this.description = 'A k-NN Index to be used as a vector store';
    this.category = COMPONENT_CATEGORY.INDICES;
    this.allowsCreation = true;
    this.isApplicationStep = false;
    // TODO: 'other' may not be how this is stored. the idea is 'other' allows
    // for placement outside of the ingest or query flows- typically something
    // that will be referenced/used as input across multiple flows
    this.allowedFlows = ['Ingest', 'Query', 'Other'];
    this.baseClasses = [this.type];
    this.inputs = [
      {
        id: 'text-embedding-processor',
        label: 'Text embedding processor',
        baseClass: COMPONENT_CLASS.TEXT_EMBEDDING_PROCESSOR,
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
      // we don't need to expose "settings" here since it will be index.knn by default
      // just let users customize the mappings
      // TODO: figure out how to handle defaults for all of these values. maybe toggle between
      // simple form inputs vs. complex JSON editor
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
