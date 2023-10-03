/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Connection, ReactFlowInstance } from 'reactflow';
import { IComponentInput } from '../../../../common';

/**
 * Collection of utility functions for the workspace component
 */

// Uses DOM elements to calculate where the handle should be placed
// vertically on the ReactFlow component. offsetTop is the offset relative to the
// parent element, and clientHeight is the element height including padding.
// We can combine them to get the exact amount, in pixels.
export function calculateHandlePosition(ref: any): number {
  if (ref.current && ref.current.offsetTop && ref.current.clientHeight) {
    return ref.current.offsetTop + ref.current.clientHeight / 2;
  } else {
    return 0;
  }
}

export function isValidConnection(
  connection: Connection,
  rfInstance: ReactFlowInstance
): boolean {
  const sourceHandle = connection.sourceHandle;
  const targetHandle = connection.targetHandle;
  const targetNodeId = connection.target;

  const inputClass = sourceHandle || '';
  // We store the output classes in a pipe-delimited string. Converting back to a list.
  const outputClasses = targetHandle?.split('|') || [];

  if (outputClasses?.includes(inputClass)) {
    const targetNode = rfInstance.getNode(targetNodeId || '');
    if (targetNode) {
      // We pull out the relevant IComponentInput config, and check if it allows multiple connections.
      // We also check the existing edges in the ReactFlow state.
      // If there is an existing edge, and we don't allow multiple, we don't allow this connection.
      // For all other scenarios, we allow the connection.
      const inputConfig = targetNode.data.inputs.find(
        (input: IComponentInput) => input.baseClass === inputClass
      );
      const existingEdge = rfInstance
        .getEdges()
        .find((edge) => edge.targetHandle === targetHandle);
      if (existingEdge && inputConfig.acceptMultiple === false) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}
