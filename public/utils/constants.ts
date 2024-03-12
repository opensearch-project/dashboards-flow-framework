/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Navigation {
  FlowFramework = 'Flow Framework',
  Overview = 'Overview',
  Workflows = 'Workflows',
}

export enum APP_PATH {
  HOME = '/',
  OVERVIEW = '/overview',
  WORKFLOWS = '/workflows',
  WORKFLOW_DETAIL = '/workflows/:workflowId',
}

export const BREADCRUMBS = Object.freeze({
  FLOW_FRAMEWORK: { text: 'Flow Framework', href: '#/' },
  OVERVIEW: { text: 'Overview', href: `#${APP_PATH.OVERVIEW}` },
  WORKFLOWS: { text: 'Workflows', href: `#${APP_PATH.WORKFLOWS}` },
});

/**
 * The static set of available categories that can be used to organize
 * the component library. Sets guardrails on what components can be
 * drag-and-dropped into the ingest and/or search flows.
 */
export enum COMPONENT_CATEGORY {
  INGEST = 'Ingest',
  SEARCH = 'Search',
}

// TODO: subject to change
/**
 * A base set of component classes / types.
 */
export enum COMPONENT_CLASS {
  INDEXER = 'indexer',
  RETRIEVER = 'retriever',
  TRANSFORMER = 'transformer',
  JSON_TO_JSON_TRANSFORMER = 'json_to_json_transformer',
  ML_TRANSFORMER = 'ml_transformer',
  QUERY = 'query',
}
