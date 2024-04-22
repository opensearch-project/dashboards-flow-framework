/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { FlowFrameworkDashboardsApp } from './app';
import { store } from './store';

// styling
import './global-styles.scss';

export const renderApp = (
  coreStart: CoreStart,
  { appBasePath, element }: AppMountParameters
) => {
  // This is so our base element stretches to fit the entire webpage
  element.className = 'stretch-absolute';
  ReactDOM.render(
    <Provider store={store}>
      <Router basename={appBasePath + '#/'}>
        <Route render={(props) => <FlowFrameworkDashboardsApp {...props} />} />
      </Router>
    </Provider>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
