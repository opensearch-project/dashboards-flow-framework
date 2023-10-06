/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDirty: false,
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
  },
});

export const workspaceReducer = workspaceSlice.reducer;
export const { setDirty, removeDirty } = workspaceSlice.actions;
