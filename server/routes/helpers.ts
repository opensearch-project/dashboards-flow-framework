/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DEFAULT_NEW_WORKFLOW_STATE_TYPE,
  INDEX_NOT_FOUND_EXCEPTION,
  MODEL_ALGORITHM,
  MODEL_STATE,
  Model,
  ModelDict,
  ModelInterface,
  WORKFLOW_RESOURCE_TYPE,
  WORKFLOW_STATE,
  Workflow,
  WorkflowDict,
  WorkflowResource,
} from '../../common';

// OSD does not provide an interface for this response, but this is following the suggested
// implementations. To prevent typescript complaining, leaving as loosely-typed 'any'
export function generateCustomError(res: any, err: any) {
  return res.customError({
    statusCode: err.statusCode || 500,
    body: {
      message: err.message,
      attributes: {
        error: err.body?.error || err.message,
      },
    },
  });
}

// Helper fn to filter out backend errors that we don't want to propagate on the frontend.
export function isIgnorableError(error: any): boolean {
  return error.body?.error?.type === INDEX_NOT_FOUND_EXCEPTION;
}

// Convert backend workflow into frontend workflow obj
export function toWorkflowObj(hitSource: any, id: string): Workflow {
  return {
    id,
    name: hitSource.name,
    use_case: hitSource.use_case,
    description: hitSource.description || '',
    version: hitSource.version,
    workflows: hitSource.workflows,
    ui_metadata: hitSource.ui_metadata,
    lastUpdated: hitSource.last_updated_time,
    lastLaunched: hitSource.last_provisioned_time,
  } as Workflow;
}

// TODO: can remove or simplify if we can fetch all data from a single API call. Tracking issue:
// https://github.com/opensearch-project/flow-framework/issues/171
// Current implementation combines 2 search responses to create a single set of workflows with
// static information + state information
export function getWorkflowsFromResponses(
  workflowHits: any[],
  workflowStateHits: any[]
): WorkflowDict {
  const workflowDict = {} as WorkflowDict;
  workflowHits.forEach((workflowHit: any) => {
    const hitSource = workflowHit._source;
    workflowDict[workflowHit._id] = toWorkflowObj(hitSource, workflowHit._id);
    const workflowStateHit = workflowStateHits.find(
      (workflowStateHit) => workflowStateHit._id === workflowHit._id
    );
    const workflowState = getWorkflowStateFromResponse(
      workflowStateHit?._source?.state
    );
    const workflowError = workflowStateHit?._source?.error;
    const workflowResourcesCreated = getResourcesCreatedFromResponse(
      workflowStateHit?._source?.resources_created
    );
    workflowDict[workflowHit._id] = {
      ...workflowDict[workflowHit._id],
      // @ts-ignore
      state: workflowState,
      error: workflowError,
      resourcesCreated: workflowResourcesCreated,
    };
  });
  return workflowDict;
}

export function getModelsFromResponses(modelHits: any[]): ModelDict {
  const modelDict = {} as ModelDict;
  modelHits.forEach((modelHit: any) => {
    // search model API returns hits for each deployed model chunk. ignore these hits
    if (modelHit._source.chunk_number === undefined) {
      const modelId = modelHit._id;

      // the persisted model interface (if available) is a mix of an obj and string.
      // We parse the string values for input/output to have a complete
      // end-to-end JSONSchema obj
      let indexedModelInterface = modelHit._source.interface as
        | { input: string; output: string }
        | undefined;
      let modelInterface = undefined as ModelInterface | undefined;
      if (indexedModelInterface !== undefined) {
        modelInterface = {
          input: JSON.parse(indexedModelInterface.input),
          output: JSON.parse(indexedModelInterface.output),
        } as ModelInterface;
      }

      // in case of schema changes from ML plugin, this may crash. That is ok, as the error
      // produced will help expose the root cause
      modelDict[modelId] = {
        id: modelId,
        name: modelHit._source?.name,
        // @ts-ignore
        algorithm: MODEL_ALGORITHM[modelHit._source?.algorithm],
        // @ts-ignore
        state: MODEL_STATE[modelHit._source?.model_state],
        modelConfig: {
          modelType: modelHit._source?.model_config?.model_type,
          embeddingDimension:
            modelHit._source?.model_config?.embedding_dimension,
        },
        interface: modelInterface,
      } as Model;
    }
  });
  return modelDict;
}

// Convert the workflow state into a readable/presentable state on frontend
export function getWorkflowStateFromResponse(
  state: typeof WORKFLOW_STATE | undefined
): WORKFLOW_STATE {
  const finalState = state || DEFAULT_NEW_WORKFLOW_STATE_TYPE;
  // @ts-ignore
  return WORKFLOW_STATE[finalState];
}

// Convert the workflow resources into a readable/presentable state on frontend
export function getResourcesCreatedFromResponse(
  resourcesCreated: any[] | undefined
): WorkflowResource[] {
  const finalResources = [] as WorkflowResource[];
  if (resourcesCreated) {
    resourcesCreated.forEach((backendResource) => {
      finalResources.push({
        id: backendResource.resource_id,
        stepType: backendResource.workflow_step_name,
        type:
          // @ts-ignore
          WORKFLOW_RESOURCE_TYPE[
            // the backend persists the types in lowercase. e.g., "pipeline_id"
            (backendResource.resource_type as string).toUpperCase()
          ],
      } as WorkflowResource);
    });
  }
  return finalResources;
}
