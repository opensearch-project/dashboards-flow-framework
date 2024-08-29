/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ConnectorDict, ModelDict } from '../../../common';
import { HttpFetchError } from '../../../../../src/core/public';
import { getRouteService } from '../../services';

const initialState = {
  loading: false,
  errorMessage: '',
  models: {} as ModelDict,
  connectors: {} as ConnectorDict,
};

const MODELS_ACTION_PREFIX = 'models';
const CONNECTORS_ACTION_PREFIX = 'connectors';
const SEARCH_MODELS_ACTION = `${MODELS_ACTION_PREFIX}/search`;
const SEARCH_CONNECTORS_ACTION = `${CONNECTORS_ACTION_PREFIX}/search`;

export const searchModels = createAsyncThunk(
  SEARCH_MODELS_ACTION,
  async (
    { apiBody, dataSourceId }: { apiBody: {}; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    const response: any | HttpFetchError = await getRouteService().searchModels(
      apiBody,
      dataSourceId
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

export const searchConnectors = createAsyncThunk(
  SEARCH_CONNECTORS_ACTION,
  async (
    { apiBody, dataSourceId }: { apiBody: {}; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().searchConnectors(
      apiBody,
      dataSourceId
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error searching connectors: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

const mlSlice = createSlice({
  name: 'ml',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Pending states
      .addCase(searchModels.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(searchConnectors.pending, (state, action) => {
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
      .addCase(searchConnectors.fulfilled, (state, action) => {
        const { connectors } = action.payload as { connectors: ConnectorDict };
        state.connectors = connectors;
        state.loading = false;
        state.errorMessage = '';
      })
      // Rejected states
      .addCase(searchModels.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(searchConnectors.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      });
  },
});

export const mlReducer = mlSlice.reducer;
