/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Edge } from 'reactflow';
import { setDirty } from '../reducers';

const initialValues = {
  reactFlowInstance: null,
  setReactFlowInstance: () => {},
  deleteNode: (nodeId: string) => {},
  deleteEdge: (edgeId: string) => {},
};

export const rfContext = createContext(initialValues);

/**
 * This returns a provider from the rfContext context created above. The initial
 * values are set so any nested components can use useContext to access these
 * values.
 *
 * This is how we can manage ReactFlow context consistently across the various
 * nested child components.
 */
export function ReactFlowContextProvider({ children }: any) {
  const dispatch = useDispatch();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const deleteNode = (nodeId: string) => {
    // TODO: implement node deletion
    // reactFlowInstance.setNodes(...)
  };

  const deleteEdge = (edgeId: string) => {
    reactFlowInstance.setEdges(
      reactFlowInstance.getEdges().filter((edge: Edge) => edge.id !== edgeId)
    );
    dispatch(setDirty());
  };

  return (
    <rfContext.Provider
      value={{
        reactFlowInstance,
        // @ts-ignore
        setReactFlowInstance,
        deleteNode,
        deleteEdge,
      }}
    >
      {children}
    </rfContext.Provider>
  );
}
