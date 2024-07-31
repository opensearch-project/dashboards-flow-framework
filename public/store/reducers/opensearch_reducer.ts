/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getRouteService } from '../../services';
import {
  Index,
  IngestPipelineConfig,
  SimulateIngestPipelineDoc,
} from '../../../common';
import { HttpFetchError } from '../../../../../src/core/public';

const initialState = {
  loading: false,
  errorMessage: '',
  indices: {} as { [key: string]: Index },
};

const OPENSEARCH_PREFIX = 'opensearch';
const CAT_INDICES_ACTION = `${OPENSEARCH_PREFIX}/catIndices`;
const SEARCH_INDEX_ACTION = `${OPENSEARCH_PREFIX}/search`;
const INGEST_ACTION = `${OPENSEARCH_PREFIX}/ingest`;
const BULK_ACTION = `${OPENSEARCH_PREFIX}/bulk`;
const SIMULATE_PIPELINE_ACTION = `${OPENSEARCH_PREFIX}/simulatePipeline`;

export const catIndices = createAsyncThunk(
  CAT_INDICES_ACTION,
  async ({pattern,dataSourceId }:{pattern: string,dataSourceId:string|undefined}, { rejectWithValue }) => {
    // defaulting to fetch everything except system indices (starting with '.')
    const patternString = pattern || '*,-.*';
    const response: any | HttpFetchError = await getRouteService().catIndices(
      patternString,
      dataSourceId,
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

export const searchIndex = createAsyncThunk(
  SEARCH_INDEX_ACTION,
  async (
    {searchIndexInfo,dataSourceId }:{searchIndexInfo: { index: string; body: {}; searchPipeline?: string },dataSourceId:string|undefined} ,
    { rejectWithValue }
  ) => {
    const { index, body, searchPipeline } = searchIndexInfo;
    const response: any | HttpFetchError = await getRouteService().searchIndex(
      index,
      body,
      dataSourceId,
      searchPipeline
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue('Error searching index: ' + response.body.message);
    } else {
      return response;
    }
  }
);

export const ingest = createAsyncThunk(
  INGEST_ACTION,
  async ({ingestInfo,dataSourceId}:{ingestInfo: { index: string; doc: {} },dataSourceId:string|undefined}, { rejectWithValue }) => {
    const { index, doc } = ingestInfo;
    const response: any | HttpFetchError = await getRouteService().ingest(
      index,
      doc,
      dataSourceId
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error ingesting document: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

export const bulk = createAsyncThunk(
  BULK_ACTION,
  async (
    {bulkInfo, dataSourceId}:{bulkInfo: { body: {}; ingestPipeline?: string },dataSourceId:string|undefined},
    { rejectWithValue }
  ) => {
    const { body, ingestPipeline } = bulkInfo;
    const response: any | HttpFetchError = await getRouteService().bulk(
      body,
      dataSourceId,
      ingestPipeline
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue('Error performing bulk: ' + response.body.message);
    } else {
      return response;
    }
  }
);

export const simulatePipeline = createAsyncThunk(
  SIMULATE_PIPELINE_ACTION,
  async (
    {body,dataSourceId}:{body: { pipeline: IngestPipelineConfig; docs: SimulateIngestPipelineDoc[] },dataSourceId:string|undefined},
    { rejectWithValue }
  ) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().simulatePipeline(body, dataSourceId);
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error simulating ingest pipeline: ' + response.body.message
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
      .addCase(searchIndex.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(ingest.pending, (state, action) => {
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
      .addCase(searchIndex.fulfilled, (state, action) => {
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(ingest.fulfilled, (state, action) => {
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(catIndices.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(searchIndex.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(ingest.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      });
  },
});

export const opensearchReducer = opensearchSlice.reducer;
