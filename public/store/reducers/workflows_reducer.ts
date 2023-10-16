/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSlice } from '@reduxjs/toolkit';
import {
  Workflow,
  ReactFlowComponent,
  ReactFlowEdge,
  KnnIndex,
  TextEmbeddingProcessor,
  generateId,
  initComponentData,
} from '../../../common';

// TODO: remove after fetching from server-side
const id1 = generateId('text_embedding_processor');
const id2 = generateId('text_embedding_processor');
const id3 = generateId('knn_index');
const dummyNodes = [
  {
    id: id1,
    position: { x: 0, y: 500 },
    data: initComponentData(new TextEmbeddingProcessor().toObj(), id1),
    type: 'customComponent',
  },
  {
    id: id2,
    position: { x: 0, y: 200 },
    data: initComponentData(new TextEmbeddingProcessor().toObj(), id2),
    type: 'customComponent',
  },
  {
    id: id3,
    position: { x: 500, y: 500 },
    data: initComponentData(new KnnIndex().toObj(), id3),
    type: 'customComponent',
  },
] as ReactFlowComponent[];

const initialState = {
  // TODO: fetch from server-side later
  workflows: [
    {
      name: 'Workflow-1',
      id: 'workflow-1-id',
      description: 'description for workflow 1',
      workspaceFlowState: {
        nodes: dummyNodes,
        edges: [] as ReactFlowEdge[],
      },
      template: {},
    },
    {
      name: 'Workflow-2',
      id: 'workflow-2-id',
      description: 'description for workflow 2',
      workspaceFlowState: {
        nodes: dummyNodes,
        edges: [] as ReactFlowEdge[],
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
