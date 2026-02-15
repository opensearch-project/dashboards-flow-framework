/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getRouteService } from '../../services';
import {
  Index,
  IndexConfiguration,
  IndexResponse,
  IngestPipelineConfig,
  IngestPipelineResponse,
  SearchPipelineConfig,
  SearchPipelineResponse,
  OMIT_SYSTEM_INDEX_PATTERN,
  SimulateIngestPipelineDoc,
  SearchTemplateConfig,
} from '../../../common';
import {
  formatRouteServiceError,
  parseErrorsFromIngestResponse,
} from '../../utils';

export const INITIAL_OPENSEARCH_STATE = {
  loading: false,
  errorMessage: '',
  getIndexErrorMessage: '',
  getSearchPipelineErrorMessage: '',
  getIngestPipelineErrorMessage: '',
  indices: {} as { [key: string]: Index },
  indexDetails: {} as { [key: string]: IndexConfiguration },
  ingestPipelineDetails: {} as { [key: string]: IngestPipelineConfig },
  searchPipelineDetails: {} as { [key: string]: SearchPipelineConfig },
  searchTemplates: {} as { [key: string]: SearchTemplateConfig },
  localClusterVersion: null as string | null,
};

const OPENSEARCH_PREFIX = 'opensearch';
const GET_LOCAL_CLUSTER_VERSION_ACTION = `${OPENSEARCH_PREFIX}/getLocalClusterVersion`;
const SET_OPENSEARCH_ERROR = `${OPENSEARCH_PREFIX}/setError`;
const CAT_INDICES_ACTION = `${OPENSEARCH_PREFIX}/catIndices`;
const GET_MAPPINGS_ACTION = `${OPENSEARCH_PREFIX}/mappings`;
const SEARCH_INDEX_ACTION = `${OPENSEARCH_PREFIX}/search`;
const INGEST_ACTION = `${OPENSEARCH_PREFIX}/ingest`;
const BULK_ACTION = `${OPENSEARCH_PREFIX}/bulk`;
const SIMULATE_PIPELINE_ACTION = `${OPENSEARCH_PREFIX}/simulatePipeline`;
const GET_INGEST_PIPELINE_ACTION = `${OPENSEARCH_PREFIX}/getIngestPipeline`;
const GET_SEARCH_PIPELINE_ACTION = `${OPENSEARCH_PREFIX}/getSearchPipeline`;
const GET_SEARCH_TEMPLATES_ACTION = `${OPENSEARCH_PREFIX}/getSearchTemplates`;
const GET_INDEX_ACTION = `${OPENSEARCH_PREFIX}/getIndex`;

export const getLocalClusterVersion = createAsyncThunk(
  GET_LOCAL_CLUSTER_VERSION_ACTION,
  async (_, { rejectWithValue }) => {
    try {
      const version = await getRouteService().getLocalClusterVersion();
      return version;
    } catch (error) {
      return rejectWithValue('Error getting local cluster version: ' + error);
    }
  }
);

export const setOpenSearchError = createAsyncThunk(
  SET_OPENSEARCH_ERROR,
  async ({ error }: { error: string }, { rejectWithValue }) => {
    return error;
  }
);

export const catIndices = createAsyncThunk(
  CAT_INDICES_ACTION,
  async (
    { pattern, dataSourceId }: { pattern: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      // defaulting to fetch everything except system indices (starting with '.')
      const patternString = pattern || OMIT_SYSTEM_INDEX_PATTERN;
      return await getRouteService().catIndices(patternString, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error getting indices')
      );
    }
  }
);

export const getMappings = createAsyncThunk(
  GET_MAPPINGS_ACTION,
  async (
    { index, dataSourceId }: { index: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().getMappings(index, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error getting index mappings')
      );
    }
  }
);

export const getIndex = createAsyncThunk(
  GET_INDEX_ACTION,
  async (
    { index, dataSourceId }: { index: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().getIndex(index, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error getting index details')
      );
    }
  }
);

export const searchIndex = createAsyncThunk(
  SEARCH_INDEX_ACTION,
  async (
    {
      apiBody,
      dataSourceId,
      dataSourceVersion,
      verbose,
      signal,
    }: {
      apiBody: { index: string; body: {}; searchPipeline?: string };
      dataSourceId?: string;
      dataSourceVersion?: string;
      verbose?: boolean;
      signal?: AbortSignal;
    },
    { rejectWithValue }
  ) => {
    try {
      const { index, body, searchPipeline } = apiBody;
      return await getRouteService().searchIndex({
        index,
        body,
        dataSourceId,
        dataSourceVersion,
        searchPipeline,
        verbose,
        signal,
      });
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error searching index')
      );
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
    try {
      const { index, doc } = apiBody;
      return await getRouteService().ingest(index, doc, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error ingesting document')
      );
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
    try {
      const { body, ingestPipeline } = apiBody;
      const response = await getRouteService().bulk({
        body,
        dataSourceId,
        ingestPipeline,
      });
      // Ingest errors may be hidden within a 2xx / success response.
      // But, we want to propagate them more, so we surface it as if it was a normal, server-side error
      const ingestErr = parseErrorsFromIngestResponse(response);
      if (ingestErr !== undefined) {
        return rejectWithValue(
          formatRouteServiceError(ingestErr, 'Error performing bulk')
        );
      } else {
        return response;
      }
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error performing bulk')
      );
    }
  }
);

export const simulatePipeline = createAsyncThunk(
  SIMULATE_PIPELINE_ACTION,
  async (
    {
      apiBody,
      dataSourceId,
      pipelineId,
      verbose,
    }: {
      apiBody: {
        pipeline?: IngestPipelineConfig;
        docs: SimulateIngestPipelineDoc[];
      };
      dataSourceId?: string;
      pipelineId?: string;
      verbose?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().simulatePipeline(
        apiBody,
        dataSourceId,
        pipelineId,
        verbose
      );
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error simulating ingest pipeline')
      );
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
    try {
      return await getRouteService().getSearchPipeline(
        pipelineId,
        dataSourceId
      );
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error getting search pipeline')
      );
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
    try {
      return await getRouteService().getIngestPipeline(
        pipelineId,
        dataSourceId
      );
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error getting ingest pipeline')
      );
    }
  }
);

export const getSearchTemplates = createAsyncThunk(
  GET_SEARCH_TEMPLATES_ACTION,
  async ({ dataSourceId }: { dataSourceId?: string }, { rejectWithValue }) => {
    try {
      return await getRouteService().getSearchTemplates(dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error getting search templates')
      );
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
        state.getIndexErrorMessage = '';
      })
      .addCase(getIngestPipeline.pending, (state, action) => {
        state.loading = true;
        state.getIngestPipelineErrorMessage = '';
      })
      .addCase(getSearchPipeline.pending, (state, action) => {
        state.loading = true;
        state.getSearchPipelineErrorMessage = '';
      })
      .addCase(getSearchTemplates.pending, (state, action) => {
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
        const resourceDetailsMap = new Map<string, IndexConfiguration>();
        action.payload.forEach((index: IndexResponse) => {
          resourceDetailsMap.set(index.indexName, index.indexDetails);
        });
        state.indexDetails = Object.fromEntries(resourceDetailsMap.entries());
        state.loading = false;
        state.getIndexErrorMessage = '';
      })
      .addCase(getSearchPipeline.fulfilled, (state, action) => {
        const resourceDetailsMap = new Map<string, SearchPipelineConfig>();
        action.payload.forEach((pipeline: SearchPipelineResponse) => {
          resourceDetailsMap.set(
            pipeline.pipelineId,
            pipeline.searchPipelineDetails
          );
        });
        state.searchPipelineDetails = Object.fromEntries(
          resourceDetailsMap.entries()
        );
        state.loading = false;
        state.getSearchPipelineErrorMessage = '';
      })
      .addCase(getSearchTemplates.fulfilled, (state, action) => {
        state.searchTemplates = action.payload;
        state.loading = false;
      })
      .addCase(getIngestPipeline.fulfilled, (state, action) => {
        const resourceDetailsMap = new Map<string, IngestPipelineConfig>();
        action.payload.forEach((pipeline: IngestPipelineResponse) => {
          resourceDetailsMap.set(
            pipeline.pipelineId,
            pipeline.ingestPipelineDetails
          );
        });
        state.ingestPipelineDetails = Object.fromEntries(
          resourceDetailsMap.entries()
        );
        state.loading = false;
        state.getIngestPipelineErrorMessage = '';
      })
      .addCase(searchIndex.fulfilled, (state, action) => {
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(ingest.fulfilled, (state, action) => {
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(bulk.fulfilled, (state, action) => {
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
        state.getIndexErrorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(getIngestPipeline.rejected, (state, action) => {
        state.getIngestPipelineErrorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(getSearchPipeline.rejected, (state, action) => {
        state.getSearchPipelineErrorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(getSearchTemplates.rejected, (state, action) => {
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
      })
      .addCase(bulk.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(getLocalClusterVersion.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(getLocalClusterVersion.fulfilled, (state, action) => {
        state.localClusterVersion = action.payload;
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(getLocalClusterVersion.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      });
  },
});

export const opensearchReducer = opensearchSlice.reducer;
