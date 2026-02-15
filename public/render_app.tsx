/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
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
  const root = createRoot(params.element);
  root.render(
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
    </Provider>
  );

  const unlistenParentHistory = params.history.listen(() => {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });

  return () => {
    root.unmount();
    unlistenParentHistory();
  };
};
