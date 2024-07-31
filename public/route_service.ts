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
} from '../common';

/**
 * A simple client-side service interface containing all of the available node API functions.
 * Exposed in services.ts.
 * Example function call: getRouteService().getWorkflow(<workflow-id>)
 *
 * Used in redux by wrapping them in async thunk functions which mutate redux state when executed.
 */
export interface RouteService {
  getWorkflow: (workflowId: string, dataSourceId: string|undefined) => Promise<any | HttpFetchError>;
  searchWorkflows: (body: {}, dataSourceId: string|undefined) => Promise<any | HttpFetchError>;
  getWorkflowState: (workflowId: string, dataSourceId: string|undefined) => Promise<any | HttpFetchError>;
  createWorkflow: (body: {}, dataSourceId: string|undefined) => Promise<any | HttpFetchError>;
  updateWorkflow: (
    workflowId: string,
    workflowTemplate: WorkflowTemplate,
    updateFields: boolean,
    dataSourceId: string|undefined
  ) => Promise<any | HttpFetchError>;
  provisionWorkflow: (workflowId: string, dataSourceId: string|undefined) => Promise<any | HttpFetchError>;
  deprovisionWorkflow: (
    workflowId: string,
    dataSourceId: string|undefined,
    resourceIds?: string,
  ) => Promise<any | HttpFetchError>;
  deleteWorkflow: (workflowId: string, dataSourceId: string|undefined) => Promise<any | HttpFetchError>;
  getWorkflowPresets: (dataSourceId: string|undefined) => Promise<any | HttpFetchError>;
  catIndices: (pattern: string, dataSourceId: string|undefined) => Promise<any | HttpFetchError>;
  searchIndex: (
    index: string,
    body: {},
    dataSourceId: string|undefined,
    searchPipeline?: string,
  ) => Promise<any | HttpFetchError>;
  ingest: (index: string, doc: {}, dataSourceId: string|undefined) => Promise<any | HttpFetchError>;
  bulk: (body: {}, dataSourceId: string|undefined, ingestPipeline?: string) => Promise<any | HttpFetchError>;
  searchModels: (body: {}, dataSourceId: string|undefined) => Promise<any | HttpFetchError>;
  simulatePipeline: (body: {
    pipeline: IngestPipelineConfig;
    docs: SimulateIngestPipelineDoc[];
  },
  dataSourceId: string|undefined) => Promise<any | HttpFetchError>;
}

export function configureRoutes(core: CoreStart): RouteService {
  return {
    getWorkflow: async (workflowId: string, dataSourceId: string|undefined) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow` : GET_WORKFLOW_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(
          `${url}/${workflowId}`
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    searchWorkflows: async (body: {}, dataSourceId: string|undefined) => {  
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/search` : SEARCH_WORKFLOWS_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(
          url,
          {
            body: JSON.stringify(body),
          }
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    getWorkflowState: async (workflowId: string, dataSourceId: string|undefined) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/state` : GET_WORKFLOW_STATE_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(
          `${url}/${workflowId}`
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    createWorkflow: async (body: {}, dataSourceId: string|undefined) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/create` : CREATE_WORKFLOW_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(
          url,
          {
            body: JSON.stringify(body),
          }
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    updateWorkflow: async (
      workflowId: string,
      workflowTemplate: WorkflowTemplate,
      updateFields: boolean,
      dataSourceId: string|undefined
    ) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/update` : UPDATE_WORKFLOW_NODE_API_PATH;
        const response = await core.http.put<{ respString: string }>(
          `${url}/${workflowId}/${updateFields}`,
          {
            body: JSON.stringify(workflowTemplate),
          }
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    provisionWorkflow: async (workflowId: string, dataSourceId: string|undefined) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/provision` : PROVISION_WORKFLOW_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(
          `${url}/${workflowId}`
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    deprovisionWorkflow: async (workflowId: string, dataSourceId: string|undefined, resourceIds?: string) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/deprovision` : DEPROVISION_WORKFLOW_NODE_API_PATH;
        const path = resourceIds
          ? `${url}/${workflowId}/${resourceIds}`
          : `${url}/${workflowId}`;
        const response = await core.http.post<{ respString: string }>(path);
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    deleteWorkflow: async (workflowId: string, dataSourceId: string|undefined) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/delete` : DELETE_WORKFLOW_NODE_API_PATH;
        const response = await core.http.delete<{ respString: string }>(
          `${url}/${workflowId}`
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    getWorkflowPresets: async (dataSourceId: string|undefined) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/workflow/presets` : GET_PRESET_WORKFLOWS_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(
          url
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    catIndices: async (pattern: string, dataSourceId: string|undefined) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/catIndices` : CAT_INDICES_NODE_API_PATH;
        const response = await core.http.get<{ respString: string }>(
          `${url}/${pattern}`
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    searchIndex: async (index: string, body: {}, dataSourceId: string|undefined, searchPipeline?: string) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/search` : SEARCH_INDEX_NODE_API_PATH;
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
    ingest: async (index: string, doc: {}, dataSourceId: string|undefined) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/ingest` : INGEST_NODE_API_PATH;
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
    bulk: async (body: {}, dataSourceId: string|undefined, ingestPipeline?: string) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/bulk` : BULK_NODE_API_PATH;
        const path = ingestPipeline
          ? `${url}/${ingestPipeline}`
          : url;
        const response = await core.http.post<{ respString: string }>(path, {
          body: JSON.stringify(body),
        });
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    searchModels: async (body: {}, dataSourceId: string|undefined) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/model/search` : SEARCH_MODELS_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(
          url,
          {
            body: JSON.stringify(body),
          }
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    simulatePipeline: async (body: {
      pipeline: IngestPipelineConfig;
      docs: SimulateIngestPipelineDoc[];
    },
    dataSourceId: string|undefined) => {
      try {
        const url = dataSourceId ? `${BASE_NODE_API_PATH}/${dataSourceId}/opensearch/simulatePipeline` : SIMULATE_PIPELINE_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(
          url,
          {
            body: JSON.stringify(body),
          }
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
  };
}
