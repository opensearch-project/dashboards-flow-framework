/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  generateCustomError,
  isIgnorableError,
  toWorkflowObj,
  getWorkflowsFromResponses,
  getModelsFromResponses,
  getConnectorsFromResponses,
  getWorkflowStateFromResponse,
  getResourcesCreatedFromResponse,
  toAgentObj,
  getAgentsFromResponses,
} from './helpers';
import {
  INDEX_NOT_FOUND_EXCEPTION,
  INVALID_DATASOURCE_MSG,
  NO_MODIFICATIONS_FOUND_TEXT,
  WORKFLOW_STATE,
  WORKFLOW_RESOURCE_TYPE,
  MODEL_STATE,
  MODEL_ALGORITHM,
} from '../../common';

describe('helpers', () => {
  describe('generateCustomError', () => {
    const mockRes = {
      customError: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('handles datasource error', () => {
      const err = { message: `Error: ${INVALID_DATASOURCE_MSG}` };
      generateCustomError(mockRes, err);
      expect(mockRes.customError).toHaveBeenCalledWith({
        statusCode: 404,
        body: { message: 'Data source not found' },
      });
    });

    test('handles general error with statusCode', () => {
      const err = { statusCode: 400, message: 'Bad request' };
      generateCustomError(mockRes, err);
      expect(mockRes.customError).toHaveBeenCalledWith({
        statusCode: 400,
        body: {
          message: 'Bad request',
          attributes: { error: 'Bad request' },
        },
      });
    });

    test('handles error without statusCode', () => {
      const err = { message: 'Unknown error' };
      generateCustomError(mockRes, err);
      expect(mockRes.customError).toHaveBeenCalledWith({
        statusCode: 500,
        body: {
          message: 'Unknown error',
          attributes: { error: 'Unknown error' },
        },
      });
    });
  });

  describe('isIgnorableError', () => {
    test('returns true for index not found exception', () => {
      const error = { body: { error: { type: INDEX_NOT_FOUND_EXCEPTION } } };
      expect(isIgnorableError(error)).toBe(true);
    });

    test('returns true for caused by index not found exception', () => {
      const error = {
        body: { error: { caused_by: { type: INDEX_NOT_FOUND_EXCEPTION } } },
      };
      expect(isIgnorableError(error)).toBe(true);
    });

    test('returns true for no modifications found', () => {
      const error = { body: { error: NO_MODIFICATIONS_FOUND_TEXT } };
      expect(isIgnorableError(error)).toBe(true);
    });

    test('returns false for other errors', () => {
      const error = { body: { error: { type: 'other_error' } } };
      expect(isIgnorableError(error)).toBe(false);
    });
  });

  describe('toWorkflowObj', () => {
    test('converts hit source to workflow object', () => {
      const hitSource = {
        name: 'test-workflow',
        use_case: 'test-case',
        description: 'test description',
        version: '1.0.0',
        workflows: {},
        ui_metadata: {},
        last_updated_time: 123456789,
        last_provisioned_time: 987654321,
      };
      const id = 'workflow-id';

      const result = toWorkflowObj(hitSource, id);

      expect(result).toEqual({
        id: 'workflow-id',
        name: 'test-workflow',
        use_case: 'test-case',
        description: 'test description',
        version: '1.0.0',
        workflows: {},
        ui_metadata: {},
        lastUpdated: 123456789,
        lastLaunched: 987654321,
      });
    });

    test('handles missing description', () => {
      const hitSource = { name: 'test-workflow' };
      const result = toWorkflowObj(hitSource, 'id');
      expect(result.description).toBe('');
    });
  });

  describe('getWorkflowsFromResponses', () => {
    test('combines workflow and state hits', () => {
      const workflowHits = [
        { _id: 'wf1', _source: { name: 'workflow1' } },
        { _id: 'wf2', _source: { name: 'workflow2' } },
      ];
      const workflowStateHits = [
        {
          _id: 'wf1',
          _source: { state: 'COMPLETED', error: null, resources_created: [] },
        },
      ];

      const result = getWorkflowsFromResponses(workflowHits, workflowStateHits);

      expect(result).toHaveProperty('wf1');
      expect(result).toHaveProperty('wf2');
      expect(result.wf1.state).toBe(WORKFLOW_STATE.COMPLETED);
      expect(result.wf2.state).toBe(WORKFLOW_STATE.NOT_STARTED);
    });
  });

  describe('getModelsFromResponses', () => {
    test('converts model hits to model dict', () => {
      const modelHits = [
        {
          _id: 'model1',
          _source: {
            name: 'test-model',
            algorithm: 'TEXT_EMBEDDING',
            model_state: 'DEPLOYED',
            model_config: {
              model_type: 'embedding',
              embedding_dimension: 768,
            },
            connector_id: 'conn1',
          },
        },
      ];

      const result = getModelsFromResponses(modelHits);

      expect(result.model1).toEqual({
        id: 'model1',
        name: 'test-model',
        algorithm: MODEL_ALGORITHM.TEXT_EMBEDDING,
        state: MODEL_STATE.DEPLOYED,
        modelConfig: {
          modelType: 'embedding',
          embeddingDimension: 768,
        },
        interface: undefined,
        connectorId: 'conn1',
        connector: undefined,
      });
    });

    test('skips model chunks', () => {
      const modelHits = [
        { _id: 'model1', _source: { chunk_number: 1 } },
        { _id: 'model2', _source: { name: 'valid-model' } },
      ];

      const result = getModelsFromResponses(modelHits);

      expect(result).not.toHaveProperty('model1');
      expect(result).toHaveProperty('model2');
    });

    test('parses model interface', () => {
      const modelHits = [
        {
          _id: 'model1',
          _source: {
            interface: {
              input: '{"type": "string"}',
              output: '{"type": "object"}',
            },
          },
        },
      ];

      const result = getModelsFromResponses(modelHits);

      expect(result.model1.interface).toEqual({
        input: { type: 'string' },
        output: { type: 'object' },
      });
    });
  });

  describe('getConnectorsFromResponses', () => {
    test('converts connector hits to connector dict', () => {
      const connectorHits = [
        {
          _id: 'conn1',
          _source: {
            name: 'test-connector',
            protocol: 'http',
            parameters: {
              model: 'gpt-3.5',
              dimensions: 1536,
              service_name: 'bedrock',
            },
            actions: [{ action: 'predict' }],
            client_config: { timeout: 30 },
          },
        },
      ];

      const result = getConnectorsFromResponses(connectorHits);

      expect(result.conn1).toEqual({
        id: 'conn1',
        name: 'test-connector',
        protocol: 'http',
        parameters: {
          model: 'gpt-3.5',
          dimensions: 1536,
          service_name: 'bedrock',
        },
        actions: [{ action: 'predict' }],
        client_config: { timeout: 30 },
      });
    });
  });

  describe('getWorkflowStateFromResponse', () => {
    test('returns mapped workflow state', () => {
      expect(getWorkflowStateFromResponse('COMPLETED')).toBe(
        WORKFLOW_STATE.COMPLETED
      );
      expect(getWorkflowStateFromResponse('FAILED')).toBe(
        WORKFLOW_STATE.FAILED
      );
    });

    test('returns default state for undefined', () => {
      expect(getWorkflowStateFromResponse(undefined)).toBe(
        WORKFLOW_STATE.NOT_STARTED
      );
    });
  });

  describe('getResourcesCreatedFromResponse', () => {
    test('converts backend resources to frontend format', () => {
      const backendResources = [
        {
          resource_id: 'index1',
          workflow_step_name: 'create_index',
          resource_type: 'index_name',
        },
        {
          resource_id: 'pipeline1',
          workflow_step_name: 'create_ingest_pipeline',
          resource_type: 'pipeline_id',
        },
      ];

      const result = getResourcesCreatedFromResponse(backendResources);

      expect(result).toEqual([
        {
          id: 'index1',
          stepType: 'create_index',
          type: WORKFLOW_RESOURCE_TYPE.INDEX_NAME,
        },
        {
          id: 'pipeline1',
          stepType: 'create_ingest_pipeline',
          type: WORKFLOW_RESOURCE_TYPE.PIPELINE_ID,
        },
      ]);
    });

    test('returns empty array for undefined resources', () => {
      expect(getResourcesCreatedFromResponse(undefined)).toEqual([]);
    });
  });

  describe('toAgentObj', () => {
    test('converts hit source to agent object', () => {
      const hitSource = {
        name: 'test-agent',
        type: 'conversational',
        description: 'test description',
        tools: [{ type: 'SearchIndexTool' }],
        llm: { model_id: 'model1' },
        memory: { type: 'conversation_index' },
        parameters: { mcp_connectors: '[{"mcp_connector_id": "conn1"}]' },
      };

      const result = toAgentObj(hitSource, 'agent1');

      expect(result).toEqual({
        id: 'agent1',
        name: 'test-agent',
        type: 'conversational',
        description: 'test description',
        tools: [{ type: 'SearchIndexTool' }],
        llm: { model_id: 'model1' },
        memory: { type: 'conversation_index' },
        parameters: {
          mcp_connectors: [{ mcp_connector_id: 'conn1' }],
        },
      });
    });

    test('handles invalid MCP connectors JSON', () => {
      const hitSource = {
        parameters: { mcp_connectors: 'invalid-json' },
      };

      const result = toAgentObj(hitSource, 'agent1');

      expect(result.parameters.mcp_connectors).toBeUndefined();
    });
  });

  describe('getAgentsFromResponses', () => {
    test('converts agent hits to agent dict', () => {
      const agentHits = [
        {
          _id: 'agent1',
          _source: {
            name: 'test-agent',
            type: 'conversational',
          },
        },
      ];

      const result = getAgentsFromResponses(agentHits);

      expect(result.agent1).toEqual({
        id: 'agent1',
        name: 'test-agent',
        type: 'conversational',
        description: undefined,
        tools: undefined,
        llm: undefined,
        memory: undefined,
        parameters: { mcp_connectors: undefined },
      });
    });
  });
});
