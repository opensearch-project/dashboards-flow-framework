/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Workflow, ReactFlowComponent } from '../../../../common';

export function saveWorkflow(workflow?: Workflow): void {
  if (workflow && workflow.id) {
    // TODO: implement connection to update workflow API
  } else {
    // TODO: implement connection to create workflow API
  }
}

// Process the raw ReactFlow nodes to only persist the fields we need
export function processNodes(
  nodes: ReactFlowComponent[]
): ReactFlowComponent[] {
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
