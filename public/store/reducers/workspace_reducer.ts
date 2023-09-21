/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDirty: false,
  components: [],
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setDirty(state) {
      state.isDirty = true;
    },
    removeDirty(state) {
      state.isDirty = false;
    },
    setComponents(state, action) {
      state.components = action.payload;
      state.isDirty = true;
    },
  },
});

export const workspaceReducer = workspaceSlice.reducer;
export const { setDirty, removeDirty, setComponents } = workspaceSlice.actions;
