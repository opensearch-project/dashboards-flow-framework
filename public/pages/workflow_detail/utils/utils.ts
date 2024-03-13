/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  WorkspaceFlowState,
  WorkflowTemplate,
  Workflow,
  USE_CASE,
  ReactFlowComponent,
} from '../../../../common';

export function saveWorkflow(workflow: Workflow, rfInstance: any): void {
  let curFlowState = rfInstance.toObject();

  curFlowState = {
    ...curFlowState,
    nodes: processNodes(curFlowState.nodes),
  };

  const isValid = validateFlowState(curFlowState);
  if (isValid) {
    const updatedWorkflow = {
      ...workflow,
      workspaceFlowState: curFlowState,
      template: generateWorkflowTemplate(curFlowState),
    } as Workflow;
    if (workflow.id) {
      // TODO: implement connection to update workflow API
    } else {
      // TODO: implement connection to create workflow API
    }
  } else {
    return;
  }
}

// TODO: implement this. Need more info on UX side to finalize what we need
// to persist, what validation to do, etc.
// Note we don't have to validate connections since that is done via input/output handlers.
function validateFlowState(flowState: WorkspaceFlowState): boolean {
  return true;
}

// TODO: implement this
function generateWorkflowTemplate(
  flowState: WorkspaceFlowState
): WorkflowTemplate {
  return {
    name: 'example-name',
    description: 'example description',
    use_case: USE_CASE.PROVISION,
    version: {
      template: '1.0.0',
      compatibility: ['3.0.0'],
    },
    workflows: {
      provision: {
        userParams: {},
        nodes: [],
        edges: [],
      },
    },
  } as WorkflowTemplate;
}

// Process the raw ReactFlow nodes to only persist the fields we need
function processNodes(nodes: ReactFlowComponent[]): ReactFlowComponent[] {
  return nodes
    .map((node: ReactFlowComponent) => {
      return Object.fromEntries(
        ['id', 'data', 'type', 'width', 'height'].map((key: string) => [
          key,
          node[key],
        ])
      ) as ReactFlowComponent;
    })
    .map((node: ReactFlowComponent) => {
      return {
        ...node,
        selected: false,
      };
    });
}
