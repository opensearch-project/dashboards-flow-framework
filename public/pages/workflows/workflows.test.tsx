/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  RouteComponentProps,
  Route,
  Switch,
} from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  INITIAL_OPENSEARCH_STATE,
  INITIAL_WORKFLOWS_STATE,
  INITIAL_PRESETS_STATE,
  INITIAL_ML_STATE,
  INITIAL_ERRORS_STATE,
} from '../../store';
import { Workflows } from './workflows';

jest.mock('../../services', () => {
  const { mockCoreServices } = require('../../../test');
  return {
    ...jest.requireActual('../../services'),
    ...mockCoreServices,
  };
});

const mockConfigureStore = configureStore([thunk]);
const initialState = {
  opensearch: INITIAL_OPENSEARCH_STATE,
  workflows: INITIAL_WORKFLOWS_STATE,
  presets: INITIAL_PRESETS_STATE,
  ml: INITIAL_ML_STATE,
  errors: INITIAL_ERRORS_STATE,
};

const renderWithRouter = () => {
  const store = mockConfigureStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <Router>
          <Switch>
            <Route
              render={(props: RouteComponentProps) => (
                <Workflows setActionMenu={jest.fn()} {...props} />
              )}
            />
          </Switch>
        </Router>
      </Provider>
    ),
  };
};

describe('Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders the page', async () => {
    const { getAllByText, getByTestId, queryByText } = renderWithRouter();

    // The "Manage Workflows" tab is displayed by default

    // Import Workflow Testing
    expect(getAllByText('Workflows').length).toBeGreaterThan(0);
    const importWorkflowButton = getByTestId('importWorkflowButton');
    userEvent.click(importWorkflowButton);
    await waitFor(() => {
      expect(
        getAllByText('Select or drag and drop a file').length
      ).toBeGreaterThan(0);
    });

    // Closing or canceling the import
    const cancelImportButton = getByTestId('cancelImportButton');
    userEvent.click(cancelImportButton);
    await waitFor(() => {
      expect(
        queryByText('Select or drag and drop a file')
      ).not.toBeInTheDocument();
    });

    // When the "Create Workflow" button is clicked, the "New workflow" tab opens
    // Create Workflow Testing
    const createWorkflowButton = getByTestId('createWorkflowButton');
    expect(createWorkflowButton).toBeInTheDocument();
    userEvent.click(createWorkflowButton);
    await waitFor(() => {
      expect(
        getAllByText('Create a workflow using a template').length
      ).toBeGreaterThan(0);
    });
  });
});
