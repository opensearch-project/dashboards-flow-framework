/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { store } from '../../../store';
import { WorkflowList } from './workflow_list';

jest.mock('../../../services', () => {
  const { mockCoreServices } = require('../../../../test');
  return {
    ...jest.requireActual('../../../services'),
    ...mockCoreServices,
  };
});

const renderWithRouter = () =>
  render(
    <Provider store={store}>
      <Router>
        <Switch>
          <Route render={() => <WorkflowList setSelectedTabId={jest.fn()} />} />
        </Switch>
      </Router>
    </Provider>
  );

describe('WorkflowList', () => {
  test('renders the page', () => {
    const { getAllByText } = renderWithRouter();
    expect(getAllByText('Manage existing workflows').length).toBeGreaterThan(0);
  });
});
