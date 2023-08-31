/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Navigation {
  AiApplicationBuilder = 'AI Application Builder',
  UseCases = 'Use Cases',
  Workflows = 'Workflows',
}

export const BASE_NODE_API_PATH = '/api/ai_flow';

export const APP_PATH = {
  USE_CASES: '/use-cases',
  WORKSPACE: '/workspace',
  WORKFLOWS: '/workflows',
  WORKFLOW_DETAIL: '/workflows/:workflowId/',
};
