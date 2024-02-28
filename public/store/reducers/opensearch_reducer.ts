/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getRouteService } from '../../services';
import { Index } from '../../../common';
import { HttpFetchError } from '../../../../../src/core/public';

const initialState = {
  loading: false,
  errorMessage: '',
  indices: {} as { [key: string]: Index },
};

const OPENSEARCH_PREFIX = 'opensearch';
const CAT_INDICES_ACTION = `${OPENSEARCH_PREFIX}/catIndices`;

export const catIndices = createAsyncThunk(
  CAT_INDICES_ACTION,
  async (pattern: string, { rejectWithValue }) => {
    // defaulting to fetch everything except system indices (starting with '.')
    const patternString = pattern || '*,-.*';
    const response: any | HttpFetchError = await getRouteService().catIndices(
      patternString
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error running cat indices: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

const opensearchSlice = createSlice({
  name: OPENSEARCH_PREFIX,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(catIndices.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(catIndices.fulfilled, (state, action) => {
        const indicesMap = new Map<string, Index>();
        action.payload.forEach((index: Index) => {
          indicesMap.set(index.name, index);
        });
        state.indices = Object.fromEntries(indicesMap.entries());
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(catIndices.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      });
  },
});

export const opensearchReducer = opensearchSlice.reducer;
