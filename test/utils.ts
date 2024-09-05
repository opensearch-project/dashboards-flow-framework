/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PROCESSOR_TYPE, WORKFLOW_TYPE } from '../common/constants';
import {
  IProcessorConfig,
  ProcessorsConfig,
  Workflow,
} from '../common/interfaces';

export function mockStore(
  workflowId: string,
  workflowName: string,
  workflowType: WORKFLOW_TYPE
) {
  return {
    getState: () => ({
      opensearch: {
        errorMessage: '',
      },
      ml: {},
      workflows: {
        loading: false,
        errorMessage: '',
        workflows: {
          [workflowId]: generateWorkflow(
            workflowId,
            workflowName,
            workflowType
          ),
        },
      },
    }),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
    [Symbol.observable]: jest.fn(),
  };
}

function generateWorkflow(
  workflowId: string,
  workflowName: string,
  workflowType: WORKFLOW_TYPE
): Workflow {
  return {
    id: workflowId,
    name: workflowName,
    version: { template: '1.0.0', compatibility: ['2.17.0', '3.0.0'] },
    ui_metadata: {
      type: workflowType,
      config: {
        search: {
          pipelineName: {
            id: 'pipelineName',
            type: 'string',
            value: 'search_pipeline',
          },
          request: {
            id: 'request',
            type: 'json',
            value: '{\n "query": {\n "match_all": {}\n },\n "size": 1000\n}',
          },
          index: { name: { id: 'indexName', type: 'string' } },
          enrichRequest: getRequestProcessor(workflowType),
          enrichResponse: getResponseProcessor(workflowType),
        },
        ingest: {
          pipelineName: {
            id: 'pipelineName',
            type: 'string',
            value: 'ingest_pipeline',
          },
          enrich: getRequestProcessor(workflowType),
          index: {
            settings: { id: 'indexSettings', type: 'json' },
            mappings: {
              id: 'indexMappings',
              type: 'json',
              value: '{\n "properties": {}\n}',
            },
            name: {
              id: 'indexName',
              type: 'string',
              value: 'my-new-index',
            },
          },
          enabled: { id: 'enabled', type: 'boolean', value: true },
        },
      },
    },
  };
}

function getRequestProcessor(workflowType: WORKFLOW_TYPE): ProcessorsConfig {
  if (
    workflowType === WORKFLOW_TYPE.HYBRID_SEARCH ||
    workflowType === WORKFLOW_TYPE.SEMANTIC_SEARCH
  ) {
    // TODO: In the code below, only the ml_inference processor has been added. Other processors still need to be included.
    const mlInferenceProcessor: IProcessorConfig = {
      name: 'ML Inference Processor',
      id: 'ml_processor_ingest',
      fields: [
        {
          id: 'model',
          type: 'model',
          value: {
            id: 'dfMPE5EB8_-RPNi-S0gD',
          },
        },
        {
          id: 'input_map',
          type: 'mapArray',
          value: [
            [
              {
                value: 'my_text',
                key: '',
              },
            ],
          ],
        },
        {
          id: 'output_map',
          type: 'mapArray',
          value: [
            [
              {
                value: '',
                key: 'my_embedding',
              },
            ],
          ],
        },
      ],
      type: PROCESSOR_TYPE.ML,
      optionalFields: [
        {
          id: 'query_template',
          type: 'jsonString',
          value: getQueryTemplate(workflowType),
        },
        {
          id: 'description',
          type: 'string',
        },
        {
          id: 'model_config',
          type: 'json',
        },
        {
          id: 'full_response_path',
          type: 'boolean',
          value: false,
        },
        {
          id: 'ignore_missing',
          type: 'boolean',
          value: false,
        },
        {
          id: 'ignore_failure',
          type: 'boolean',
          value: false,
        },
        {
          id: 'max_prediction_tasks',
          type: 'number',
          value: 10,
        },
        {
          id: 'tag',
          type: 'string',
        },
      ],
    };
    return {
      processors: [mlInferenceProcessor],
    };
  }

  return { processors: [] };
}

// Function to get the query template based on workflow type
function getQueryTemplate(workflowType: WORKFLOW_TYPE) {
  if (workflowType === WORKFLOW_TYPE.HYBRID_SEARCH) {
    return `{
      "_source": {
        "excludes": ["my_embedding"]
      },
      "query": {
        "hybrid": {
          "queries": [
            {
              "match": {
                "my_text": {
                  "query": "{{query_text}}"
                }
              }
            },
            {
              "knn": {
                "my_embedding": {
                  "vector": jest.fn(),
                  "k": 10
                }
              }
            }
          ]
        }
      }
    }`;
  }

  if (workflowType === WORKFLOW_TYPE.SEMANTIC_SEARCH) {
    return `{
      "_source": {
        "excludes": ["my_embedding"]
      },
      "query": {
        "knn": {
          "my_embedding": {
            "vector": jest.fn(),
            "k": 10
          }
        }
      }
    }`;
  }
}

function getResponseProcessor(workflowType: WORKFLOW_TYPE): ProcessorsConfig {
  return workflowType === WORKFLOW_TYPE.HYBRID_SEARCH
    ? {
        processors: [
          {
            id: 'normalization_processor',
            name: 'Normalization Processor',
            type: PROCESSOR_TYPE.NORMALIZATION,
            fields: [],
            optionalFields: [
              { id: 'weights', type: 'string', value: '0.5, 0.5' },
              {
                id: 'normalization_technique',
                type: 'select',
                selectOptions: ['min_max', 'l2'],
              },
              {
                id: 'combination_technique',
                type: 'select',
                selectOptions: [
                  'arithmetic_mean',
                  'geometric_mean',
                  'harmonic_mean',
                ],
              },
              { id: 'description', type: 'string' },
              { id: 'tag', type: 'string' },
            ],
          },
        ],
      }
    : { processors: [] };
}

export const resizeObserverMock = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
