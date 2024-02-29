/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLUGIN_ID = 'flow-framework';

/**
 * BACKEND/CLUSTER APIs
 */
export const FLOW_FRAMEWORK_API_ROUTE_PREFIX = '/_plugins/_flow_framework';
export const FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX = `${FLOW_FRAMEWORK_API_ROUTE_PREFIX}/workflow`;
export const FLOW_FRAMEWORK_SEARCH_WORKFLOWS_ROUTE = `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/_search`;
export const FLOW_FRAMEWORK_SEARCH_WORKFLOW_STATE_ROUTE = `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/state/_search`;

/**
 * NODE APIs
 */
export const BASE_NODE_API_PATH = '/api/flow_framework';

// OpenSearch node APIs
export const BASE_OPENSEARCH_NODE_API_PATH = `${BASE_NODE_API_PATH}/opensearch`;
export const CAT_INDICES_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/catIndices`;

// Flow Framework node APIs
export const BASE_WORKFLOW_NODE_API_PATH = `${BASE_NODE_API_PATH}/workflow`;
export const GET_WORKFLOW_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}`;
export const SEARCH_WORKFLOWS_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/search`;
export const GET_WORKFLOW_STATE_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/state`;
export const CREATE_WORKFLOW_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/create`;
export const DELETE_WORKFLOW_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/delete`;
