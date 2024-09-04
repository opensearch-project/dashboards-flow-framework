/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const mockStore = {
  getState: () => ({
    opensearch: {
      errorMessage: '',
    },
    workflows: {
      loading: false,
      errorMessage: '',
      workflows: {
        '12345': {
          id: '12345',
          name: 'test_workflow',
          use_case: 'CUSTOM',
          description: 'A blank workflow with no preset configurations',
          version: { template: '1.0.0', compatibility: ['2.17.0', '3.0.0'] },
          workflows: {},
          ui_metadata: {
            type: 'Custom',
            config: {
              search: {
                pipelineName: {
                  id: 'pipelineName',
                  type: 'string',
                  value: 'search_pipeline_248e2f68b43db682',
                },
                request: {
                  id: 'request',
                  type: 'json',
                  value:
                    '{\n  "query": {\n    "match_all": {}\n  },\n  "size": 1000\n}',
                },
                index: { name: { id: 'indexName', type: 'string' } },
                enrichRequest: { processors: [] },
                enrichResponse: { processors: [] },
              },
              ingest: {
                pipelineName: {
                  id: 'pipelineName',
                  type: 'string',
                  value: 'ingest_pipeline_7b139fd4eccac336',
                },
                enrich: { processors: [] },
                index: {
                  settings: { id: 'indexSettings', type: 'json' },
                  mappings: {
                    id: 'indexMappings',
                    type: 'json',
                    value: '{\n  "properties": {}\n}',
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
          lastUpdated: 1725413687437,
          resourcesCreated: [],
        },
      },
    },
  }),
  dispatch: jest.fn(),
  subscribe: jest.fn(),
  replaceReducer: jest.fn(),
  [Symbol.observable]: jest.fn(),
};

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
