/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSlice } from '@reduxjs/toolkit';
import { IComponent } from '../../../common';
import { KnnIndex, TextEmbeddingProcessor } from '../../component_types';

const initialState = {
  isDirty: false,
  // TODO: fetch from server-size if it is a created workflow, else have some default
  // mapping somewhere (e.g., 'semantic search': text_embedding_processor, knn_index, etc.)
  components: [new TextEmbeddingProcessor(), new KnnIndex()] as IComponent[],
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
