/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PROCESSOR_TYPE, WORKFLOW_TYPE } from '../common/constants';
import { ProcessorsConfig, Workflow } from '../common/interfaces';

function generateWorkflow(
  workflowId: string,
  workflowName: string,
  workflowType: WORKFLOW_TYPE,
  includeProcessor: boolean = false
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
            value: jest.fn(),
          },
          request: {
            id: 'request',
            type: 'json',
            value: jest.fn(),
          },
          index: { name: { id: 'indexName', type: 'string' } },
          enrichRequest: getProcessor(includeProcessor),
          enrichResponse: getProcessor(includeProcessor),
        },
        ingest: {
          pipelineName: {
            id: 'pipelineName',
            type: 'string',
            value: jest.fn(),
          },
          enrich: getProcessor(includeProcessor),
          index: {
            settings: { id: 'indexSettings', type: 'json' },
            mappings: {
              id: 'indexMappings',
              type: 'json',
              value: jest.fn(),
            },
            name: {
              id: 'indexName',
              type: 'string',
              value: jest.fn(),
            },
          },
          enabled: { id: 'enabled', type: 'boolean', value: true },
        },
      },
    },
  };
}

// TODO: In the code below, only the ml_inference processor has been added. Other processors still need to be included.
function getProcessor(includeProcessor: boolean): ProcessorsConfig {
  if (includeProcessor) {
    return {
      processors: [
        {
          name: 'ML Inference Processor',
          id: 'ml_processor_ingest_d6d16748b3888061',
          fields: [
            {
              id: 'model',
              type: 'model',
              value: {
                id: jest.fn(),
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
        },
      ],
    };
  } else {
    return { processors: [] };
  }
}

export function mockStore(
  workflowId: string,
  workflowName: string,
  workflowType: WORKFLOW_TYPE,
  includeProcessor: boolean = false
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
            workflowType,
            includeProcessor
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

export const resizeObserverMock = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
