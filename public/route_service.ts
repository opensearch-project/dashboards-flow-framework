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
} from '../common';

/**
 * A simple client-side service interface containing all of the available node API functions.
 * Exposed in services.ts.
 * Example function call: getRouteService().getWorkflow(<workflow-id>)
 *
 * Used in redux by wrapping them in async thunk functions which mutate redux state when executed.
 */
export interface RouteService {
  getWorkflow: (workflowId: string) => Promise<any | HttpFetchError>;
  searchWorkflows: (body: {}) => Promise<any | HttpFetchError>;
  getWorkflowState: (workflowId: string) => Promise<any | HttpFetchError>;
  createWorkflow: (body: {}) => Promise<any | HttpFetchError>;
  updateWorkflow: (
    workflowId: string,
    workflowTemplate: WorkflowTemplate
  ) => Promise<any | HttpFetchError>;
  provisionWorkflow: (workflowId: string) => Promise<any | HttpFetchError>;
  deprovisionWorkflow: (
    workflowId: string,
    resourceIds?: string
  ) => Promise<any | HttpFetchError>;
  deleteWorkflow: (workflowId: string) => Promise<any | HttpFetchError>;
  getWorkflowPresets: () => Promise<any | HttpFetchError>;
  catIndices: (pattern: string) => Promise<any | HttpFetchError>;
  searchIndex: (
    index: string,
    body: {},
    searchPipeline?: string
  ) => Promise<any | HttpFetchError>;
  ingest: (index: string, doc: {}) => Promise<any | HttpFetchError>;
  bulk: (body: {}, ingestPipeline?: string) => Promise<any | HttpFetchError>;
  searchModels: (body: {}) => Promise<any | HttpFetchError>;
  simulatePipeline: (body: {
    pipeline: IngestPipelineConfig;
    docs: SimulateIngestPipelineDoc[];
  }) => Promise<any | HttpFetchError>;
}

export function configureRoutes(core: CoreStart): RouteService {
  return {
    getWorkflow: async (workflowId: string) => {
      try {
        const response = await core.http.get<{ respString: string }>(
          `${GET_WORKFLOW_NODE_API_PATH}/${workflowId}`
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    searchWorkflows: async (body: {}) => {
      try {
        const response = await core.http.post<{ respString: string }>(
          SEARCH_WORKFLOWS_NODE_API_PATH,
          {
            body: JSON.stringify(body),
          }
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    getWorkflowState: async (workflowId: string) => {
      try {
        const response = await core.http.get<{ respString: string }>(
          `${GET_WORKFLOW_STATE_NODE_API_PATH}/${workflowId}`
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    createWorkflow: async (body: {}) => {
      try {
        const response = await core.http.post<{ respString: string }>(
          CREATE_WORKFLOW_NODE_API_PATH,
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
      workflowTemplate: WorkflowTemplate
    ) => {
      try {
        const response = await core.http.put<{ respString: string }>(
          `${UPDATE_WORKFLOW_NODE_API_PATH}/${workflowId}`,
          {
            body: JSON.stringify(workflowTemplate),
          }
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    provisionWorkflow: async (workflowId: string) => {
      try {
        const response = await core.http.post<{ respString: string }>(
          `${PROVISION_WORKFLOW_NODE_API_PATH}/${workflowId}`
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    deprovisionWorkflow: async (workflowId: string, resourceIds?: string) => {
      try {
        const path = resourceIds
          ? `${DEPROVISION_WORKFLOW_NODE_API_PATH}/${workflowId}/${resourceIds}`
          : `${DEPROVISION_WORKFLOW_NODE_API_PATH}/${workflowId}`;
        const response = await core.http.post<{ respString: string }>(path);
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    deleteWorkflow: async (workflowId: string) => {
      try {
        const response = await core.http.delete<{ respString: string }>(
          `${DELETE_WORKFLOW_NODE_API_PATH}/${workflowId}`
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
    catIndices: async (pattern: string) => {
      try {
        const response = await core.http.get<{ respString: string }>(
          `${CAT_INDICES_NODE_API_PATH}/${pattern}`
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    searchIndex: async (index: string, body: {}, searchPipeline?: string) => {
      try {
        const basePath = `${SEARCH_INDEX_NODE_API_PATH}/${index}`;
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
    ingest: async (index: string, doc: {}) => {
      try {
        const response = await core.http.put<{ respString: string }>(
          `${INGEST_NODE_API_PATH}/${index}`,
          {
            body: JSON.stringify(doc),
          }
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    bulk: async (body: {}, ingestPipeline?: string) => {
      try {
        const path = ingestPipeline
          ? `${BULK_NODE_API_PATH}/${ingestPipeline}`
          : BULK_NODE_API_PATH;
        const response = await core.http.post<{ respString: string }>(path, {
          body: JSON.stringify(body),
        });
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    searchModels: async (body: {}) => {
      try {
        const response = await core.http.post<{ respString: string }>(
          SEARCH_MODELS_NODE_API_PATH,
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
    }) => {
      try {
        const response = await core.http.post<{ respString: string }>(
          SIMULATE_PIPELINE_NODE_API_PATH,
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
