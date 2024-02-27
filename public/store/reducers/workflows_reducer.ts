/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  Workflow,
  ReactFlowComponent,
  ReactFlowEdge,
  KnnIndex,
  TextEmbeddingProcessor,
  generateId,
  initComponentData,
  WORKFLOW_STATE,
} from '../../../common';
import { HttpFetchError } from '../../../../../src/core/public';
import { getRouteService } from '../../services';

// TODO: remove hardcoded initial state below after fetching from server side
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

let workflows = {} as { [workflowId: string]: Workflow };
workflows['workflow-1-id'] = {
  name: 'Workflow-1',
  id: 'workflow-1-id',
  description: 'description for workflow 1',
  state: WORKFLOW_STATE.SUCCEEDED,
  workspaceFlowState: {
    nodes: dummyNodes,
    edges: [] as ReactFlowEdge[],
  },
  template: {},
} as Workflow;
workflows['workflow-2-id'] = {
  name: 'Workflow-2',
  id: 'workflow-2-id',
  description: 'description for workflow 2',
  state: WORKFLOW_STATE.FAILED,
  workspaceFlowState: {
    nodes: dummyNodes,
    edges: [] as ReactFlowEdge[],
  },
  template: {},
} as Workflow;

const initialState = {
  loading: false,
  errorMessage: '',
  workflows,
};

// TODO: uncomment when workflow fetching is working
// const initialState = {
//   loading: false,
//   errorMessage: '',
//   workflows: {} as { [workflowId: string]: Workflow },
// };

const WORKFLOWS_PREFIX = 'workflows';
const GET_WORKFLOW_ACTION = `${WORKFLOWS_PREFIX}/getWorkflow`;

export const getWorkflow = createAsyncThunk(
  GET_WORKFLOW_ACTION,
  async (workflowId: string, { rejectWithValue }) => {
    const response: any | HttpFetchError = await getRouteService().getWorkflow(
      workflowId
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error getting workflow: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getWorkflow.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(getWorkflow.fulfilled, (state, action) => {
        const workflow = action.payload;
        state.workflows = {
          ...state.workflows,
          [workflow.id]: workflow,
        };
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(getWorkflow.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      });
  },
});

export const workflowsReducer = workflowsSlice.reducer;
