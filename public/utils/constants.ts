/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Navigation {
  AiApplicationBuilder = 'AI Application Builder',
  UseCases = 'Use Cases',
  Workflows = 'Workflows',
}

export enum APP_PATH {
  HOME = '/',
  USE_CASES = '/use-cases',
  WORKSPACE = '/workspace',
  WORKFLOWS = '/workflows',
  WORKFLOW_DETAIL = '/workflows/:workflowId',
}

export const BREADCRUMBS = Object.freeze({
  AI_APPLICATION_BUILDER: { text: 'AI application builder', href: '#/' },
  USE_CASES: { text: 'Use cases', href: `#${APP_PATH.USE_CASES}` },
  WORKFLOWS: { text: 'Workflows', href: `#${APP_PATH.WORKFLOWS}` },
});

export enum COMPONENT_CATEGORY {
  INGEST_PROCESSORS = 'Ingest Processors',
  INDICES = 'Indices',
}

export enum COMPONENT_CLASS {
  KNN_INDEX = 'knn_index',
  TEXT_EMBEDDING_PROCESSOR = 'text_embedding_processor',
}
