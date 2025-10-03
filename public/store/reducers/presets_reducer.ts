/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { WorkflowTemplate } from '../../../common';
import { getRouteService } from '../../services';
import { formatRouteServiceError } from '../../utils';

export const INITIAL_PRESETS_STATE = {
  loading: false,
  errorMessage: '',
  presetWorkflows: [] as Partial<WorkflowTemplate>[],
};

const PRESET_ACTION_PREFIX = 'presets';
const GET_WORKFLOW_PRESETS_ACTION = `${PRESET_ACTION_PREFIX}/getPresets`;

export const getWorkflowPresets = createAsyncThunk(
  GET_WORKFLOW_PRESETS_ACTION,
  async (_, { rejectWithValue }) => {
    try {
      return await getRouteService().getWorkflowPresets();
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error getting workflow presets')
      );
    }
  }
);

const presetsSlice = createSlice({
  name: 'presets',
  initialState: INITIAL_PRESETS_STATE,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getWorkflowPresets.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(getWorkflowPresets.fulfilled, (state, action) => {
        state.presetWorkflows = action.payload.workflowTemplates as Partial<
          WorkflowTemplate
        >[];
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(getWorkflowPresets.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload as string;
      });
  },
});

export const presetsReducer = presetsSlice.reducer;
