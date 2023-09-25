/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AiFlowDashboardsApp } from './app';
import { store, ReactFlowContextProvider } from './store';

export const renderApp = (
  coreStart: CoreStart,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <Provider store={store}>
      <ReactFlowContextProvider>
        <Router basename={appBasePath + '#/'}>
          <Route render={(props) => <AiFlowDashboardsApp {...props} />} />
        </Router>
      </ReactFlowContextProvider>
    </Provider>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
