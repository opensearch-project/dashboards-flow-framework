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
  params: AppMountParameters,
  hideInAppSideNavBar: boolean
) => {
  // This is so our base element stretches to fit the entire webpage
  params.element.className = 'stretch-absolute';
  ReactDOM.render(
    <Provider store={store}>
      <Router basename={params.appBasePath + '#/'}>
        <Route
          render={(props) => (
            <FlowFrameworkDashboardsApp
              setHeaderActionMenu={params.setHeaderActionMenu}
              hideInAppSideNavBar={hideInAppSideNavBar}
              {...props}
            />
          )}
        />
      </Router>
    </Provider>,
    params.element
  );

  const expectedBasePath = '/app/flow-framework#';

  const unlistenParentHistory = params.history.listen(() => {
    if (
      hideInAppSideNavBar &&
      window.location.pathname.endsWith('/app/flow-framework')
    ) {
      window.location.href = `${expectedBasePath}`;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  });

  return () => {
    ReactDOM.unmountComponentAtNode(params.element);
    unlistenParentHistory();
  };
};
