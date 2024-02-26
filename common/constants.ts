/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLUGIN_ID = 'flow-framework';

export const BASE_NODE_API_PATH = '/api/flow_framework';

// OpenSearch APIs
export const BASE_INDICES_NODE_API_PATH = `${BASE_NODE_API_PATH}/indices`;
export const SEARCH_INDICES_PATH = `${BASE_INDICES_NODE_API_PATH}/search`;
export const FETCH_INDICES_PATH = `${BASE_INDICES_NODE_API_PATH}/fetch`;

// Flow Framework APIs
export const BASE_WORKFLOW_NODE_API_PATH = `${BASE_NODE_API_PATH}/workflow`;
export const GET_WORKFLOW_PATH = `${BASE_WORKFLOW_NODE_API_PATH}`;
export const CREATE_WORKFLOW_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/create`;
