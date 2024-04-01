/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Connection, ReactFlowInstance } from 'reactflow';
import { IComponentInput } from '../../../../../common';

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

// Validates that connections can only be made when the source and target classes align, and
// that multiple connections to the same target handle are not allowed unless the input configuration
// for that particular component allows for it.
export function isValidConnection(
  connection: Connection,
  rfInstance: ReactFlowInstance
): boolean {
  const sourceHandle = connection.sourceHandle;
  const targetHandle = connection.targetHandle;
  const targetNodeId = connection.target;

  // We store the output classes in a pipe-delimited string. Converting back to a list.
  const sourceClasses = sourceHandle?.split('|') || [];
  const targetClass = targetHandle || '';

  if (sourceClasses?.includes(targetClass)) {
    const targetNode = rfInstance.getNode(targetNodeId || '');
    if (targetNode) {
      const inputConfig = targetNode.data.inputs.find(
        (input: IComponentInput) => sourceClasses.includes(input.baseClass)
      ) as IComponentInput;
      const existingEdge = rfInstance
        .getEdges()
        .find(
          (edge) =>
            edge.target === targetNodeId && edge.targetHandle === targetHandle
        );
      if (existingEdge && inputConfig.acceptMultiple === false) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}
