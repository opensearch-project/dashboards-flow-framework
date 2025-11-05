/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { AgentSelector } from './agent_selector';
import { FormikContext, FormikContextType } from 'formik';
import configureStore from 'redux-mock-store';
import { INITIAL_OPENSEARCH_STATE } from '../../../../store';
import userEvent from '@testing-library/user-event';

jest.mock('../../../../services', () => {
  const { mockCoreServices } = require('../../../../../test/mocks');
  return {
    ...jest.requireActual('../../../../services'),
    ...mockCoreServices,
  };
});

const mockStore = configureStore([]);

describe('AgentSelector', () => {
  const mockAgents = {
    'agent-1': {
      id: 'agent-1',
      name: 'Test Agent 1',
    },
    'agent-2': {
      id: 'agent-2',
      name: 'Test Agent 2',
    },
  };

  const initialState = {
    opensearch: INITIAL_OPENSEARCH_STATE,
    workflows: {},
    presets: {},
    ml: { 
      agents: mockAgents,
      models: {},
      loading: false,
      errorMessage: '',
    },
    errors: { loading: false, errorMessage: '' },
  };

  const mockFormikContext: FormikContextType<any> = {
    values: {
      agent_id: '',
    },
  } as FormikContextType<any>;

  // Reusable render function
  const renderAgentSelector = () => {
    const store = mockStore(initialState);
    return render(
      <Provider store={store}>
        <FormikContext.Provider value={mockFormikContext}>
          <AgentSelector />
        </FormikContext.Provider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders badge by default', () => {
    renderAgentSelector();

    const agentBadge = screen.getByTestId('agentBadge');
    expect(agentBadge).toBeInTheDocument();
  });

  test('clicking badge opens selector', async () => {
    renderAgentSelector();

    const agentBadge = screen.getByTestId('agentBadge');
    await userEvent.click(agentBadge);
    const agentSelector = screen.getByTestId('agentSelector');
    expect(agentSelector).toBeInTheDocument();
  });

  test('shows available agents', async () => {
    renderAgentSelector();

    const agentBadge = screen.getByTestId('agentBadge');
    await userEvent.click(agentBadge);

    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
  });

  test('shows select agent placeholder when no agent selected', () => {
    renderAgentSelector();

    expect(screen.getByText('Select agent')).toBeInTheDocument();
  });
});