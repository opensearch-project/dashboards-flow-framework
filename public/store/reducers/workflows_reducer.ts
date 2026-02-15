/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { WorkflowDict, WorkflowTemplate } from '../../../common';
import { getRouteService } from '../../services';
import { formatRouteServiceError } from '../../utils';

export const INITIAL_WORKFLOWS_STATE = {
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
    try {
      return await getRouteService().getWorkflow(workflowId, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error getting workflow')
      );
    }
  }
);

export const searchWorkflows = createAsyncThunk(
  SEARCH_WORKFLOWS_ACTION,
  async (
    { apiBody, dataSourceId }: { apiBody: {}; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().searchWorkflows(apiBody, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error searching workflows')
      );
    }
  }
);

export const getWorkflowState = createAsyncThunk(
  GET_WORKFLOW_STATE_ACTION,
  async (
    { workflowId, dataSourceId }: { workflowId: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().getWorkflowState(workflowId, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error getting workflow state')
      );
    }
  }
);

export const createWorkflow = createAsyncThunk(
  CREATE_WORKFLOW_ACTION,
  async (
    { apiBody, dataSourceId }: { apiBody: {}; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().createWorkflow(apiBody, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error creating workflow')
      );
    }
  }
);

export const updateWorkflow = createAsyncThunk(
  UPDATE_WORKFLOW_ACTION,
  async (
    {
      apiBody,
      dataSourceId,
      dataSourceVersion,
    }: {
      apiBody: {
        workflowId: string;
        workflowTemplate: WorkflowTemplate;
        updateFields?: boolean;
        reprovision?: boolean;
      };
      dataSourceId?: string;
      dataSourceVersion?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const {
        workflowId,
        workflowTemplate,
        updateFields,
        reprovision,
      } = apiBody;
      return await getRouteService().updateWorkflow(
        workflowId,
        workflowTemplate,
        updateFields || false,
        reprovision || false,
        dataSourceId,
        dataSourceVersion
      );
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error updating workflow')
      );
    }
  }
);

export const provisionWorkflow = createAsyncThunk(
  PROVISION_WORKFLOW_ACTION,
  async (
    {
      workflowId,
      dataSourceId,
      dataSourceVersion,
    }: {
      workflowId: string;
      dataSourceId?: string;
      dataSourceVersion?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().provisionWorkflow(
        workflowId,
        dataSourceId,
        dataSourceVersion
      );
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error provisioning workflow')
      );
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
    try {
      const { workflowId, resourceIds } = apiBody;
      return await getRouteService().deprovisionWorkflow({
        workflowId,
        resourceIds,
        dataSourceId,
      });
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error deprovisioning workflow')
      );
    }
  }
);

export const deleteWorkflow = createAsyncThunk(
  DELETE_WORKFLOW_ACTION,
  async (
    { workflowId, dataSourceId }: { workflowId: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().deleteWorkflow(workflowId, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error deleting workflow')
      );
    }
  }
);

const workflowsSlice = createSlice({
  name: 'workflows',
  initialState: INITIAL_WORKFLOWS_STATE,
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
        state.workflows = workflows || {};
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
