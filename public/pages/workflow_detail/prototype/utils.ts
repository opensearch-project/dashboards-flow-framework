/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Shared utility fns and constants used in the prototyping page.
 */

// UTILITY FNS
export function getFormattedJSONString(obj: {}): string {
  return Object.values(obj).length > 0 ? JSON.stringify(obj, null, '\t') : '';
}

// CONSTANTS
export type WorkflowValues = {
  modelId: string;
};

export type SemanticSearchValues = WorkflowValues & {
  inputField: string;
  vectorField: string;
};
export type NeuralSparseValues = SemanticSearchValues;
export type HybridSearchValues = SemanticSearchValues & {
  searchPipelineId: string;
};
