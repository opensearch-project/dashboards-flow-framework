/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Connector, ConnectorDict } from '../../common';
import { isKnownLLM, isKnownEmbeddingModel } from './utils';

// Mock services to avoid UISettings error
jest.mock('../services', () => {
  const { mockCoreServices } = require('../../test/mocks');
  return {
    ...jest.requireActual('../services'),
    ...mockCoreServices,
  };
});

describe('isKnownLLM and isKnownEmbeddingModel', () => {
  const llmConnector = {
    parameters: { model: 'anthropic.claude-3-sonnet', service_name: 'bedrock' },
    actions: [
      {
        url:
          'https://bedrock-runtime.us-west-2.amazonaws.com/model/anthropic.claude-3-sonnet/converse',
      },
    ],
  } as Partial<Connector>;

  const embeddingConnector = {
    parameters: {
      model: 'amazon.titan-embed-text-v2',
      service_name: 'bedrock',
    },
    actions: [
      {
        url:
          'https://bedrock-runtime.us-west-2.amazonaws.com/model/amazon.titan-embed-text-v2/invoke',
      },
    ],
  } as Partial<Connector>;

  const unknownConnector = {
    parameters: { model: 'my-custom-model' },
    actions: [{ url: 'https://my-server.com/predict' }],
  } as Partial<Connector>;

  const connectors: ConnectorDict = {
    'llm-conn': llmConnector as Connector,
    'embed-conn': embeddingConnector as Connector,
    'unknown-conn': unknownConnector as Connector,
  };

  // Scenario 1: LLM should only show in LLM dropdown
  it('identifies Claude as a known LLM', () => {
    const model = { connector: llmConnector };
    expect(isKnownLLM(model, {})).toBe(true);
    expect(isKnownEmbeddingModel(model, {})).toBe(false);
  });

  it('identifies GPT as a known LLM via URL', () => {
    const model = {
      connector: {
        parameters: { model: 'gpt-4o' },
        actions: [{ url: 'https://api.openai.com/v1/chat/completions' }],
      } as Partial<Connector>,
    };
    expect(isKnownLLM(model, {})).toBe(true);
    expect(isKnownEmbeddingModel(model, {})).toBe(false);
  });

  // Scenario 2: Embedding model should only show in embedding dropdown
  it('identifies Titan Embedding as a known embedding model', () => {
    const model = { connector: embeddingConnector };
    expect(isKnownEmbeddingModel(model, {})).toBe(true);
    expect(isKnownLLM(model, {})).toBe(false);
  });

  it('identifies Cohere Embed as a known embedding model', () => {
    const model = {
      connector: {
        parameters: { model: 'embed-english-v3.0' },
        actions: [{ url: 'https://api.cohere.ai/embed' }],
      } as Partial<Connector>,
    };
    expect(isKnownEmbeddingModel(model, {})).toBe(true);
    expect(isKnownLLM(model, {})).toBe(false);
  });

  // Scenario 3: Unknown/local models show in neither exclusion list
  it('does not identify unknown models as LLM or embedding', () => {
    const model = { connector: unknownConnector };
    expect(isKnownLLM(model, {})).toBe(false);
    expect(isKnownEmbeddingModel(model, {})).toBe(false);
  });

  // Connector resolution via connectorId
  it('resolves connector via connectorId', () => {
    const model = { connectorId: 'llm-conn' };
    expect(isKnownLLM(model, connectors)).toBe(true);

    const embedModel = { connectorId: 'embed-conn' };
    expect(isKnownEmbeddingModel(embedModel, connectors)).toBe(true);
  });

  // No connector at all
  it('returns false when no connector is available', () => {
    expect(isKnownLLM({}, {})).toBe(false);
    expect(isKnownEmbeddingModel({}, {})).toBe(false);
  });

  // Version suffix stripping
  it('identifies embedding model with version suffix', () => {
    const model = {
      connector: {
        parameters: { model: 'amazon.titan-embed-text-v2:0' },
        actions: [
          {
            url:
              'https://bedrock-runtime.us-west-2.amazonaws.com/model/amazon.titan-embed-text-v2:0/invoke',
          },
        ],
      } as Partial<Connector>,
    };
    expect(isKnownEmbeddingModel(model, {})).toBe(true);
    expect(isKnownLLM(model, {})).toBe(false);
  });

  // URL-based embedding detection
  it('identifies embedding model by URL pattern', () => {
    const model = {
      connector: {
        parameters: { model: 'custom-embedding-v1' },
        actions: [{ url: 'https://my-server.com/embed' }],
      } as Partial<Connector>,
    };
    expect(isKnownEmbeddingModel(model, {})).toBe(true);
  });
});
