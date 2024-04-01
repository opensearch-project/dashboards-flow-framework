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
  const textEmbeddingFields = formValues[textEmbeddingTransformerNodeId];

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
            output_field: textEmbeddingFields['outputField'],
            configurations: {
              description: 'A text embedding ingest pipeline',
              processors: [
                {
                  text_embedding: {
                    model_id: '${{user_inputs.model_id}}',
                    field_map: {
                      '${{user_inputs.input_field}}':
                        '${{user_inputs.output_field}}',
                    },
                  },
                },
              ],
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
    // {
    //   id: searchId1,
    //   position: { x: 100, y: 70 },
    //   data: initComponentData(
    //     new TextEmbeddingTransformer().toObj(),
    //     searchId1
    //   ),
    //   type: NODE_CATEGORY.CUSTOM,
    //   parentNode: searchGroupId,
    //   extent: 'parent',
    //   draggable: true,
    // deletable: false,
    // },
    // {
    //   id: searchId2,
    //   position: { x: 500, y: 70 },
    //   data: initComponentData(new KnnIndexer().toObj(), searchId2),
    //   type: NODE_CATEGORY.CUSTOM,
    //   parentNode: searchGroupId,
    //   extent: 'parent',
    //   draggable: true,
    // deletable: false,
    // },
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
