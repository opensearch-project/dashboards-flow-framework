/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { AgentTools } from './agent_tools';
import { AGENT_TYPE, TOOL_TYPE } from '../../../../../common';
import { FormikContext, FormikContextType } from 'formik';
import configureStore from 'redux-mock-store';
import { INITIAL_ML_STATE, INITIAL_OPENSEARCH_STATE } from '../../../../store';

// Mock services to avoid UISettings error
jest.mock('../../../../services', () => {
  const { mockCoreServices } = require('../../../../../test/mocks');
  return {
    ...jest.requireActual('../../../../services'),
    ...mockCoreServices,
  };
});

// Setup mock store
const mockStore = configureStore([]);

describe('AgentTools', () => {
  // Create initial Redux state for tests
  const initialState = {
    ml: {
      ...INITIAL_ML_STATE,
      models: {
        model1: { id: 'model1', name: 'Test Model 1', state: 'deployed' },
        model2: { id: 'model2', name: 'Test Model 2', state: 'deployed' },
      },
    },
    opensearch: {
      ...INITIAL_OPENSEARCH_STATE,
      searchTemplates: {
        template1: { id: 'template1', name: 'Test Template 1' },
        template2: { id: 'template2', name: 'Test Template 2' },
      },
    },
    errors: { loading: false, errorMessage: '' },
    workflows: {},
    presets: {},
  };

  // Mock agent form with some tools
  const mockAgentForm = {
    type: AGENT_TYPE.CONVERSATIONAL,
    tools: [
      {
        type: TOOL_TYPE.QUERY_PLANNING,
        description: 'Test query planning tool',
        parameters: {
          model_id: 'model1',
          generation_type: 'llmGenerated',
          search_templates: [],
        },
      },
    ],
  };

  const mockFormikContext = {
    values: {
      agent: {
        id: 'new',
      },
    },
  } as FormikContextType<any>;

  const mockSetAgentForm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Reusable render function
  const renderAgentTools = (
    agentFormProps = mockAgentForm,
    setAgentFormFn = jest.fn()
  ) => {
    const store = mockStore(initialState);
    return render(
      <Provider store={store}>
        <FormikContext.Provider value={mockFormikContext}>
          <AgentTools
            agentForm={agentFormProps}
            setAgentForm={setAgentFormFn}
          />
        </FormikContext.Provider>
      </Provider>
    );
  };

  test('renders all expected components', () => {
    renderAgentTools();

    // Check that the query planning section is rendered and enabled
    expect(screen.getByText('Query Planning')).toBeInTheDocument();
    expect(
      screen.getByTestId('queryplanningtoolToolToggle')
    ).toBeInTheDocument();

    // Check that the model field is rendered
    expect(screen.getByTestId('queryPlanningModelField')).toBeInTheDocument();

    // Check that the generation type field is rendered
    expect(screen.getByTestId('generationTypeField')).toBeInTheDocument();
    expect(screen.getByTestId('generationTypeRadioGroup')).toBeInTheDocument();
  });

  test('shows different tool options based on agent type', () => {
    // For FLOW agent type, only QUERY_PLANNING should be available
    renderAgentTools(
      { ...mockAgentForm, type: AGENT_TYPE.FLOW },
      mockSetAgentForm
    );

    // Should show Query Planning
    expect(screen.getByText('Query Planning')).toBeInTheDocument();

    // Should not show Web Search for FLOW agent
    expect(screen.queryByText('Web Search')).toBeNull();

    // Now render with CONVERSATIONAL agent type which should show all tools
    renderAgentTools(
      { ...mockAgentForm, type: AGENT_TYPE.CONVERSATIONAL },
      mockSetAgentForm
    );

    // Should show both Query Planning and Web Search
    expect(screen.getAllByText('Query Planning').length).toBeGreaterThan(0);
    expect(screen.getByText('Web Search')).toBeInTheDocument();
  });
});
