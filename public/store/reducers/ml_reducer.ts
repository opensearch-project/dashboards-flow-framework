/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Agent, AgentDict, ConnectorDict, ModelDict } from '../../../common';
import { getRouteService } from '../../services';
import { formatRouteServiceError } from '../../utils';

export const INITIAL_ML_STATE = {
  loading: false,
  errorMessage: '',
  models: {} as ModelDict,
  connectors: {} as ConnectorDict,
  agents: {} as AgentDict,
};

const MODELS_ACTION_PREFIX = 'models';
const CONNECTORS_ACTION_PREFIX = 'connectors';
const AGENTS_ACTION_PREFIX = 'agents';
const SEARCH_MODELS_ACTION = `${MODELS_ACTION_PREFIX}/search`;
const SEARCH_CONNECTORS_ACTION = `${CONNECTORS_ACTION_PREFIX}/search`;
const REGISTER_AGENT_ACTION = `${AGENTS_ACTION_PREFIX}/register`;
const UPDATE_AGENT_ACTION = `${AGENTS_ACTION_PREFIX}/update`;
const SEARCH_AGENTS_ACTION = `${AGENTS_ACTION_PREFIX}/search`;
const GET_AGENT_ACTION = `${AGENTS_ACTION_PREFIX}/getAgent`;

export const searchModels = createAsyncThunk(
  SEARCH_MODELS_ACTION,
  async (
    { apiBody, dataSourceId }: { apiBody: {}; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().searchModels(apiBody, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error searching models')
      );
    }
  }
);

export const searchConnectors = createAsyncThunk(
  SEARCH_CONNECTORS_ACTION,
  async (
    { apiBody, dataSourceId }: { apiBody: {}; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().searchConnectors(apiBody, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error searching connectors')
      );
    }
  }
);

export const registerAgent = createAsyncThunk(
  REGISTER_AGENT_ACTION,
  async (
    { apiBody, dataSourceId }: { apiBody: {}; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().registerAgent(apiBody, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error registering agent')
      );
    }
  }
);

export const searchAgents = createAsyncThunk(
  SEARCH_AGENTS_ACTION,
  async (
    { apiBody, dataSourceId }: { apiBody: {}; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().searchAgents(apiBody, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error searching agents')
      );
    }
  }
);

export const updateAgent = createAsyncThunk(
  UPDATE_AGENT_ACTION,
  async (
    {
      agentId,
      body,
      dataSourceId,
    }: { agentId: string; body: {}; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().updateAgent(agentId, body, dataSourceId);
    } catch (e) {
      return rejectWithValue(
        formatRouteServiceError(e, 'Error updating agent')
      );
    }
  }
);

export const getAgent = createAsyncThunk(
  GET_AGENT_ACTION,
  async (
    { agentId, dataSourceId }: { agentId: string; dataSourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await getRouteService().getAgent(agentId, dataSourceId);
    } catch (e) {
      return rejectWithValue(formatRouteServiceError(e, 'Error getting agent'));
    }
  }
);

const mlSlice = createSlice({
  name: 'ml',
  initialState: INITIAL_ML_STATE,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Pending states
      .addCase(searchModels.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(searchConnectors.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(registerAgent.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(updateAgent.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(searchAgents.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(getAgent.pending, (state) => {
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
      .addCase(registerAgent.fulfilled, (state, action) => {
        const { agent } = action.payload as { agent: Agent };
        if (agent && agent.id) {
          state.agents = {
            ...state.agents,
            [agent.id]: agent,
          };
        }
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        const { agent } = action.payload as { agent: Agent };
        if (agent && agent.id) {
          state.agents = {
            ...state.agents,
            [agent.id]: agent,
          };
        }
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(searchAgents.fulfilled, (state, action) => {
        const { agents } = action.payload as { agents: AgentDict };
        state.agents = agents;
        state.loading = false;
        state.errorMessage = '';
      })
      .addCase(getAgent.fulfilled, (state, action) => {
        const { agent } = action.payload as { agent: Agent };
        if (agent && agent.id) {
          state.agents = {
            ...state.agents,
            [agent.id]: agent,
          };
        }
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
      })
      .addCase(registerAgent.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(searchAgents.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      })
      .addCase(getAgent.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
        state.loading = false;
      });
  },
});

export const mlReducer = mlSlice.reducer;
