/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MODEL_ALGORITHM,
  PRETRAINED_MODEL_FORMAT,
  PretrainedSentenceTransformer,
  PretrainedSparseEncodingModel,
  WORKFLOW_STATE,
} from './interfaces';

export const PLUGIN_ID = 'flow-framework';

/**
 * BACKEND FLOW FRAMEWORK APIs
 */
export const FLOW_FRAMEWORK_API_ROUTE_PREFIX = '/_plugins/_flow_framework';
export const FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX = `${FLOW_FRAMEWORK_API_ROUTE_PREFIX}/workflow`;
export const FLOW_FRAMEWORK_SEARCH_WORKFLOWS_ROUTE = `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/_search`;
export const FLOW_FRAMEWORK_SEARCH_WORKFLOW_STATE_ROUTE = `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/state/_search`;

/**
 * BACKEND ML PLUGIN APIs
 */
export const ML_API_ROUTE_PREFIX = '/_plugins/_ml';
export const ML_MODEL_ROUTE_PREFIX = `${ML_API_ROUTE_PREFIX}/models`;
export const ML_SEARCH_MODELS_ROUTE = `${ML_MODEL_ROUTE_PREFIX}/_search`;

/**
 * NODE APIs
 */
export const BASE_NODE_API_PATH = '/api/flow_framework';

// OpenSearch node APIs
export const BASE_OPENSEARCH_NODE_API_PATH = `${BASE_NODE_API_PATH}/opensearch`;
export const CAT_INDICES_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/catIndices`;
export const SEARCH_INDEX_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/search`;
export const INGEST_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/ingest`;

// Flow Framework node APIs
export const BASE_WORKFLOW_NODE_API_PATH = `${BASE_NODE_API_PATH}/workflow`;
export const GET_WORKFLOW_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}`;
export const SEARCH_WORKFLOWS_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/search`;
export const GET_WORKFLOW_STATE_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/state`;
export const CREATE_WORKFLOW_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/create`;
export const UPDATE_WORKFLOW_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/update`;
export const PROVISION_WORKFLOW_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/provision`;
export const DEPROVISION_WORKFLOW_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/deprovision`;
export const DELETE_WORKFLOW_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/delete`;
export const GET_PRESET_WORKFLOWS_NODE_API_PATH = `${BASE_WORKFLOW_NODE_API_PATH}/presets`;

// ML Plugin node APIs
export const BASE_MODEL_NODE_API_PATH = `${BASE_NODE_API_PATH}/model`;
export const SEARCH_MODELS_NODE_API_PATH = `${BASE_MODEL_NODE_API_PATH}/search`;

/**
 * ML PLUGIN PRETRAINED MODELS
 * (based off of https://opensearch.org/docs/latest/ml-commons-plugin/pretrained-models)
 */

// ---- SENTENCE TRANSFORMERS ----
export const ROBERTA_SENTENCE_TRANSFORMER = {
  name: 'huggingface/sentence-transformers/all-distilroberta-v1',
  shortenedName: 'all-distilroberta-v1',
  description: 'A sentence transformer from Hugging Face',
  format: PRETRAINED_MODEL_FORMAT.TORCH_SCRIPT,
  algorithm: MODEL_ALGORITHM.TEXT_EMBEDDING,
  version: '1.0.1',
  vectorDimensions: 768,
} as PretrainedSentenceTransformer;

export const MPNET_SENTENCE_TRANSFORMER = {
  name: 'huggingface/sentence-transformers/all-mpnet-base-v2',
  shortenedName: 'all-mpnet-base-v2',
  description: 'A sentence transformer from Hugging Face',
  format: PRETRAINED_MODEL_FORMAT.TORCH_SCRIPT,
  algorithm: MODEL_ALGORITHM.TEXT_EMBEDDING,
  version: '1.0.1',
  vectorDimensions: 768,
} as PretrainedSentenceTransformer;

export const BERT_SENTENCE_TRANSFORMER = {
  name: 'huggingface/sentence-transformers/msmarco-distilbert-base-tas-b',
  shortenedName: 'msmarco-distilbert-base-tas-b',
  description: 'A sentence transformer from Hugging Face',
  format: PRETRAINED_MODEL_FORMAT.TORCH_SCRIPT,
  algorithm: MODEL_ALGORITHM.TEXT_EMBEDDING,
  version: '1.0.2',
  vectorDimensions: 768,
} as PretrainedSentenceTransformer;

// ---- SPARSE ENCODERS ----
export const NEURAL_SPARSE_TRANSFORMER = {
  name: 'amazon/neural-sparse/opensearch-neural-sparse-encoding-v1',
  shortenedName: 'opensearch-neural-sparse-encoding-v1',
  description: 'A general neural sparse encoding model',
  format: PRETRAINED_MODEL_FORMAT.TORCH_SCRIPT,
  algorithm: MODEL_ALGORITHM.SPARSE_ENCODING,
  version: '1.0.1',
} as PretrainedSparseEncodingModel;

export const NEURAL_SPARSE_DOC_TRANSFORMER = {
  name: 'amazon/neural-sparse/opensearch-neural-sparse-encoding-doc-v1',
  shortenedName: 'opensearch-neural-sparse-encoding-doc-v1',
  description: 'A general neural sparse encoding model',
  format: PRETRAINED_MODEL_FORMAT.TORCH_SCRIPT,
  algorithm: MODEL_ALGORITHM.SPARSE_ENCODING,
  version: '1.0.1',
} as PretrainedSparseEncodingModel;

export const NEURAL_SPARSE_TOKENIZER_TRANSFORMER = {
  name: 'amazon/neural-sparse/opensearch-neural-sparse-tokenizer-v1',
  shortenedName: 'opensearch-neural-sparse-tokenizer-v1',
  description: 'A neural sparse tokenizer model',
  format: PRETRAINED_MODEL_FORMAT.TORCH_SCRIPT,
  algorithm: MODEL_ALGORITHM.SPARSE_ENCODING,
  version: '1.0.1',
} as PretrainedSparseEncodingModel;

/**
 * Various constants pertaining to Workflow configs
 */

export enum PROCESSOR_TYPE {
  ML = 'ml_processor',
}

export enum MODEL_TYPE {
  TEXT_EMBEDDING = 'text_embedding',
  SPARSE_ENCODER = 'sparse_encoder',
}

/**
 * Various constants pertaining to the drag-and-drop UI components
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
  SPARSE_ENCODER_TRANSFORMER = 'sparse_encoder_transformer',
  RESULTS_TRANSFORMER = 'results_transformer',
  NORMALIZATION_TRANSFORMER = 'normalization_transformer',
  // Query-related classes
  QUERY = 'query',
  MATCH_QUERY = 'match_query',
  NEURAL_QUERY = 'neural_query',
  // Document-related classes
  DOCUMENT = 'document',
  // Results-related classes
  RESULTS = 'results',
}

/**
 * MISCELLANEOUS
 */
export const START_FROM_SCRATCH_WORKFLOW_NAME = 'Start From Scratch';
export const DEFAULT_NEW_WORKFLOW_NAME = 'new_workflow';
export const DEFAULT_NEW_WORKFLOW_DESCRIPTION = 'My new workflow';
export const DEFAULT_NEW_WORKFLOW_STATE = WORKFLOW_STATE.NOT_STARTED;
export const DEFAULT_NEW_WORKFLOW_STATE_TYPE = ('NOT_STARTED' as any) as typeof WORKFLOW_STATE;
export const DATE_FORMAT_PATTERN = 'MM/DD/YY hh:mm A';
export const EMPTY_FIELD_STRING = '--';
export const FETCH_ALL_QUERY_BODY = {
  query: {
    match_all: {},
  },
  size: 1000,
};
export const INDEX_NOT_FOUND_EXCEPTION = 'index_not_found_exception';
