/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { WORKFLOW_STATE, Workflow } from '../../common';

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

export function toWorkflowObj(workflowHit: any): Workflow {
  // TODO: update schema parsing after hit schema has been updated.
  // https://github.com/opensearch-project/flow-framework/issues/546
  const hitSource = workflowHit.fields.filter[0];
  // const hitSource = workflowHit._source;
  return {
    id: workflowHit._id,
    name: hitSource.name,
    description: hitSource.description || '',
    // TODO: update below values after frontend Workflow interface is finalized
    template: {},
    lastUpdated: 1234,
    state: WORKFLOW_STATE.SUCCEEDED,
  } as Workflow;
}
