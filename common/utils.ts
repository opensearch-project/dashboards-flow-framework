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
  COMPONENT_CATEGORY,
  NODE_CATEGORY,
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
  const ingestId1 = generateId('text_embedding_processor');
  const ingestId2 = generateId('knn_index');
  const ingestGroupId = generateId(COMPONENT_CATEGORY.INGEST);

  const searchId1 = generateId('text_embedding_processor');
  const searchId2 = generateId('knn_index');
  const searchGroupId = generateId(COMPONENT_CATEGORY.SEARCH);

  const ingestNodes = [
    {
      id: ingestGroupId,
      position: { x: 400, y: 400 },
      type: NODE_CATEGORY.INGEST_GROUP,
      data: { label: COMPONENT_CATEGORY.INGEST },
      style: {
        width: 900,
        height: 400,
        overflowX: 'auto',
        overflowY: 'auto',
      },
      className: 'reactflow__group-node__ingest',
      selectable: true,
    },
    {
      id: ingestId1,
      position: { x: 100, y: 70 },
      data: initComponentData(
        new TextEmbeddingTransformer().toObj(),
        ingestId1
      ),
      type: NODE_CATEGORY.CUSTOM,
      parentNode: ingestGroupId,
      extent: 'parent',
      draggable: true,
    },
    {
      id: ingestId2,
      position: { x: 500, y: 70 },
      data: initComponentData(new KnnIndexer().toObj(), ingestId2),
      type: NODE_CATEGORY.CUSTOM,
      parentNode: ingestGroupId,
      extent: 'parent',
      draggable: true,
    },
  ] as ReactFlowComponent[];

  const searchNodes = [
    {
      id: searchGroupId,
      position: { x: 400, y: 1000 },
      type: NODE_CATEGORY.SEARCH_GROUP,
      data: { label: COMPONENT_CATEGORY.SEARCH },
      style: {
        width: 900,
        height: 400,
        overflowX: 'auto',
        overflowY: 'auto',
      },
      className: 'reactflow__group-node__search',
      selectable: true,
    },
    {
      id: searchId1,
      position: { x: 100, y: 70 },
      data: initComponentData(
        new TextEmbeddingTransformer().toObj(),
        searchId1
      ),
      type: NODE_CATEGORY.CUSTOM,
      parentNode: searchGroupId,
      extent: 'parent',
      draggable: true,
    },
    {
      id: searchId2,
      position: { x: 500, y: 70 },
      data: initComponentData(new KnnIndexer().toObj(), searchId2),
      type: NODE_CATEGORY.CUSTOM,
      parentNode: searchGroupId,
      extent: 'parent',
      draggable: true,
    },
  ] as ReactFlowComponent[];

  return {
    nodes: [...ingestNodes, ...searchNodes],
    edges: [] as ReactFlowEdge[],
  };
}

// TODO: implement this
/**
 * Validates the UI workflow state.
 * Note we don't have to validate connections since that is done via input/output handlers.
 * But we need to validate there are no open connections
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
