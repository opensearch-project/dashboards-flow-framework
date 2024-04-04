/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Workflow, WorkflowDict } from '../../../common';
import { HttpFetchError } from '../../../../../src/core/public';
import { getRouteService } from '../../services';

const initialState = {
  loading: false,
  errorMessage: '',
  workflows: {} as WorkflowDict,
  cachedWorkflow: undefined as Workflow | undefined,
};

const WORKFLOWS_ACTION_PREFIX = 'workflows';
const GET_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/getWorkflow`;
const SEARCH_WORKFLOWS_ACTION = `${WORKFLOWS_ACTION_PREFIX}/searchWorkflows`;
const GET_WORKFLOW_STATE_ACTION = `${WORKFLOWS_ACTION_PREFIX}/getWorkflowState`;
const CREATE_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/createWorkflow`;
const DELETE_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/deleteWorkflow`;
const CACHE_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/cacheWorkflow`;
const CLEAR_CACHED_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/clearCachedWorkflow`;

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
  async (workflowBody: {}, { rejectWithValue }) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().createWorkflow(
      workflowBody,
      false
    );
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

export const cacheWorkflow = createAsyncThunk(
  CACHE_WORKFLOW_ACTION,
  async (workflow: Workflow) => {
    return workflow;
  }
);

// A no-op function to trigger a reducer case.
// Will clear any stored workflow in the cachedWorkflow state
export const clearCachedWorkflow = createAsyncThunk(
  CLEAR_CACHED_WORKFLOW_ACTION,
  async () => {}
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
        const workflow = action.payload;
        state.workflows = {
          ...state.workflows,
          [workflow.id]: workflow,
        };
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        const workflowId = action.payload.id;
        delete state.workflows[workflowId];
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(cacheWorkflow.fulfilled, (state, action) => {
        const workflow = action.payload;
        state.cachedWorkflow = workflow;
      })
      .addCase(clearCachedWorkflow.fulfilled, (state, action) => {
        state.cachedWorkflow = undefined;
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
