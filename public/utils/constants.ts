/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Navigation {
  FlowFramework = 'Flow Framework',
  Workflows = 'Workflows',
}

export enum APP_PATH {
  HOME = '/',
  WORKFLOWS = '/workflows',
  WORKFLOW_DETAIL = '/workflows/:workflowId',
}

export const BREADCRUMBS = Object.freeze({
  FLOW_FRAMEWORK: { text: 'Flow Framework', href: '#/' },
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

export enum NODE_CATEGORY {
  CUSTOM = 'custom',
  INGEST_GROUP = 'ingestGroup',
  SEARCH_GROUP = 'searchGroup',
}

/**
 * A base set of component classes / types.
 */
export enum COMPONENT_CLASS {
  // Indexer-related classes
  INDEXER = 'indexer',
  KNN_INDEXER = 'knn_indexer',
  // Retriever-related classes
  RETRIEVER = 'retriever',
  // Transformer-related classes
  TRANSFORMER = 'transformer',
  JSON_TO_JSON_TRANSFORMER = 'json_to_json_transformer',
  ML_TRANSFORMER = 'ml_transformer',
  TEXT_EMBEDDING_TRANSFORMER = 'text_embedding_transformer',
  // Query-related classes
  QUERY = 'query',
}
