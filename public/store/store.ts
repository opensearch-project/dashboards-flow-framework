/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThunkDispatch, configureStore } from '@reduxjs/toolkit';
import { AnyAction, combineReducers } from 'redux';
import { useDispatch } from 'react-redux';
import {
  opensearchReducer,
  workflowsReducer,
  presetsReducer,
  modelsReducer,
  formReducer,
} from './reducers';

const rootReducer = combineReducers({
  form: formReducer,
  workflows: workflowsReducer,
  presets: presetsReducer,
  models: modelsReducer,
  opensearch: opensearchReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type AppState = ReturnType<typeof rootReducer>;
export type AppThunkDispatch = ThunkDispatch<AppState, any, AnyAction>;
export const useAppDispatch = () => useDispatch<AppThunkDispatch>();
