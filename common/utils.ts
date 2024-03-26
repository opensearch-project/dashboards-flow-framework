/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import moment from 'moment';
import {
  WorkspaceFlowState,
  ReactFlowComponent,
  initComponentData,
  TextEmbeddingTransformer,
  KnnIndexer,
  generateId,
  ReactFlowEdge,
  TemplateFlows,
  WorkflowTemplate,
  DATE_FORMAT_PATTERN,
} from './';

// TODO: implement this and remove hardcoded return values
/**
 * Converts a ReactFlow workspace flow to a backend-compatible set of ingest and/or search sub-workflows,
 * along with a provision sub-workflow if resources are to be created.
 */
export function toTemplateFlows(
  workspaceFlow: WorkspaceFlowState
): TemplateFlows {
  return {
    provision: {
      user_params: {} as Map<string, any>,
      nodes: [],
      edges: [],
    },
  };
}

// TODO: implement this and remove hardcoded return values
/**
 * Converts a backend set of provision/ingest/search sub-workflows into a UI-compatible set of
 * ReactFlow nodes and edges
 */
export function toWorkspaceFlow(
  templateFlows: TemplateFlows
): WorkspaceFlowState {
  const id1 = generateId('text_embedding_processor');
  const id2 = generateId('text_embedding_processor');
  const id3 = generateId('knn_index');
  const dummyNodes = [
    {
      id: id1,
      position: { x: 0, y: 500 },
      data: initComponentData(new TextEmbeddingTransformer().toObj(), id1),
      type: 'customComponent',
    },
    {
      id: id2,
      position: { x: 0, y: 200 },
      data: initComponentData(new TextEmbeddingTransformer().toObj(), id2),
      type: 'customComponent',
    },
    {
      id: id3,
      position: { x: 500, y: 500 },
      data: initComponentData(new KnnIndexer().toObj(), id3),
      type: 'customComponent',
    },
  ] as ReactFlowComponent[];

  return {
    nodes: dummyNodes,
    edges: [] as ReactFlowEdge[],
  };
}

// TODO: implement this
/**
 * Validates the UI workflow state.
 * Note we don't have to validate connections since that is done via input/output handlers.
 */
export function validateWorkspaceFlow(
  workspaceFlow: WorkspaceFlowState
): boolean {
  return true;
}

// TODO: implement this
/**
 * Validates the backend template. May be used when parsing persisted templates on server-side,
 * or when importing/exporting on the UI.
 */
export function validateWorkflowTemplate(
  workflowTemplate: WorkflowTemplate
): boolean {
  return true;
}

export function toFormattedDate(timestampMillis: number): String {
  return moment(new Date(timestampMillis)).format(DATE_FORMAT_PATTERN);
}
