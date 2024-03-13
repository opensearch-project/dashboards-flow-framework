/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Workflow } from '../../../common';
import { HttpFetchError } from '../../../../../src/core/public';
import { getRouteService } from '../../services';

const initialState = {
  loading: false,
  errorMessage: '',
  presetWorkflows: [] as Workflow[],
};

const PRESET_ACTION_PREFIX = 'presets';
const GET_WORKFLOW_PRESETS_ACTION = `${PRESET_ACTION_PREFIX}/getPresets`;

export const getWorkflowPresets = createAsyncThunk(
  GET_WORKFLOW_PRESETS_ACTION,
  async (_, { rejectWithValue }) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().getWorkflowPresets();
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error getting workflow presets: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

const presetsSlice = createSlice({
  name: 'presets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getWorkflowPresets.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(getWorkflowPresets.fulfilled, (state, action) => {
        state.presetWorkflows = action.payload.workflowTemplates;
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(getWorkflowPresets.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      });
  },
});

export const presetsReducer = presetsSlice.reducer;
