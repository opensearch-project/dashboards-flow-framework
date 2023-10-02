/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CATEGORY } from '../../utils';
import {
  IComponent,
  IComponentField,
  IComponentInput,
  IComponentOutput,
  UIFlow,
  BaseClass,
} from '../interfaces';

/**
 * A text embedding processor UI component
 */
export class TextEmbeddingProcessor implements IComponent {
  id: string;
  type: BaseClass;
  label: string;
  description: string;
  category: COMPONENT_CATEGORY;
  allowsCreation: boolean;
  isApplicationStep: boolean;
  allowedFlows: UIFlow[];
  baseClasses: BaseClass[];
  inputs: IComponentInput[];
  fields: IComponentField[];
  outputs: IComponentOutput[];

  constructor() {
    this.id = 'text_embedding_processor';
    this.type = 'text_embedding_processor';
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
        id: this.id,
        label: this.label,
        baseClasses: this.baseClasses,
      },
    ];
  }

  async init(): Promise<any> {
    return new TextEmbeddingProcessor();
  }
}
