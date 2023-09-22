/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Interfaces here are primarily used for standardizing the data across
 * server & client side
 */

export interface IIndex {
  name: string;
  health: 'green' | 'yellow' | 'red';
}

// TODO: this will grow as more fields are defined and what frontend reqts there will be
export interface IWorkflow {
  name: string;
  id: string;
  description: string;
}
