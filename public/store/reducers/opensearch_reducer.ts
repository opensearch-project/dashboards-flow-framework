/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getRouteService } from '../../services';
import {
  Index,
  IngestPipelineConfig,
  OMIT_SYSTEM_INDEX_PATTERN,
  SimulateIngestPipelineDoc,
} from '../../../common';
import { HttpFetchError } from '../../../../../src/core/public';

export const INITIAL_OPENSEARCH_STATE = {
  loading: false,
  errorMessage: '',
  indices: {} as { [key: string]: Index },
};

const OPENSEARCH_PREFIX = 'opensearch';
const CAT_INDICES_ACTION = `${OPENSEARCH_PREFIX}/catIndices`;
const GET_MAPPINGS_ACTION = `${OPENSEARCH_PREFIX}/mappings`;
const SEARCH_INDEX_ACTION = `${OPENSEARCH_PREFIX}/search`;
const INGEST_ACTION = `${OPENSEARCH_PREFIX}/ingest`;
const BULK_ACTION = `${OPENSEARCH_PREFIX}/bulk`;
const SIMULATE_PIPELINE_ACTION = `${OPENSEARCH_PREFIX}/simulatePipeline`;
const GET_INGEST_PIPELINE_ACTION = `${OPENSEARCH_PREFIX}/getIngestPipeline`;
const GET_SEARCH_PIPELINE_ACTION = `${OPENSEARCH_PREFIX}/getSearchPipeline`;
const GET_INDEX_ACTION = `${OPENSEARCH_PREFIX}/getIndex`;

export const catIndices = createAsyncThunk(
  CAT_INDICES_ACTION,
  async (
    { pattern, dataSourceId }: { pattern: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    // defaulting to fetch everything except system indices (starting with '.')
    const patternString = pattern || OMIT_SYSTEM_INDEX_PATTERN;
    const response: any | HttpFetchError = await getRouteService().catIndices(
      patternString,
      dataSourceId
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

export const getMappings = createAsyncThunk(
  GET_MAPPINGS_ACTION,
  async (
    { index, dataSourceId }: { index: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    const response: any | HttpFetchError = await getRouteService().getMappings(
      index,
      dataSourceId
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error getting index mappings: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

export const getIndex = createAsyncThunk(
  GET_INDEX_ACTION,
  async (
    { index, dataSourceId }: { index: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    const response: any | HttpFetchError = await getRouteService().getIndex(
      index,
      dataSourceId
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error getting index settings and mappings: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

export const searchIndex = createAsyncThunk(
  SEARCH_INDEX_ACTION,
  async (
    {
      apiBody,
      dataSourceId,
    }: {
      apiBody: { index: string; body: {}; searchPipeline?: string };
      dataSourceId?: string;
    },
    { rejectWithValue }
  ) => {
    const { index, body, searchPipeline } = apiBody;
    const response: any | HttpFetchError = await getRouteService().searchIndex({
      index,
      body,
      dataSourceId,
      searchPipeline,
    });
    if (response instanceof HttpFetchError) {
      return rejectWithValue('Error searching index: ' + response.body.message);
    } else {
      return response;
    }
  }
);

export const ingest = createAsyncThunk(
  INGEST_ACTION,
  async (
    {
      apiBody,
      dataSourceId,
    }: {
      apiBody: { index: string; doc: {} };
      dataSourceId?: string;
    },
    { rejectWithValue }
  ) => {
    const { index, doc } = apiBody;
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
    {
      apiBody,
      dataSourceId,
    }: {
      apiBody: { body: {}; ingestPipeline?: string };
      dataSourceId?: string;
    },
    { rejectWithValue }
  ) => {
    const { body, ingestPipeline } = apiBody;
    const response: any | HttpFetchError = await getRouteService().bulk({
      body,
      dataSourceId,
      ingestPipeline,
    });
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
    {
      apiBody,
      dataSourceId,
    }: {
      apiBody: {
        pipeline: IngestPipelineConfig;
        docs: SimulateIngestPipelineDoc[];
      };
      dataSourceId?: string;
    },
    { rejectWithValue }
  ) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().simulatePipeline(
      apiBody,
      dataSourceId
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error simulating ingest pipeline: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

export const getSearchPipeline = createAsyncThunk(
  GET_SEARCH_PIPELINE_ACTION,
  async (
    {
      pipelineId,
      dataSourceId,
    }: {
      pipelineId: string;
      dataSourceId?: string;
    },
    { rejectWithValue }
  ) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().getSearchPipeline(
      pipelineId,
      dataSourceId
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error fetching search pipeline: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

export const getIngestPipeline = createAsyncThunk(
  GET_INGEST_PIPELINE_ACTION,
  async (
    {
      pipelineId,
      dataSourceId,
    }: {
      pipelineId: string;
      dataSourceId?: string;
    },
    { rejectWithValue }
  ) => {
    const response:
      | any
      | HttpFetchError = await getRouteService().getIngestPipeline(
      pipelineId,
      dataSourceId
    );
    if (response instanceof HttpFetchError) {
      return rejectWithValue(
        'Error fetching ingest pipeline: ' + response.body.message
      );
    } else {
      return response;
    }
  }
);

const opensearchSlice = createSlice({
  name: OPENSEARCH_PREFIX,
  initialState: INITIAL_OPENSEARCH_STATE,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(catIndices.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(getMappings.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(getIndex.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(getIngestPipeline.pending, (state, action) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(getSearchPipeline.pending, (state, action) => {
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
      .addCase(getMappings.fulfilled, (state, action) => {
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(getIndex.fulfilled, (state, action) => {
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(getSearchPipeline.fulfilled, (state, action) => {
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(getIngestPipeline.fulfilled, (state, action) => {
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
      .addCase(getMappings.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(getIndex.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(getIngestPipeline.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(getSearchPipeline.rejected, (state, action) => {
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
