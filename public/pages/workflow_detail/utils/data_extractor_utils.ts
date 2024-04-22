/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ReactFlowComponent,
  COMPONENT_CLASS,
  componentDataToFormik,
  ModelFormValue,
  MODEL_CATEGORY,
  WorkspaceFormValues,
  Workflow,
  WORKFLOW_RESOURCE_TYPE,
  WorkflowResource,
  NODE_CATEGORY,
  WORKFLOW_STEP_TYPE,
} from '../../../../common';
import { getNodesAndEdgesUnderParent } from './workflow_to_template_utils';

/**
 * Collection of utility fns to extract
 * data fields from a Workflow
 */

export function getIndexName(workflow: Workflow): string | undefined {
  if (workflow?.ui_metadata?.workspace_flow) {
    const indexerComponent = getIndexerComponent(workflow);
    if (indexerComponent) {
      const { indexName } = componentDataToFormik(indexerComponent.data) as {
        indexName: string;
      };
      return indexName;
    }
  }
}

// Returns values for neural search use cases. Note many of them
// persist the same values to use during ingest and search, so we keep the naming general
export function getNeuralSearchValues(
  workflow: Workflow
): {
  modelId: string;
  inputField: string;
  vectorField: string;
  searchPipelineId?: string;
} {
  const modelId = getModelId(workflow) as string;
  const transformerComponent = getTransformerComponent(
    workflow
  ) as ReactFlowComponent;
  const { inputField, vectorField } = componentDataToFormik(
    transformerComponent.data
  ) as { inputField: string; vectorField: string };

  const searchPipelineId = workflow.resourcesCreated?.find(
    (resource) =>
      resource.stepType === WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE
  )?.id;

  return { modelId, inputField, vectorField, searchPipelineId };
}

function getFormValues(workflow: Workflow): WorkspaceFormValues | undefined {
  if (workflow?.ui_metadata?.workspace_flow) {
    const formValues = {} as WorkspaceFormValues;
    workflow.ui_metadata.workspace_flow.nodes.forEach((node) => {
      formValues[node.id] = componentDataToFormik(node.data);
    });
    return formValues;
  }
}

function getModelId(workflow: Workflow): string | undefined {
  if (workflow?.ui_metadata?.workspace_flow) {
    const transformerComponent = getTransformerComponent(workflow);
    if (transformerComponent) {
      const { model } = componentDataToFormik(transformerComponent.data) as {
        model: ModelFormValue;
        inputField: string;
        vectorField: string;
      };

      // if it's a pretrained model, we created a new model ID, parse from resources
      if (model.category === MODEL_CATEGORY.PRETRAINED) {
        const modelResource = workflow.resourcesCreated?.find(
          (resource) => resource.type === WORKFLOW_RESOURCE_TYPE.MODEL_ID
        );
        return modelResource?.id;
      } else {
        return model.id;
      }
    }
  }
}

function getTransformerComponent(
  workflow: Workflow
): ReactFlowComponent | undefined {
  if (workflow?.ui_metadata?.workspace_flow) {
    const { nodes: ingestNodes } = getNodesAndEdgesUnderParent(
      NODE_CATEGORY.INGEST_GROUP,
      workflow?.ui_metadata?.workspace_flow?.nodes,
      workflow?.ui_metadata?.workspace_flow?.edges
    );
    return ingestNodes.find((ingestNode) =>
      ingestNode.data.baseClasses?.includes(COMPONENT_CLASS.ML_TRANSFORMER)
    );
  }
}

function getIndexerComponent(
  workflow: Workflow
): ReactFlowComponent | undefined {
  if (workflow?.ui_metadata?.workspace_flow) {
    const { nodes: ingestNodes } = getNodesAndEdgesUnderParent(
      NODE_CATEGORY.INGEST_GROUP,
      workflow?.ui_metadata?.workspace_flow?.nodes,
      workflow?.ui_metadata?.workspace_flow?.edges
    );
    return ingestNodes.find((ingestNode) =>
      ingestNode.data.baseClasses?.includes(COMPONENT_CLASS.INDEXER)
    );
  }
}
