/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { WorkflowDict, WorkflowTemplate } from '../../../common';
import { HttpFetchError } from '../../../../../src/core/public';
import { getRouteService } from '../../services';

const initialState = {
  loading: false,
  errorMessage: '',
  workflows: {} as WorkflowDict,
};

const WORKFLOWS_ACTION_PREFIX = 'workflows';
const GET_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/get`;
const SEARCH_WORKFLOWS_ACTION = `${WORKFLOWS_ACTION_PREFIX}/search`;
const GET_WORKFLOW_STATE_ACTION = `${WORKFLOWS_ACTION_PREFIX}/getState`;
const CREATE_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/create`;
const UPDATE_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/update`;
const PROVISION_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/provision`;
const DEPROVISION_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/deprovision`;
const DELETE_WORKFLOW_ACTION = `${WORKFLOWS_ACTION_PREFIX}/delete`;

export const getWorkflow = createAsyncThunk(
  GET_WORKFLOW_ACTION,
  async (
    { workflowId, dataSourceId }: { workflowId: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    const response: any | HttpFetchError = await getRouteService().getWorkflow(
      workflowId,
      dataSourceId
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
  async (
    { apiBody, dataSourceId }: { apiBody: {}; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().searchWorkflows(
      apiBody,
      dataSourceId
    );
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
  async (
    { workflowId, dataSourceId }: { workflowId: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().getWorkflowState(
      workflowId,
      dataSourceId
    );
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
  async (
    { apiBody, dataSourceId }: { apiBody: {}; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().createWorkflow(
      apiBody,
      dataSourceId
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

export const updateWorkflow = createAsyncThunk(
  UPDATE_WORKFLOW_ACTION,
  async (
    {
      apiBody,
      dataSourceId,
    }: {
      apiBody: {
        workflowId: string;
        workflowTemplate: WorkflowTemplate;
        updateFields?: boolean;
      };
      dataSourceId?: string;
    },
    { rejectWithValue }
  ) => {
    const { workflowId, workflowTemplate, updateFields } = apiBody;
    const response:
      | any
      | HttpFetchError = await getRouteService().updateWorkflow(
      workflowId,
      workflowTemplate,
      updateFields || false,
      dataSourceId
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error updating workflow: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

export const provisionWorkflow = createAsyncThunk(
  PROVISION_WORKFLOW_ACTION,
  async (
    { workflowId, dataSourceId }: { workflowId: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().provisionWorkflow(
      workflowId,
      dataSourceId
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error provisioning workflow: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

export const deprovisionWorkflow = createAsyncThunk(
  DEPROVISION_WORKFLOW_ACTION,
  async (
    {
      apiBody,
      dataSourceId,
    }: {
      apiBody: { workflowId: string; resourceIds?: string };
      dataSourceId?: string;
    },
    { rejectWithValue }
  ) => {
    const { workflowId, resourceIds } = apiBody;
    const response:
      | any
      | HttpFetchError = await getRouteService().deprovisionWorkflow(
      workflowId,
      resourceIds,
      dataSourceId
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error deprovisioning workflow: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

export const deleteWorkflow = createAsyncThunk(
  DELETE_WORKFLOW_ACTION,
  async (
    { workflowId, dataSourceId }: { workflowId: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().deleteWorkflow(
      workflowId,
      dataSourceId
    );
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
      .addCase(updateWorkflow.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(provisionWorkflow.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(deprovisionWorkflow.pending, (state, action) => {
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
        const { workflow } = action.payload;
        state.workflows = {
          ...state.workflows,
          [workflow.id]: workflow,
        };
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
        const { workflowId, workflowState, resourcesCreated } = action.payload;
        state.workflows = {
          ...state.workflows,
          [workflowId]: {
            ...state.workflows[workflowId],
            state: workflowState,
            resourcesCreated,
          },
        };
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
      .addCase(updateWorkflow.fulfilled, (state, action) => {
        const { workflowId, workflowTemplate } = action.payload as {
          workflowId: string;
          workflowTemplate: WorkflowTemplate;
        };
        state.workflows = {
          ...state.workflows,
          [workflowId]: {
            // only overwrite the stateless / template fields. persist any existing state (e.g., lastUpdated, lastProvisioned)
            ...state.workflows[workflowId],
            ...workflowTemplate,
          },
        };
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(provisionWorkflow.fulfilled, (state, action) => {
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(deprovisionWorkflow.fulfilled, (state, action) => {
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
      .addCase(updateWorkflow.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(provisionWorkflow.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(deprovisionWorkflow.rejected, (state, action) => {
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
