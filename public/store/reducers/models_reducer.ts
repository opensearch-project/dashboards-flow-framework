/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ModelDict } from '../../../common';
import { HttpFetchError } from '../../../../../src/core/public';
import { getRouteService } from '../../services';

const initialState = {
  loading: false,
  errorMessage: '',
  models: {} as ModelDict,
};

const MODELS_ACTION_PREFIX = 'models';
const SEARCH_MODELS_ACTION = `${MODELS_ACTION_PREFIX}/searchModels`;

export const searchModels = createAsyncThunk(
  SEARCH_MODELS_ACTION,
  async (body: {}, { rejectWithValue }) => {
    const response: any | HttpFetchError = await getRouteService().searchModels(
      body
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error searching models: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Pending states
      .addCase(searchModels.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      // Fulfilled states
      .addCase(searchModels.fulfilled, (state, action) => {
        const { models } = action.payload as { models: ModelDict };
        state.models = models;
        state.loading = false;
        state.errorMessage = '';
      })
      // Rejected states
      .addCase(searchModels.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      });
  },
});

export const modelsReducer = modelsSlice.reducer;
