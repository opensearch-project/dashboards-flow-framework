/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSlice } from '@reduxjs/toolkit';
import { Node, Edge } from 'reactflow';
import { IComponent } from '../../../common';
import { KnnIndex, TextEmbeddingProcessor } from '../../component_types';

// TODO: fetch from server-size if it is a created workflow, else have some default
// mapping somewhere (e.g., 'semantic search': text_embedding_processor, knn_index, etc.)

// TODO: we should store as IComponents. Have some helper fn for converting these to a
// actual ReactFlow Node. examples of reactflow nodes below.
const iComponents = [
  new TextEmbeddingProcessor(),
  new KnnIndex(),
] as IComponent[];

const dummyComponents = [
  {
    id: 'semantic-search',
    position: { x: 40, y: 10 },
    data: { label: 'Semantic Search' },
    type: 'group',
    style: {
      height: 110,
      width: 700,
    },
  },
  {
    id: 'model',
    position: { x: 25, y: 25 },
    data: { label: 'Deployed Model ID' },
    type: 'default',
    parentNode: 'semantic-search',
    extent: 'parent',
  },
  {
    id: 'ingest-pipeline',
    position: { x: 262, y: 25 },
    data: { label: 'Ingest Pipeline Name' },
    type: 'default',
    parentNode: 'semantic-search',
    extent: 'parent',
  },
] as Array<
  Node<
    {
      label: string;
    },
    string | undefined
  >
>;

const dummyEdges = [
  {
    id: 'e1-2',
    source: 'model',
    target: 'ingest-pipeline',
    style: {
      strokeWidth: 2,
      stroke: 'black',
    },
    markerEnd: {
      type: 'arrow',
      strokeWidth: 1,
      color: 'black',
    },
  },
] as Array<Edge<any>>;

const initialState = {
  isDirty: false,
  components: dummyComponents,
  edges: dummyEdges,
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
    setEdges(state, action) {
      state.edges = action.payload;
      state.isDirty = true;
    },
  },
});

export const workspaceReducer = workspaceSlice.reducer;
export const {
  setDirty,
  removeDirty,
  setComponents,
  setEdges,
} = workspaceSlice.actions;
