/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, HttpFetchError } from '../../../src/core/public';
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
} from '../common';

/**
 * A simple client-side service interface containing all of the available node API functions.
 * Exposed in services.ts.
 * Example function call: getRouteService().getWorkflow(<workflow-id>)
 *
 * Used in redux by wrapping them in async thunk functions which mutate redux state when executed.
 */
export interface RouteService {
  getWorkflow: (
    workflowId: string,
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  searchWorkflows: (
    body: {},
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  getWorkflowState: (
    workflowId: string,
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  createWorkflow: (
    body: {},
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  updateWorkflow: (
    workflowId: string,
    workflowTemplate: WorkflowTemplate,
    updateFields: boolean,
    reprovision: boolean,
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  provisionWorkflow: (
    workflowId: string,
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  deprovisionWorkflow: ({
    workflowId,
    dataSourceId,
    resourceIds,
  }: {
    workflowId: string;
    dataSourceId?: string;
    resourceIds?: string;
  }) => Promise<any | HttpFetchError>;
  deleteWorkflow: (
    workflowId: string,
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  getWorkflowPresets: () => Promise<any | HttpFetchError>;
  catIndices: (
    pattern: string,
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  getMappings: (
    index: string,
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  getIndex: (
    index: string,
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  searchIndex: ({
    index,
    body,
    dataSourceId,
    searchPipeline,
  }: {
    index: string;
    body: {};
    dataSourceId?: string;
    searchPipeline?: string;
  }) => Promise<any | HttpFetchError>;
  ingest: (
    index: string,
    doc: {},
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  bulk: ({
    body,
    dataSourceId,
    ingestPipeline,
  }: {
    body: {};
    dataSourceId?: string;
    ingestPipeline?: string;
  }) => Promise<any | HttpFetchError>;
  searchModels: (
    body: {},
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  searchConnectors: (
    body: {},
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  simulatePipeline: (
    body: {
      pipeline: IngestPipelineConfig;
      docs: SimulateIngestPipelineDoc[];
    },
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  getIngestPipeline: (
    pipelineId: string,
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
  getSearchPipeline: (
    pipelineId: string,
    dataSourceId?: string
  ) => Promise<any | HttpFetchError>;
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
        return e as HttpFetchError;
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
        return e as HttpFetchError;
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
        return e as HttpFetchError;
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
        return e as HttpFetchError;
      }
    },
    updateWorkflow: async (
      workflowId: string,
      workflowTemplate: WorkflowTemplate,
      updateFields: boolean,
      reprovision: boolean,
      dataSourceId?: string
    ) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/update`
          : UPDATE_WORKFLOW_NODE_API_PATH;
        const response = await core.http.put<{ respString: string }>(
          `${url}/${workflowId}/${updateFields}/${reprovision}`,
          {
            body: JSON.stringify(workflowTemplate),
          }
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    provisionWorkflow: async (workflowId: string, dataSourceId?: string) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/provision`
          : PROVISION_WORKFLOW_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(
          `${url}/${workflowId}`
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
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
        return e as HttpFetchError;
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
        return e as HttpFetchError;
      }
    },
    getWorkflowPresets: async () => {
      try {
        const response = await core.http.get<{ respString: string }>(
          GET_PRESET_WORKFLOWS_NODE_API_PATH
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
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
        return e as HttpFetchError;
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
        return e as HttpFetchError;
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
        return e as HttpFetchError;
      }
    },
    searchIndex: async ({
      index,
      body,
      dataSourceId,
      searchPipeline,
    }: {
      index: string;
      body: {};
      dataSourceId?: string;
      searchPipeline?: string;
    }) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/search`
          : SEARCH_INDEX_NODE_API_PATH;
        const basePath = `${url}/${index}`;
        const path = searchPipeline
          ? `${basePath}/${searchPipeline}`
          : basePath;
        const response = await core.http.post<{ respString: string }>(path, {
          body: JSON.stringify(body),
        });
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
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
        return e as HttpFetchError;
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
        return e as HttpFetchError;
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
        return e as HttpFetchError;
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
        return e as HttpFetchError;
      }
    },
    simulatePipeline: async (
      body: {
        pipeline: IngestPipelineConfig;
        docs: SimulateIngestPipelineDoc[];
      },
      dataSourceId?: string
    ) => {
      try {
        const url = dataSourceId
          ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/simulatePipeline`
          : SIMULATE_PIPELINE_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(url, {
          body: JSON.stringify(body),
        });
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
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
        return e as HttpFetchError;
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
        return e as HttpFetchError;
      }
    },
  };
}
