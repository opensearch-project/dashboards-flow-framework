/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getRouteService } from '../../services';
import { IIndex } from '../../../common';

const initialState = {
  loading: false,
  errorMessage: '',
  indices: {} as { [key: string]: IIndex },
};

const OPENSEARCH_PREFIX = 'opensearch';
const FETCH_INDICES_ACTION = `${OPENSEARCH_PREFIX}/fetchIndices`;

export const fetchIndices = createAsyncThunk(
  FETCH_INDICES_ACTION,
  async (pattern?: string) => {
    // defaulting to fetch everything except system indices (starting with '.')
    const patternString = pattern || '*,-.*';
    const response = getRouteService().fetchIndices(patternString);
    return response;
  }
);

const opensearchSlice = createSlice({
  name: OPENSEARCH_PREFIX,
  initialState,
  reducers: {
    setIndices(state, action) {
      state.indices = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIndices.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(fetchIndices.fulfilled, (state, action) => {
        const indicesMap = new Map<string, IIndex>();
        action.payload.forEach((index: IIndex) => {
          indicesMap.set(index.name, index);
        });
        state.indices = Object.fromEntries(indicesMap.entries());
        state.loading = false;
      })
      .addCase(fetchIndices.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      });
  },
});

export const opensearchReducer = opensearchSlice.reducer;
export const { setIndices } = opensearchSlice.actions;
