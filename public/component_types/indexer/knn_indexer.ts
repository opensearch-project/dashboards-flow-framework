/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Indexer } from './indexer';

/**
 * A specialized indexer component for vector/K-NN indices
 */
export class KnnIndexer extends Indexer {
  constructor() {
    super();
    this.label = 'K-NN Indexer';
    this.description = 'A specialized indexer for K-NN indices';
    this.createFields = [
      // @ts-ignore
      ...this.createFields,
      // TODO: finalize what to expose / what to have for defaults here
      // {
      //   label: 'K-NN Settings',
      //   id: 'knnSettings',
      //   type: 'json',
      //   placeholder: 'Enter K-NN settings JSON blob...',
      // },
    ];
  }
}
