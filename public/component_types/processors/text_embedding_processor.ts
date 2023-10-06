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
 * A text embedding processor UI component
 */
export class TextEmbeddingProcessor
  extends BaseComponent
  implements IComponent {
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
  outputs: IComponentOutput[];

  constructor() {
    super();
    this.type = COMPONENT_CLASS.TEXT_EMBEDDING_PROCESSOR;
    this.label = 'Text Embedding Processor';
    this.description =
      'A text embedding ingest processor to be used in an ingest pipeline';
    this.category = COMPONENT_CATEGORY.INGEST_PROCESSORS;
    this.allowsCreation = false;
    this.isApplicationStep = false;
    this.allowedFlows = ['Ingest'];
    this.baseClasses = [this.type];
    this.inputs = [];
    this.fields = [
      {
        label: 'Model ID',
        type: 'string',
        optional: false,
        advanced: false,
      },
      {
        label: 'Input Field',
        type: 'string',
        optional: false,
        advanced: false,
      },
      {
        label: 'Output Field',
        type: 'string',
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
