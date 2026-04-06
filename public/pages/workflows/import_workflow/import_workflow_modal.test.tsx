/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  INITIAL_OPENSEARCH_STATE,
  INITIAL_WORKFLOWS_STATE,
  INITIAL_PRESETS_STATE,
  INITIAL_ML_STATE,
  INITIAL_ERRORS_STATE,
} from '../../../store';
import { ImportWorkflowModal } from './import_workflow_modal';

jest.mock('../../../services', () => {
  const { mockCoreServices } = require('../../../../test');
  return {
    ...jest.requireActual('../../../services'),
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
  return render(
    <Provider store={store}>
      <Router>
        <Switch>
          <Route
            render={() => (
              <ImportWorkflowModal
                isImportModalOpen={true}
                setIsImportModalOpen={jest.fn()}
                setSelectedTabId={jest.fn()}
              />
            )}
          />
        </Switch>
      </Router>
    </Provider>
  );
};

describe('ImportWorkflowModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders the page', () => {
    const { getAllByText } = renderWithRouter();
    expect(
      getAllByText('Import a workflow (JSON/YAML)').length
    ).toBeGreaterThan(0);
  });
});
