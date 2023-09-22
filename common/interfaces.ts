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
