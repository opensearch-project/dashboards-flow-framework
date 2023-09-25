/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSlice } from '@reduxjs/toolkit';
import { IComponent } from '../../../common';
import { KnnIndex, TextEmbeddingProcessor } from '../../component_types';

// TODO: should be fetched from server-side
const dummyComponents = [
  new TextEmbeddingProcessor(),
  new KnnIndex(),
] as IComponent[];

const initialState = {
  isDirty: false,
  components: dummyComponents,
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
