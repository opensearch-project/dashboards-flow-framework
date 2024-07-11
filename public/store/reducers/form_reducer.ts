/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDirty: false,
};

const formSlice = createSlice({
  name: 'form',
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

export const formReducer = formSlice.reducer;
export const { setDirty, removeDirty } = formSlice.actions;
