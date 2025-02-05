/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IngestPipelineErrors, SearchPipelineErrors } from '../../../common';

export const INITIAL_ERRORS_STATE = {
  ingestPipeline: {} as IngestPipelineErrors,
  searchPipeline: {} as SearchPipelineErrors,
};

const ERRORS_PREFIX = 'errors';
const SET_INGEST_PIPELINE_ERRORS = `${ERRORS_PREFIX}/setIngestPipelineErrors`;
const SET_SEARCH_PIPELINE_ERRORS = `${ERRORS_PREFIX}/setSearchPipelineErrors`;

export const setIngestPipelineErrors = createAsyncThunk(
  SET_INGEST_PIPELINE_ERRORS,
  async ({ errors }: { errors: IngestPipelineErrors }, { rejectWithValue }) => {
    return errors;
  }
);

export const setSearchPipelineErrors = createAsyncThunk(
  SET_SEARCH_PIPELINE_ERRORS,
  async ({ errors }: { errors: SearchPipelineErrors }, { rejectWithValue }) => {
    return errors;
  }
);

const errorsSlice = createSlice({
  name: ERRORS_PREFIX,
  initialState: INITIAL_ERRORS_STATE,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setIngestPipelineErrors.fulfilled, (state, action) => {
        state.ingestPipeline = action.payload;
      })
      .addCase(setSearchPipelineErrors.fulfilled, (state, action) => {
        state.searchPipeline = action.payload;
      });
  },
});

export const errorsReducer = errorsSlice.reducer;
