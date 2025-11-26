/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Connector,
  ConnectorDict,
  Model,
  RESPONSE_FILTER_TYPE,
} from '../../../../../../common';
import { getRelevantResponseFilter } from './query_planning_tool';
export * from '../../../../../services';

// Mock services to avoid UISettings error
jest.mock('../../../../../services', () => {
  const { mockCoreServices } = require('../../../../../../test/mocks');
  return {
    ...jest.requireActual('../../../../../services'),
    ...mockCoreServices,
  };
});

describe('getRelevantResponseFilter', () => {
  const openaiConnector = {
    parameters: { model: 'gpt-4' },
    actions: [{ url: 'https://api.openai.com/v1/chat/completions' }],
  } as Partial<Connector>;
  const bedrockClaudeConnector = {
    parameters: {
      model: 'claude-3-sonnet',
      service_name: 'bedrock',
    },
  } as Partial<Connector>;

  const openAiModel = {
    connector: openaiConnector,
  } as Partial<Model>;
  const bedrockClaudeModel = {
    connector: bedrockClaudeConnector,
  } as Partial<Model>;

  const mockConnectors: ConnectorDict = {
    'openai-connector': openaiConnector,
  };

  it('should return same result for embedded connector vs connectorId', () => {
    const modelWithEmbedded = {
      id: 'model-1',
      connector: openaiConnector,
    } as Partial<Model>;

    const modelWithId = {
      id: 'model-2',
      connectorId: 'openai-connector',
    } as Model;

    const result1 = getRelevantResponseFilter(modelWithEmbedded, {});
    const result2 = getRelevantResponseFilter(modelWithId, mockConnectors);

    expect(result1).toBe(result2);
    expect(result1).toBe(RESPONSE_FILTER_TYPE.OPENAI);
  });

  it('should return OPENAI filter for OpenAI models', () => {
    const result = getRelevantResponseFilter(openAiModel, {});
    expect(result).toBe(RESPONSE_FILTER_TYPE.OPENAI);
  });

  it('should return BEDROCK_CLAUDE filter for Claude models', () => {
    const result = getRelevantResponseFilter(bedrockClaudeModel, {});
    expect(result).toBe(RESPONSE_FILTER_TYPE.BEDROCK_CLAUDE);
  });

  it('should return undefined for unknown models', () => {
    const model = {
      connector: {
        parameters: {
          model: 'unknown-model',
          service_name: 'unknown-service',
        },
      },
    } as Partial<Model>;

    const result = getRelevantResponseFilter(model, {});
    expect(result).toBeUndefined();
  });
});
