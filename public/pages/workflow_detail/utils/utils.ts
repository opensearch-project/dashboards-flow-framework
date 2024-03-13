/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  WorkspaceFlowState,
  Workflow,
  ReactFlowComponent,
  toTemplateFlows,
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
      workflows: toTemplateFlows(curFlowState),
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
