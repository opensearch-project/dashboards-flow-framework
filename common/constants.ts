/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapEntry, QueryPreset, WORKFLOW_STATE } from './interfaces';
import { customStringify } from './utils';

export const PLUGIN_ID = 'flow-framework';
export const SEARCH_STUDIO = 'Search Studio';

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
export const BULK_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/bulk`;
export const SIMULATE_PIPELINE_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/simulatePipeline`;

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
 * Various constants pertaining to Workflow configs
 */

// frontend-specific workflow types, derived from the available preset templates
export enum WORKFLOW_TYPE {
  SEMANTIC_SEARCH = 'Semantic search',
  MULTIMODAL_SEARCH = 'Multimodal search',
  HYBRID_SEARCH = 'Hybrid search',
  CUSTOM = 'Custom',
  UNKNOWN = 'Unknown',
}

// the names should be consistent with the underlying implementation. used when generating the
// final ingest/search pipeline configurations.
export enum PROCESSOR_TYPE {
  ML = 'ml_inference',
  SPLIT = 'split',
  SORT = 'sort',
  TEXT_CHUNKING = 'text_chunking',
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
  RESULTS_TRANSFORMER = 'results_transformer',
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
 * LINKS
 */
export const ML_INFERENCE_DOCS_LINK =
  'https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/#configuration-parameters';
export const ML_CHOOSE_MODEL_LINK =
  'https://opensearch.org/docs/latest/ml-commons-plugin/integrating-ml-models/#choosing-a-model';
export const TEXT_CHUNKING_PROCESSOR_LINK =
  'https://opensearch.org/docs/latest/ingest-pipelines/processors/text-chunking/';
export const CREATE_WORKFLOW_LINK =
  'https://opensearch.org/docs/latest/automating-configurations/api/create-workflow/';

/**
 * Text chunking algorithm constants
 */
export enum TEXT_CHUNKING_ALGORITHM {
  FIXED_TOKEN_LENGTH = 'fixed_token_length',
  DELIMITER = 'delimiter',
}
export const FIXED_TOKEN_LENGTH_OPTIONAL_FIELDS = [
  'token_limit',
  'tokenizer',
  'overlap_rate',
];
export const DELIMITER_OPTIONAL_FIELDS = ['delimiter'];
export const SHARED_OPTIONAL_FIELDS = ['max_chunk_limit', 'description', 'tag'];

/**
 * QUERY PRESETS
 */
export const VECTOR_FIELD_PATTERN = `{{vector_field}}`;
export const TEXT_FIELD_PATTERN = `{{text_field}}`;
export const QUERY_TEXT_PATTERN = `{{query_text}}`;
export const QUERY_IMAGE_PATTERN = `{{query_image}}`;
export const MODEL_ID_PATTERN = `{{model_id}}`;

export const FETCH_ALL_QUERY = {
  query: {
    match_all: {},
  },
  size: 1000,
};
export const SEMANTIC_SEARCH_QUERY = {
  _source: {
    excludes: [VECTOR_FIELD_PATTERN],
  },
  query: {
    neural: {
      [VECTOR_FIELD_PATTERN]: {
        query_text: QUERY_TEXT_PATTERN,
        model_id: MODEL_ID_PATTERN,
        k: 100,
      },
    },
  },
};
export const MULTIMODAL_SEARCH_QUERY = {
  _source: {
    excludes: [VECTOR_FIELD_PATTERN],
  },
  query: {
    neural: {
      [VECTOR_FIELD_PATTERN]: {
        query_text: QUERY_TEXT_PATTERN,
        query_image: QUERY_IMAGE_PATTERN,
        model_id: MODEL_ID_PATTERN,
        k: 100,
      },
    },
  },
};
export const HYBRID_SEARCH_QUERY = {
  _source: {
    excludes: [VECTOR_FIELD_PATTERN],
  },
  query: {
    hybrid: {
      queries: [
        {
          match: {
            [TEXT_FIELD_PATTERN]: {
              query: QUERY_TEXT_PATTERN,
            },
          },
        },
        {
          neural: {
            [VECTOR_FIELD_PATTERN]: {
              query_text: QUERY_TEXT_PATTERN,
              model_id: MODEL_ID_PATTERN,
              k: 5,
            },
          },
        },
      ],
    },
  },
};

export const QUERY_PRESETS = [
  {
    name: 'Fetch all',
    query: customStringify(FETCH_ALL_QUERY),
  },
  {
    name: WORKFLOW_TYPE.SEMANTIC_SEARCH,
    query: customStringify(SEMANTIC_SEARCH_QUERY),
  },
  {
    name: WORKFLOW_TYPE.MULTIMODAL_SEARCH,
    query: customStringify(MULTIMODAL_SEARCH_QUERY),
  },
  {
    name: WORKFLOW_TYPE.HYBRID_SEARCH,
    query: customStringify(HYBRID_SEARCH_QUERY),
  },
] as QueryPreset[];

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
export const INDEX_NOT_FOUND_EXCEPTION = 'index_not_found_exception';
export const ERROR_GETTING_WORKFLOW_MSG = 'Failed to retrieve template';
export const NO_MODIFICATIONS_FOUND_TEXT =
  'Template does not contain any modifications';
export const JSONPATH_ROOT_SELECTOR = '$.';
export enum SORT_ORDER {
  ASC = 'asc',
  DESC = 'desc',
}
export const MAX_DOCS = 1000;
export const MAX_STRING_LENGTH = 100;
export const MAX_JSON_STRING_LENGTH = 10000;
export const MAX_WORKFLOW_NAME_TO_DISPLAY = 40;
export const WORKFLOW_NAME_REGEXP = RegExp('^[a-zA-Z0-9_-]*$');
export const EMPTY_MAP_ENTRY = { key: '', value: '' } as MapEntry;

export enum PROCESSOR_CONTEXT {
  INGEST = 'ingest',
  SEARCH_REQUEST = 'search_request',
  SEARCH_RESPONSE = 'search_response',
}
