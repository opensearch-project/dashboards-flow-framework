/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
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

// Mock SimplifiedJsonField to make onChange/onBlur testable
let capturedOnChange: ((value: string) => void) | undefined;
let capturedOnBlur: ((value: string) => void) | undefined;
jest.mock(
  '../components/simplified_json_field',
  () => ({
    SimplifiedJsonField: (props: any) => {
      capturedOnChange = props.onChange;
      capturedOnBlur = props.onBlur;
      return (
        <div data-testid="simplifiedJsonField">
          <span>{props.label}</span>
          {props.isInvalid && <span data-testid="fallbackQueryError">{props.error}</span>}
        </div>
      );
    },
  })
);

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

    // Check that the generation type field is rendered
    expect(screen.getByTestId('generationTypeField')).toBeInTheDocument();
    expect(screen.getByTestId('generationTypeRadioGroup')).toBeInTheDocument();

    // Check that the fallback query field is rendered
    expect(screen.getByText('Fallback query')).toBeInTheDocument();
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

  test('fallback query onChange shows error for invalid JSON', () => {
    renderAgentTools(mockAgentForm, mockSetAgentForm);
    act(() => {
      capturedOnChange!('not valid json');
    });
    expect(screen.getByTestId('fallbackQueryError')).toHaveTextContent(
      'Invalid JSON'
    );
  });

  test('fallback query onChange clears error for valid JSON', () => {
    renderAgentTools(mockAgentForm, mockSetAgentForm);
    act(() => {
      capturedOnChange!('not valid json');
    });
    expect(screen.getByTestId('fallbackQueryError')).toHaveTextContent(
      'Invalid JSON'
    );
    act(() => {
      capturedOnChange!('{"query": {"match_all": {}}}');
    });
    expect(screen.queryByTestId('fallbackQueryError')).toBeNull();
  });

  test('fallback query onChange removes parameter when cleared', () => {
    renderAgentTools(mockAgentForm, mockSetAgentForm);
    act(() => {
      capturedOnChange!('   ');
    });
    expect(mockSetAgentForm).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.arrayContaining([
          expect.objectContaining({
            parameters: expect.not.objectContaining({
              fallback_query: expect.anything(),
            }),
          }),
        ]),
      })
    );
  });

  test('fallback query onBlur persists value to form', () => {
    renderAgentTools(mockAgentForm, mockSetAgentForm);
    act(() => {
      capturedOnBlur!('{"query": {"match_all": {}}}');
    });
    expect(mockSetAgentForm).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.arrayContaining([
          expect.objectContaining({
            parameters: expect.objectContaining({
              fallback_query: '{"query": {"match_all": {}}}',
            }),
          }),
        ]),
      })
    );
  });
});
