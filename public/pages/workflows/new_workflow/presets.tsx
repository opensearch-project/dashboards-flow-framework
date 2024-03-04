/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  START_FROM_SCRATCH_WORKFLOW_NAME,
  Workflow,
  WorkspaceFlowState,
} from '../../../../common';

// TODO: fetch from the backend when the workflow library is complete.
/**
 * Used to fetch the library of preset workflows to provide to users.
 */
export function getPresetWorkflows(): Workflow[] {
  return [
    {
      name: 'Semantic Search',
      description:
        'This semantic search workflow includes the essential ingestion and search pipelines that covers the most common search use cases.',
      useCase: 'SEMANTIC_SEARCH',
      template: {},
      workspaceFlowState: {
        nodes: [],
        edges: [],
      } as WorkspaceFlowState,
    },
    {
      name: 'Semantic Search with Reranking',
      description:
        'This semantic search workflow variation includes an ML processor to rerank fetched results.',
      useCase: 'SEMANTIC_SEARCH_WITH_RERANK',
      template: {},
      workspaceFlowState: {
        nodes: [],
        edges: [],
      } as WorkspaceFlowState,
    },
    {
      name: START_FROM_SCRATCH_WORKFLOW_NAME,
      description:
        'Build your workflow from scratch according to your specific use cases. Start by adding components for your ingest or query needs.',
      useCase: '',
      template: {},
      workspaceFlowState: {
        nodes: [],
        edges: [],
      } as WorkspaceFlowState,
    },
    {
      name: 'Visual Search',
      description:
        'Build an application that will return results based on images.',
      useCase: 'SEMANTIC_SEARCH',
      template: {},
      workspaceFlowState: {
        nodes: [],
        edges: [],
      } as WorkspaceFlowState,
    },
  ] as Workflow[];
}
