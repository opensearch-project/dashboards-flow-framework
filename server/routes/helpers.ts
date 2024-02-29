/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { WORKFLOW_STATE, Workflow, WorkflowDict } from '../../common';

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

function toWorkflowObj(workflowHit: any): Workflow {
  // TODO: update schema parsing after hit schema has been updated.
  // https://github.com/opensearch-project/flow-framework/issues/546
  const hitSource = workflowHit.fields.filter[0];
  return {
    id: workflowHit._id,
    name: hitSource.name,
    useCase: hitSource.use_case,
    description: hitSource.description || '',
    // TODO: update below values after frontend Workflow interface is finalized
    template: {},
    // TODO: this needs to be persisted by backend. Tracking issue:
    // https://github.com/opensearch-project/flow-framework/issues/548
    lastUpdated: 1234,
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
    workflowDict[workflowHit._id] = toWorkflowObj(workflowHit);
    const workflowStateHit = workflowStateHits.find(
      (workflowStateHit) => workflowStateHit._id === workflowHit._id
    );
    const workflowState = workflowStateHit._source
      .state as typeof WORKFLOW_STATE;
    workflowDict[workflowHit._id] = {
      ...workflowDict[workflowHit._id],
      // @ts-ignore
      state: WORKFLOW_STATE[workflowState],
      // TODO: this needs to be persisted by backend. Tracking issue:
      // https://github.com/opensearch-project/flow-framework/issues/548
      lastLaunched: 1234,
    };
  });
  return workflowDict;
}
