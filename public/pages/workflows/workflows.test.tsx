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
import { Workflows } from './workflows';

jest.mock('../../services', () => {
  const { mockCoreServices } = require('../../../test');
  return {
    ...jest.requireActual('../../services'),
    ...mockCoreServices,
  };
});

const renderWithRouter = () => ({
  ...render(
    <Provider store={store}>
      <Router>
        <Switch>
          <Route
            render={(props: RouteComponentProps) => <Workflows 
              setActionMenu={jest.fn()}
              landingDataSourceId={undefined} 
              {...props} />}
          />
        </Switch>
      </Router>
    </Provider>
  ),
});

describe('Workflows', () => {
  test('renders the page', () => {
    const { getAllByText } = renderWithRouter();
    expect(getAllByText('Workflows').length).toBeGreaterThan(0);
  });
});
