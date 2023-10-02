/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSlice } from '@reduxjs/toolkit';
import { Workflow, ReactFlowComponent, ReactFlowEdge } from '../../../common';

// TODO: remove after fetching from server-side
const dummyNodes = [
  {
    id: 'semantic-search',
    position: { x: 40, y: 10 },
    data: { label: 'Semantic Search' },
    type: 'group',
    style: {
      height: 110,
      width: 700,
    },
  },
  {
    id: 'model',
    position: { x: 25, y: 25 },
    data: { label: 'Deployed Model ID' },
    type: 'default',
    parentNode: 'semantic-search',
    extent: 'parent',
  },
  {
    id: 'ingest-pipeline',
    position: { x: 262, y: 25 },
    data: { label: 'Ingest Pipeline Name' },
    type: 'default',
    parentNode: 'semantic-search',
    extent: 'parent',
  },
] as ReactFlowComponent[];

const dummyEdges = [
  {
    id: 'e1-2',
    source: 'model',
    target: 'ingest-pipeline',
    style: {
      strokeWidth: 2,
      stroke: 'black',
    },
    markerEnd: {
      type: 'arrow',
      strokeWidth: 1,
      color: 'black',
    },
  },
] as ReactFlowEdge[];

const initialState = {
  // TODO: fetch from server-side later
  workflows: [
    {
      name: 'Workflow-1',
      id: 'workflow-1-id',
      description: 'description for workflow 1',
      reactFlowState: {
        nodes: dummyNodes,
        edges: dummyEdges,
      },
      template: {},
    },
    {
      name: 'Workflow-2',
      id: 'workflow-2-id',
      description: 'description for workflow 2',
      reactFlowState: {
        nodes: dummyNodes,
        edges: dummyEdges,
      },
      template: {},
    },
  ] as Workflow[],
  loading: false,
};

const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    setWorkflows(state, action) {
      state.workflows = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const workflowsReducer = workflowsSlice.reducer;
export const { setWorkflows, setLoading } = workflowsSlice.actions;
