/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isEmpty } from 'lodash';
import { CoreStart } from '../../../src/core/public';
import {
  CREATE_WORKFLOW_NODE_API_PATH,
  DELETE_WORKFLOW_NODE_API_PATH,
  CAT_INDICES_NODE_API_PATH,
  GET_WORKFLOW_NODE_API_PATH,
  GET_WORKFLOW_STATE_NODE_API_PATH,
  SEARCH_WORKFLOWS_NODE_API_PATH,
  GET_PRESET_WORKFLOWS_NODE_API_PATH,
  SEARCH_MODELS_NODE_API_PATH,
  PROVISION_WORKFLOW_NODE_API_PATH,
  DEPROVISION_WORKFLOW_NODE_API_PATH,
  UPDATE_WORKFLOW_NODE_API_PATH,
  WorkflowTemplate,
  SEARCH_INDEX_NODE_API_PATH,
  INGEST_NODE_API_PATH,
  SIMULATE_PIPELINE_NODE_API_PATH,
  IngestPipelineConfig,
  SimulateIngestPipelineDoc,
  BULK_NODE_API_PATH,
  BASE_NODE_API_PATH,
  SEARCH_CONNECTORS_NODE_API_PATH,
  GET_MAPPINGS_NODE_API_PATH,
  SEARCH_PIPELINE_NODE_API_PATH,
  INGEST_PIPELINE_NODE_API_PATH,
  GET_INDEX_NODE_API_PATH,
  REGISTER_AGENT_NODE_API_PATH,
  SEARCH_AGENTS_NODE_API_PATH,
  GET_AGENT_NODE_API_PATH,
  UPDATE_AGENT_NODE_API_PATH,
  GET_SEARCH_TEMPLATES_NODE_API_PATH,
} from '../common';

/**
 * A simple client-side service interface containing all of the available node API functions.
 * Exposed in services.ts.
 * Example function call: getRouteService().getWorkflow(<workflow-id>)
 *
 * Used in redux by wrapping them in async thunk functions which mutate redux state when executed.
 */
export interface RouteService {
  getWorkflow: (workflowId: string, dataSourceId?: string) => Promise<any>;
  searchWorkflows: (body: {}, dataSourceId?: string) => Promise<any>;
  getWorkflowState: (workflowId: string, dataSourceId?: string) => Promise<any>;
  createWorkflow: (body: {}, dataSourceId?: string) => Promise<any>;
  updateWorkflow: (
    workflowId: string,
    workflowTemplate: WorkflowTemplate,
    updateFields: boolean,
    reprovision: boolean,
    dataSourceId?: string,
    dataSourceVersion?: string
  ) => Promise<any>;
  provisionWorkflow: (
    workflowId: string,
    dataSourceId?: string,
    dataSourceVersion?: string
  ) => Promise<any>;
  deprovisionWorkflow: ({
    workflowId,
    dataSourceId,
    resourceIds,
  }: {
    workflowId: string;
    dataSourceId?: string;
    resourceIds?: string;
  }) => Promise<any>;
  deleteWorkflow: (workflowId: string, dataSourceId?: string) => Promise<any>;
  getWorkflowPresets: () => Promise<any>;
  catIndices: (pattern: string, dataSourceId?: string) => Promise<any>;
  getMappings: (index: string, dataSourceId?: string) => Promise<any>;
  getIndex: (index: string, dataSourceId?: string) => Promise<any>;
  searchIndex: ({
    index,
    body,
    dataSourceId,
    dataSourceVersion,
    searchPipeline,
    verbose,
    signal,
  }: {
    index: string;
    body: {};
    dataSourceId?: string;
    dataSourceVersion?: string;
    searchPipeline?: string;
    verbose?: boolean;
    signal?: AbortSignal;
  }) => Promise<any>;
  ingest: (index: string, doc: {}, dataSourceId?: string) => Promise<any>;
  bulk: ({
    body,
    dataSourceId,
    ingestPipeline,
  }: {
    body: {};
    dataSourceId?: string;
    ingestPipeline?: string;
  }) => Promise<any>;
  searchModels: (body: {}, dataSourceId?: string) => Promise<any>;
  searchConnectors: (body: {}, dataSourceId?: string) => Promise<any>;
  registerAgent: (body: {}, dataSourceId?: string) => Promise<any>;
  updateAgent: (
    agentId: string,
    body: {},
    dataSourceId?: string
  ) => Promise<any>;
  searchAgents: (body: {}, dataSourceId?: string) => Promise<any>;
  getAgent: (agentId: string, dataSourceId?: string) => Promise<any>;
  simulatePipeline: (
    body: {
      pipeline?: IngestPipelineConfig;
      docs: SimulateIngestPipelineDoc[];
    },
    dataSourceId?: string,
    pipelineId?: string,
    verbose?: boolean
  ) => Promise<any>;
  getIngestPipeline: (
    pipelineId: string,
    dataSourceId?: string
  ) => Promise<any>;
  getSearchPipeline: (
    pipelineId: string,
    dataSourceId?: string
  ) => Promise<any>;
  getSearchTemplates: (dataSourceId?: string) => Promise<any>;
  getLocalClusterVersion: () => Promise<any>;
}

export function configureRoutes(core: CoreStart): RouteService {
  return {
    getWorkflow: async (workflowId: string, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow`
          : GET_WORKFLOW_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(
          `${url}/${workflowId}`
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    searchWorkflows: async (body: {}, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/search`
          : SEARCH_WORKFLOWS_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(url, {
          body: JSON.stringify(body),
        });
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    getWorkflowState: async (workflowId: string, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/state`
          : GET_WORKFLOW_STATE_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(
          `${url}/${workflowId}`
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    createWorkflow: async (body: {}, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/create`
          : CREATE_WORKFLOW_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(url, {
          body: JSON.stringify(body),
        });
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    updateWorkflow: async (
      workflowId: string,
      workflowTemplate: WorkflowTemplate,
      updateFields: boolean,
      reprovision: boolean,
      dataSourceId?: string,
      dataSourceVersion?: string
    ) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/update`
          : UPDATE_WORKFLOW_NODE_API_PATH;
        const response = await core.http.put<{ respString: string }>(
          `${url}/${workflowId}/${updateFields}/${reprovision}`,
          {
            body: JSON.stringify(workflowTemplate),
            query: {
              data_source_version: dataSourceVersion,
            },
          }
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    provisionWorkflow: async (
      workflowId: string,
      dataSourceId?: string,
      dataSourceVersion?: string
    ) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/provision`
          : PROVISION_WORKFLOW_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(
          `${url}/${workflowId}`,
          {
            query: {
              data_source_version: dataSourceVersion,
            },
          }
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    deprovisionWorkflow: async ({
      workflowId,
      dataSourceId,
      resourceIds,
    }: {
      workflowId: string;
      dataSourceId?: string;
      resourceIds?: string;
    }) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/deprovision`
          : DEPROVISION_WORKFLOW_NODE_API_PATH;
        const path = resourceIds
          ? `${url}/${workflowId}/${resourceIds}`
          : `${url}/${workflowId}`;
        const response = await core.http.post<{ respString: string }>(path);
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    deleteWorkflow: async (workflowId: string, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/delete`
          : DELETE_WORKFLOW_NODE_API_PATH;
        const response = await core.http.delete<{ respString: string }>(
          `${url}/${workflowId}`
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    getWorkflowPresets: async () => {
      try {
        const response = await core.http.get<{ respString: string }>(
          GET_PRESET_WORKFLOWS_NODE_API_PATH
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    catIndices: async (pattern: string, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/catIndices`
          : CAT_INDICES_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(
          `${url}/${pattern}`
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    getMappings: async (index: string, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/mappings`
          : GET_MAPPINGS_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(
          `${url}/${index}`
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    getLocalClusterVersion: async () => {
      try {
        const response = await core.http.post('/api/console/proxy', {
          query: { path: '/', method: 'GET', dataSourceId: '' },
        });
        return response.version.number;
      } catch (e: any) {
        throw e;
      }
    },
    getIndex: async (index: string, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/getIndex`
          : GET_INDEX_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(
          `${url}/${index}`
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    searchIndex: async ({
      index,
      body,
      dataSourceId,
      dataSourceVersion,
      searchPipeline,
      verbose,
      signal,
    }: {
      index: string;
      body: {};
      dataSourceId?: string;
      dataSourceVersion?: string;
      searchPipeline?: string;
      verbose?: boolean;
      signal?: AbortSignal;
    }) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/search`
          : SEARCH_INDEX_NODE_API_PATH;
        const basePath = !isEmpty(index) ? `${url}/${index}` : url; // no index is valid, if the search is against all indices
        const path = searchPipeline
          ? `${basePath}/${searchPipeline}`
          : basePath;
        const response = await core.http.post<{ respString: string }>(path, {
          body: JSON.stringify(body),
          query: {
            verbose: verbose ?? false,
            data_source_version: dataSourceVersion,
          },
          signal,
        });
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    ingest: async (index: string, doc: {}, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/ingest`
          : INGEST_NODE_API_PATH;
        const response = await core.http.put<{ respString: string }>(
          `${url}/${index}`,
          {
            body: JSON.stringify(doc),
          }
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    bulk: async ({
      body,
      dataSourceId,
      ingestPipeline,
    }: {
      body: {};
      dataSourceId?: string;
      ingestPipeline?: string;
    }) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/bulk`
          : BULK_NODE_API_PATH;
        const path = ingestPipeline ? `${url}/${ingestPipeline}` : url;
        const response = await core.http.post<{ respString: string }>(path, {
          body: JSON.stringify(body),
        });
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    searchModels: async (body: {}, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/model/search`
          : SEARCH_MODELS_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(url, {
          body: JSON.stringify(body),
        });
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    searchConnectors: async (body: {}, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/connector/search`
          : SEARCH_CONNECTORS_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(url, {
          body: JSON.stringify(body),
        });
        return response;
      } catch (e: any) {
        throw e;
      }
    },

    registerAgent: async (body: {}, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/agent/register`
          : REGISTER_AGENT_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(url, {
          body: JSON.stringify(body),
        });
        return response;
      } catch (e: any) {
        throw e;
      }
    },

    updateAgent: async (agentId: string, body: {}, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/agent/update`
          : UPDATE_AGENT_NODE_API_PATH;
        const finalUrl = `${url}/${agentId}`;
        const response = await core.http.put<{ respString: string }>(finalUrl, {
          body: JSON.stringify(body),
        });
        return response;
      } catch (e: any) {
        throw e;
      }
    },

    searchAgents: async (body: {}, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/agent/search`
          : SEARCH_AGENTS_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(url, {
          body: JSON.stringify(body),
        });
        return response;
      } catch (e: any) {
        throw e;
      }
    },

    getAgent: async (agentId: string, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/agent`
          : GET_AGENT_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(
          `${url}/${agentId}`
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },

    simulatePipeline: async (
      body: {
        pipeline?: IngestPipelineConfig;
        docs: SimulateIngestPipelineDoc[];
      },
      dataSourceId?: string,
      pipelineId?: string,
      verbose?: boolean
    ) => {
      try {
        let url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/simulatePipeline`
          : SIMULATE_PIPELINE_NODE_API_PATH;
        url = pipelineId ? `${url}/${pipelineId}` : url;
        const response = await core.http.post<{ respString: string }>(url, {
          body: JSON.stringify(body),
          query: {
            verbose: verbose ?? false,
          },
        });
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    getSearchPipeline: async (pipelineId: string, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/getSearchPipeline`
          : SEARCH_PIPELINE_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(
          `${url}/${pipelineId}`
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    getSearchTemplates: async (dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/getSearchTemplates`
          : GET_SEARCH_TEMPLATES_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(url);
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    getIngestPipeline: async (pipelineId: string, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/getIngestPipeline`
          : INGEST_PIPELINE_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(
          `${url}/${pipelineId}`
        );
        return response;
      } catch (e: any) {
        throw e;
      }
    },
  };
}
