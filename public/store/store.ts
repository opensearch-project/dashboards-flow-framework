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
  mlReducer,
} from './reducers';

const rootReducer = combineReducers({
  workflows: workflowsReducer,
  presets: presetsReducer,
  ml: mlReducer,
  opensearch: opensearchReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type AppState = ReturnType<typeof rootReducer>;
export type AppThunkDispatch = ThunkDispatch<AppState, any, AnyAction>;
export const useAppDispatch = () => useDispatch<AppThunkDispatch>();
