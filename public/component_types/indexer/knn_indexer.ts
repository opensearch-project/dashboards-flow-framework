/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { BaseIndexer } from './base_indexer';

/**
 * A specialized indexer component for vector/K-NN indices
 */
export class KnnIndexer extends BaseIndexer {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.KNN_INDEXER;
    this.label = 'K-NN Index';
    this.description = 'A specialized indexer for K-NN indices';
  }
}
