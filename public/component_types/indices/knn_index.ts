/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CATEGORY, COMPONENT_CLASS } from '../../../common';
import { BaseIndex } from './base_index';

/**
 * A basic knn index placeholder UI component. Input/output depends on ingest or search context.
 * Does not have any functionality.
 */
export class KnnIndex extends BaseIndex {
  constructor(category: COMPONENT_CATEGORY) {
    super(category);
    this.type = COMPONENT_CLASS.KNN_INDEX;
    this.label = 'k-NN Index';
    this.description = 'A specialized k-NN index';
  }
}
