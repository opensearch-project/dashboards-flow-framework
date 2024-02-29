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
  WorkflowDict,
} from '../../../common';
import { HttpFetchError } from '../../../../../src/core/public';
import { getRouteService } from '../../services';

// TODO: remove hardcoded initial state below after fetching from server side,
// and workflow data model interface is more defined.
// const id1 = generateId('text_embedding_processor');
// const id2 = generateId('text_embedding_processor');
// const id3 = generateId('knn_index');
// const dummyNodes = [
//   {
//     id: id1,
//     position: { x: 0, y: 500 },
//     data: initComponentData(new TextEmbeddingProcessor().toObj(), id1),
//     type: 'customComponent',
//   },
//   {
//     id: id2,
//     position: { x: 0, y: 200 },
//     data: initComponentData(new TextEmbeddingProcessor().toObj(), id2),
//     type: 'customComponent',
//   },
//   {
//     id: id3,
//     position: { x: 500, y: 500 },
//     data: initComponentData(new KnnIndex().toObj(), id3),
//     type: 'customComponent',
//   },
// ] as ReactFlowComponent[];

// let workflows = {} as { [workflowId: string]: Workflow };
// workflows['workflow-1-id'] = {
//   name: 'Workflow-1',
//   id: 'workflow-1-id',
//   description: 'description for workflow 1',
//   state: WORKFLOW_STATE.SUCCEEDED,
//   workspaceFlowState: {
//     nodes: dummyNodes,
//     edges: [] as ReactFlowEdge[],
//   },
//   template: {},
// } as Workflow;
// workflows['workflow-2-id'] = {
//   name: 'Workflow-2',
//   id: 'workflow-2-id',
//   description: 'description for workflow 2',
//   state: WORKFLOW_STATE.FAILED,
//   workspaceFlowState: {
//     nodes: dummyNodes,
//     edges: [] as ReactFlowEdge[],
//   },
//   template: {},
// } as Workflow;

// const initialState = {
//   loading: false,
//   errorMessage: '',
//   workflows,
// };

const initialState = {
  loading: false,
  errorMessage: '',
  workflows: {} as WorkflowDict,
};

const WORKFLOWS_ACTION_PREFIX = 'workflows';
const GET_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/getWorkflow`;
const SEARCH_WORKFLOWS_ACTION = `${WORKFLOWS_ACTION_PREFIX}/searchWorkflows`;
const GET_WORKFLOW_STATE_ACTION = `${WORKFLOWS_ACTION_PREFIX}/getWorkflowState`;
const CREATE_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/createWorkflow`;
const DELETE_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/deleteWorkflow`;

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

export const searchWorkflows = createAsyncThunk(
  SEARCH_WORKFLOWS_ACTION,
  async (body: {}, { rejectWithValue }) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().searchWorkflows(body);
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error searching workflows: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

export const getWorkflowState = createAsyncThunk(
  GET_WORKFLOW_STATE_ACTION,
  async (workflowId: string, { rejectWithValue }) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().getWorkflowState(workflowId);
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error getting workflow state: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

export const createWorkflow = createAsyncThunk(
  CREATE_WORKFLOW_ACTION,
  async (body: {}, { rejectWithValue }) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().createWorkflow(body);
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error creating workflow: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

export const deleteWorkflow = createAsyncThunk(
  DELETE_WORKFLOW_ACTION,
  async (workflowId: string, { rejectWithValue }) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().deleteWorkflow(workflowId);
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error deleting workflow: ' + response.body.message
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
      // Pending states: set state consistently across all actions
      .addCase(getWorkflow.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(searchWorkflows.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(createWorkflow.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(deleteWorkflow.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(getWorkflowState.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      // Fulfilled states: mutate state depending on the action type
      // and payloads
      .addCase(getWorkflow.fulfilled, (state, action) => {
        // TODO: add logic to mutate state
        // const workflow = action.payload;
        // state.workflows = {
        //   ...state.workflows,
        //   [workflow.id]: workflow,
        // };
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(searchWorkflows.fulfilled, (state, action) => {
        const { workflows } = action.payload as { workflows: WorkflowDict };
        state.workflows = workflows;
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(getWorkflowState.fulfilled, (state, action) => {
        // TODO: add logic to mutate state
        // const workflow = action.payload;
        // state.workflows = {
        //   ...state.workflows,
        //   [workflow.id]: workflow,
        // };
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(createWorkflow.fulfilled, (state, action) => {
        // TODO: add logic to mutate state
        // const workflow = action.payload;
        // state.workflows = {
        //   ...state.workflows,
        //   [workflow.id]: workflow,
        // };
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        const workflowId = action.payload.id;
        delete state.workflows[workflowId];
        state.loading = false;
        state.errorMessage = '';
      })
      // Rejected states: set state consistently across all actions
      .addCase(getWorkflow.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(searchWorkflows.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(getWorkflowState.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(createWorkflow.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(deleteWorkflow.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      });
  },
});

export const workflowsReducer = workflowsSlice.reducer;
