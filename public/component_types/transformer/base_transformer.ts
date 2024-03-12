/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CATEGORY, COMPONENT_CLASS } from '../../utils';
import { BaseComponent } from '../base_component';

/**
 * A base transformer UI component
 */
export abstract class BaseTransformer extends BaseComponent {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.TRANSFORMER;
    this.label = 'Transformer';
    this.categories = [COMPONENT_CATEGORY.INGEST, COMPONENT_CATEGORY.SEARCH];
    this.allowsCreation = false;
    this.baseClasses = [this.type];
  }
}
