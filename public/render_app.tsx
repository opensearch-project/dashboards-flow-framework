/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AiFlowDashboardsApp } from './app';

export const renderApp = (
  coreStart: CoreStart,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <Router basename={appBasePath + '#/'}>
      <Route render={(props) => <AiFlowDashboardsApp {...props} />} />
    </Router>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
