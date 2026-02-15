/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { AGENT_LLM_INTERFACE_TYPE, AGENT_TYPE } from '../../../../../common';
import { INITIAL_ML_STATE } from '../../../../store';
import {
  AgentAdvancedSettings,
  getReadableInterface,
  getRelevantInterface,
} from './agent_advanced_settings';

jest.mock('../../../../services', () => {
  const { mockCoreServices } = require('../../../../../test/mocks');
  return {
    ...jest.requireActual('../../../../services'),
    ...mockCoreServices,
  };
});

const mockStore = configureStore([]);

describe('getReadableInterface', () => {
  test('returns OpenAI for OPENAI interface type', () => {
    expect(getReadableInterface(AGENT_LLM_INTERFACE_TYPE.OPENAI)).toBe('OpenAI');
  });

  test('returns Bedrock Claude for BEDROCK_CLAUDE interface type', () => {
    expect(getReadableInterface(AGENT_LLM_INTERFACE_TYPE.BEDROCK_CLAUDE)).toBe('Bedrock Claude');
  });

  test('returns Bedrock DeepSeek for BEDROCK_DEEPSEEK interface type', () => {
    expect(getReadableInterface(AGENT_LLM_INTERFACE_TYPE.BEDROCK_DEEPSEEK)).toBe('Bedrock DeepSeek');
  });

  test('returns the input value for unknown interface types', () => {
    expect(getReadableInterface('custom_interface' as AGENT_LLM_INTERFACE_TYPE)).toBe('custom_interface');
  });
});

describe('getRelevantInterface', () => {
  test('returns OPENAI when connector model includes gpt', () => {
    const models = {
      model1: { connector: { parameters: { model: 'gpt-4' } } },
    };
    expect(getRelevantInterface('model1', models, {})).toBe(AGENT_LLM_INTERFACE_TYPE.OPENAI);
  });

  test('returns OPENAI when remote inference URL includes openai', () => {
    const models = {
      model1: { connector: { actions: [{ url: 'https://api.openai.com/v1/chat' }] } },
    };
    expect(getRelevantInterface('model1', models, {})).toBe(AGENT_LLM_INTERFACE_TYPE.OPENAI);
  });

  test('returns BEDROCK_CLAUDE when model includes claude and service_name includes bedrock', () => {
    const models = {
      model1: { connector: { parameters: { model: 'claude-3', service_name: 'bedrock' } } },
    };
    expect(getRelevantInterface('model1', models, {})).toBe(AGENT_LLM_INTERFACE_TYPE.BEDROCK_CLAUDE);
  });

  test('returns BEDROCK_DEEPSEEK when model includes deepseek and service_name includes bedrock', () => {
    const models = {
      model1: { connector: { parameters: { model: 'deepseek-r1', service_name: 'bedrock' } } },
    };
    expect(getRelevantInterface('model1', models, {})).toBe(AGENT_LLM_INTERFACE_TYPE.BEDROCK_DEEPSEEK);
  });

  test('returns undefined when no matching interface is found', () => {
    const models = {
      model1: { connector: { parameters: { model: 'unknown-model' } } },
    };
    expect(getRelevantInterface('model1', models, {})).toBeUndefined();
  });

  test('uses standalone connector when model has connectorId reference', () => {
    const models = { model1: { connectorId: 'connector1' } };
    const connectors = {
      connector1: { parameters: { model: 'gpt-4' } },
    };
    expect(getRelevantInterface('model1', models, connectors)).toBe(AGENT_LLM_INTERFACE_TYPE.OPENAI);
  });

  test('returns undefined for non-existent model', () => {
    expect(getRelevantInterface('nonexistent', {}, {})).toBeUndefined();
  });
});

describe('AgentAdvancedSettings', () => {
  const createStore = (models = {}) =>
    mockStore({
      ml: { ...INITIAL_ML_STATE, models, connectors: {} },
    });

  test('updates LLM interface when model changes', () => {
    const models = {
      openaiModel: { connector: { parameters: { model: 'gpt-4' } } },
      claudeModel: { connector: { parameters: { model: 'claude-3', service_name: 'bedrock' } } },
    };
    const store = createStore(models);
    const setAgentForm = jest.fn();

    // Initial render with OpenAI model
    const { rerender } = render(
      <Provider store={store}>
        <AgentAdvancedSettings
          agentForm={{ type: AGENT_TYPE.CONVERSATIONAL, llm: { model_id: 'openaiModel' } }}
          setAgentForm={setAgentForm}
        />
      </Provider>
    );

    expect(setAgentForm).toHaveBeenCalledWith(
      expect.objectContaining({
        parameters: expect.objectContaining({
          _llm_interface: AGENT_LLM_INTERFACE_TYPE.OPENAI,
        }),
      })
    );

    setAgentForm.mockClear();

    // Change to Claude model
    rerender(
      <Provider store={store}>
        <AgentAdvancedSettings
          agentForm={{ type: AGENT_TYPE.CONVERSATIONAL, llm: { model_id: 'claudeModel' } }}
          setAgentForm={setAgentForm}
        />
      </Provider>
    );

    expect(setAgentForm).toHaveBeenCalledWith(
      expect.objectContaining({
        parameters: expect.objectContaining({
          _llm_interface: AGENT_LLM_INTERFACE_TYPE.BEDROCK_CLAUDE,
        }),
      })
    );
  });
});
