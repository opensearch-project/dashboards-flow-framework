/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import {
  BrowserRouter as Router,
  RouteComponentProps,
  Route,
  Switch,
} from 'react-router-dom';
import { store } from '../../store';
import { WorkflowDetail } from './workflow_detail';
import { WorkflowDetailRouterProps } from '../../pages';

jest.mock('../../services', () => {
  const { mockCoreServices } = require('../../../test');
  return {
    ...jest.requireActual('../../services'),
    ...mockCoreServices,
  };
});

const renderWithRouter = () =>
  render(
    <Provider store={store}>
      <Router>
        <Switch>
          <Route
            path="/workflow/:workflowId"
            render={(props: RouteComponentProps<WorkflowDetailRouterProps>) => (
              <WorkflowDetail setActionMenu={jest.fn()} {...props} />
            )}
          />
        </Switch>
      </Router>
    </Provider>
  );

describe('WorkflowDetail', () => {
  test('renders the page', () => {
    const { container, baseElement } = renderWithRouter();
    expect(baseElement.tagName).toBe('BODY');
    expect(container.tagName).toBe('DIV');
  });
});
