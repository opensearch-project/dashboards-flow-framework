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
  deleteWorkflow: (workflowId: string) => Promise<any | HttpFetchError>;
  getWorkflowPresets: () => Promise<any | HttpFetchError>;
  catIndices: (pattern: string) => Promise<any | HttpFetchError>;
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
  };
}
