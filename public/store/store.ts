/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { workspaceReducer, opensearchReducer } from './reducers';

const rootReducer = combineReducers({
  workspace: workspaceReducer,
  opensearch: opensearchReducer,
});
export const store = configureStore({
  reducer: rootReducer,
});

export type AppState = ReturnType<typeof rootReducer>;
