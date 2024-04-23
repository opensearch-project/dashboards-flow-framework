/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CATEGORY, COMPONENT_CLASS } from '../../../common';
import { BaseComponent } from '../base_component';

/**
 * A basic Document placeholder UI component.
 * Does not have any functionality.
 */
export class Document extends BaseComponent {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.DOCUMENT;
    this.label = 'Document';
    this.description = 'A document to be ingested';
    this.categories = [COMPONENT_CATEGORY.INGEST];
    this.allowsCreation = false;
    this.baseClasses = [this.type];
    this.inputs = [];
    this.outputs = [
      {
        label: this.label,
        baseClasses: this.baseClasses,
      },
    ];
  }
}
