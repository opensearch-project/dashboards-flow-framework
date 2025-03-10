/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { FlowFrameworkDashboardsApp } from './app';
import { store } from './store';

// styling
import './global-styles.scss';

export const renderApp = (coreStart: CoreStart, params: AppMountParameters) => {
  // This is so our base element stretches to fit the entire webpage
  params.element.className = 'stretch-absolute';
  ReactDOM.render(
    <Provider store={store}>
      <Router>
        <Route
          render={(props) => (
            <FlowFrameworkDashboardsApp
              setHeaderActionMenu={params.setHeaderActionMenu}
              {...props}
            />
          )}
        />
      </Router>
    </Provider>,
    params.element
  );

  const unlistenParentHistory = params.history.listen(() => {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });

  return () => {
    ReactDOM.unmountComponentAtNode(params.element);
    unlistenParentHistory();
  };
};
