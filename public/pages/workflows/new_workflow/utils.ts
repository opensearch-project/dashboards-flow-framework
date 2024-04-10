/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarkerType } from 'reactflow';
import {
  WorkspaceFlowState,
  ReactFlowComponent,
  initComponentData,
  TextEmbeddingTransformer,
  KnnIndexer,
  generateId,
  ReactFlowEdge,
  COMPONENT_CATEGORY,
  NODE_CATEGORY,
  USE_CASE,
  WorkflowTemplate,
  COMPONENT_CLASS,
  START_FROM_SCRATCH_WORKFLOW_NAME,
  DEFAULT_NEW_WORKFLOW_NAME,
} from '../../../../common';

// Fn to produce the complete preset template with all necessary UI metadata.
// Some UI metadata we want to generate on-the-fly using our component classes we have on client-side.
// Thus, we only persist a minimal subset of a full template on server-side. We generate
// the rest dynamically based on the set of supported preset use cases.
export function enrichPresetWorkflowWithUiMetadata(
  presetWorkflow: Partial<WorkflowTemplate>
): WorkflowTemplate {
  let workspaceFlowState = {} as WorkspaceFlowState;
  switch (presetWorkflow.use_case) {
    case USE_CASE.SEMANTIC_SEARCH: {
      workspaceFlowState = fetchSemanticSearchWorkspaceFlow();
      break;
    }
    default: {
      workspaceFlowState = fetchEmptyWorkspaceFlow();
      break;
    }
  }

  return {
    ...presetWorkflow,
    ui_metadata: {
      ...presetWorkflow.ui_metadata,
      workspace_flow: workspaceFlowState,
    },
  } as WorkflowTemplate;
}

function fetchEmptyWorkspaceFlow(): WorkspaceFlowState {
  return {
    nodes: [],
    edges: [],
  };
}

function fetchSemanticSearchWorkspaceFlow(): WorkspaceFlowState {
  const ingestId1 = generateId(COMPONENT_CLASS.TEXT_EMBEDDING_TRANSFORMER);
  const ingestId2 = generateId(COMPONENT_CLASS.KNN_INDEXER);
  const ingestGroupId = generateId(COMPONENT_CATEGORY.INGEST);
  const searchGroupId = generateId(COMPONENT_CATEGORY.SEARCH);
  const edgeId = generateId('edge');

  const ingestNodes = [
    {
      id: ingestGroupId,
      position: { x: 400, y: 400 },
      type: NODE_CATEGORY.INGEST_GROUP,
      data: { label: COMPONENT_CATEGORY.INGEST },
      style: {
        width: 900,
        height: 400,
      },
      className: 'reactflow__group-node__ingest',
      selectable: true,
      draggable: false,
      deletable: false,
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
      draggable: false,
      deletable: false,
    },
    {
      id: ingestId2,
      position: { x: 500, y: 70 },
      data: initComponentData(new KnnIndexer().toObj(), ingestId2),
      type: NODE_CATEGORY.CUSTOM,
      parentNode: ingestGroupId,
      extent: 'parent',
      draggable: false,
      deletable: false,
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
      },
      className: 'reactflow__group-node__search',
      selectable: true,
      draggable: false,
      deletable: false,
    },
  ] as ReactFlowComponent[];

  return {
    nodes: [...ingestNodes, ...searchNodes],
    edges: [
      {
        id: edgeId,
        key: edgeId,
        source: ingestId1,
        target: ingestId2,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        zIndex: 2,
        deletable: false,
      },
    ] as ReactFlowEdge[],
  };
}

// Utility fn to process workflow names from their presentable/readable titles
// on the UI, to a valid name format.
// This leads to less friction if users decide to save the name later on.
export function processWorkflowName(workflowName: string): string {
  return workflowName === START_FROM_SCRATCH_WORKFLOW_NAME
    ? DEFAULT_NEW_WORKFLOW_NAME
    : toSnakeCase(workflowName);
}

function toSnakeCase(text: string): string {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
}
