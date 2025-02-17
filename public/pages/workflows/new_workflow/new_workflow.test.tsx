/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MemoryRouter as Router } from 'react-router-dom'; // Change this import
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { NewWorkflow } from './new_workflow';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import * as ReactReduxHooks from '../../../store/store';
import '@testing-library/jest-dom';
import { loadPresetWorkflowTemplates } from '../../../../test/utils';
import {
  INITIAL_ML_STATE,
  INITIAL_WORKFLOWS_STATE,
} from '../../../../public/store';

jest.mock('../../../utils', () => ({
  ...jest.requireActual('../../../utils'),
  getDataSourceId: () => '123',
}));

jest.mock('../../../services', () => {
  const { mockCoreServices } = require('../../../../test');
  return {
    ...jest.requireActual('../../../services'),
    ...mockCoreServices,
  };
});

const mockStore = configureStore([]);
const initialState = {
  ml: INITIAL_ML_STATE,
  presets: {
    loading: false,
    presetWorkflows: loadPresetWorkflowTemplates(),
  },
  workflows: INITIAL_WORKFLOWS_STATE,
  opensearch: {
    loading: false,
    localClusterVersion: null,
  },
};

const mockDispatch = jest.fn();

const renderWithRouter = (store: any) =>
  render(
    <Provider store={store}>
      <Router initialEntries={['/test?dataSourceId=123']}>
        <Switch>
          <Route render={() => <NewWorkflow />} />
        </Switch>
      </Router>
    </Provider>
  );
describe('NewWorkflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(ReactReduxHooks, 'useAppDispatch').mockReturnValue(mockDispatch);
  });

  test('renders the preset workflow names & descriptions', async () => {
    const store = mockStore(initialState);
    const presetWorkflows = loadPresetWorkflowTemplates();
    const { getByPlaceholderText, getByText } = renderWithRouter(store);

    expect(getByPlaceholderText('Search')).toBeInTheDocument();

    await waitFor(() => {
      presetWorkflows.forEach((workflow) => {
        if (
          workflow.name ===
          ['Semantic Search', 'Multimodal Search', 'Hybrid Search'].includes(
            workflow.name
          )
        ) {
          expect(getByText(workflow.name)).toBeInTheDocument();
          expect(getByText(workflow.description)).toBeInTheDocument();
        }
      });
    });
  });

  test('renders the quick configure for preset workflow templates', async () => {
    const store = mockStore({
      ...initialState,
      presets: {
        loading: false,
        presetWorkflows: loadPresetWorkflowTemplates(),
      },
    });

    const {
      getAllByTestId,
      getAllByText,
      getByTestId,
      queryByText,
    } = renderWithRouter(store);

    await waitFor(() => {
      expect(
        document.querySelector('.euiLoadingSpinner')
      ).not.toBeInTheDocument();
    });

    const goButtons = getAllByTestId('goButton');
    expect(goButtons.length).toBeGreaterThan(0);
    userEvent.click(goButtons[0]);

    await waitFor(() => {
      expect(getAllByText('Quick configure')).toHaveLength(1);
    });

    expect(getByTestId('quickConfigureCreateButton')).toBeInTheDocument();

    const quickConfigureCancelButton = getByTestId(
      'quickConfigureCancelButton'
    );
    userEvent.click(quickConfigureCancelButton);

    await waitFor(() => {
      expect(queryByText('quickConfigureCreateButton')).toBeNull();
    });
  });

  test('search functionality ', async () => {
    const store = mockStore(initialState);
    const { getByText, getByPlaceholderText, queryByText } = renderWithRouter(
      store
    );

    userEvent.type(getByPlaceholderText('Search'), 'hybrid');
    await waitFor(() => {
      expect(getByText('Hybrid Search')).toBeInTheDocument();
      expect(queryByText('Multimodal Search')).toBeNull();
    });
  });
});
