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
} from '../../../../common';
import { getIngestNodesAndEdges } from './workflow_to_template_utils';

/**
 * Collection of utility fns to extract
 * data fields from a Workflow
 */
export function getSemanticSearchValues(
  workflow: Workflow
): { modelId: string; inputField: string; vectorField: string } {
  const formValues = getFormValues(workflow) as WorkspaceFormValues;
  const modelId = getModelId(workflow, formValues) as string;
  const transformerComponent = getTransformerComponent(
    workflow,
    formValues
  ) as ReactFlowComponent;
  const { inputField, vectorField } = componentDataToFormik(
    transformerComponent.data
  ) as { inputField: string; vectorField: string };
  return { modelId, inputField, vectorField };
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

function getModelId(
  workflow: Workflow,
  formValues: WorkspaceFormValues
): string | undefined {
  if (workflow?.ui_metadata?.workspace_flow) {
    const transformerComponent = getTransformerComponent(workflow, formValues);
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
        ) as WorkflowResource;
        return modelResource.id;
      } else {
        return model.id;
      }
    }
  }
}

function getTransformerComponent(
  workflow: Workflow,
  formValues: WorkspaceFormValues
): ReactFlowComponent | undefined {
  if (workflow?.ui_metadata?.workspace_flow) {
    const { ingestNodes } = getIngestNodesAndEdges(
      workflow?.ui_metadata?.workspace_flow?.nodes,
      workflow?.ui_metadata?.workspace_flow?.edges
    );
    return ingestNodes.find((ingestNode) =>
      ingestNode.data.baseClasses?.includes(COMPONENT_CLASS.ML_TRANSFORMER)
    );
  }
}
