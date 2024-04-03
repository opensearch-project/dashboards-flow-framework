/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import moment from 'moment';
import { MarkerType } from 'reactflow';
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
  WorkspaceFormValues,
} from './';

// TODO: implement this and remove hardcoded return values
/**
 * Given a ReactFlow workspace flow and the set of current form values within such flow,
 * generate a backend-compatible set of sub-workflows.
 *
 */
export function toTemplateFlows(
  workspaceFlow: WorkspaceFlowState,
  formValues: WorkspaceFormValues
): TemplateFlows {
  const textEmbeddingTransformerNodeId = Object.keys(formValues).find((key) =>
    key.includes('text_embedding')
  ) as string;
  const knnIndexerNodeId = Object.keys(formValues).find((key) =>
    key.includes('knn')
  ) as string;
  const textEmbeddingFields = formValues[textEmbeddingTransformerNodeId];
  const knnIndexerFields = formValues[knnIndexerNodeId];

  return {
    provision: {
      nodes: [
        {
          id: 'create_ingest_pipeline',
          type: 'create_ingest_pipeline',
          user_inputs: {
            pipeline_id: 'test-pipeline',
            model_id: textEmbeddingFields['modelId'],
            input_field: textEmbeddingFields['inputField'],
            output_field: textEmbeddingFields['vectorField'],
            configurations: {
              description: 'A text embedding ingest pipeline',
              processors: [
                {
                  text_embedding: {
                    model_id: textEmbeddingFields['modelId'],
                    field_map: {
                      [textEmbeddingFields['inputField']]:
                        textEmbeddingFields['vectorField'],
                    },
                  },
                },
              ],
            },
          },
        },
        {
          id: 'create_index',
          type: 'create_index',
          previous_node_inputs: {
            create_ingest_pipeline: 'pipeline_id',
          },
          user_inputs: {
            index_name: knnIndexerFields['indexName'],
            configurations: {
              settings: {
                default_pipeline: '${{create_ingest_pipeline.pipeline_id}}',
              },
              mappings: {
                properties: {
                  [textEmbeddingFields['vectorField']]: {
                    type: 'knn_vector',
                    dimension: 768,
                    method: {
                      engine: 'lucene',
                      space_type: 'l2',
                      name: 'hnsw',
                      parameters: {},
                    },
                  },
                  [textEmbeddingFields['inputField']]: {
                    type: 'text',
                  },
                },
              },
            },
          },
        },
      ],
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
      draggable: true,
      deletable: false,
    },
    {
      id: ingestId2,
      position: { x: 500, y: 70 },
      data: initComponentData(new KnnIndexer().toObj(), ingestId2),
      type: NODE_CATEGORY.CUSTOM,
      parentNode: ingestGroupId,
      extent: 'parent',
      draggable: true,
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
