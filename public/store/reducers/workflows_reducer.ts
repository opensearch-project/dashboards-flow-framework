/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSlice } from '@reduxjs/toolkit';
import { Workflow } from '../../../common';

const initialState = {
  // TODO: fetch from server-side later
  workflows: [
    {
      name: 'Workflow-1',
      id: 'workflow-1-id',
      description: 'description for workflow 1',
    },
    {
      name: 'Workflow-2',
      id: 'workflow-2-id',
      description: 'description for workflow 2',
    },
  ] as Workflow[],
  loading: false,
};

const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    setWorkflows(state, action) {
      state.workflows = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const workflowsReducer = workflowsSlice.reducer;
export const { setWorkflows, setLoading } = workflowsSlice.actions;
