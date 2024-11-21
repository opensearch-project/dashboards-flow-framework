/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MapEntry,
  PromptPreset,
  QueryPreset,
  WORKFLOW_STATE,
} from './interfaces';
import { customStringify } from './utils';

export const PLUGIN_ID = 'opensearch-flow';
export const PLUGIN_NAME = 'OpenSearch Flow';

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
export const ML_CONNECTOR_ROUTE_PREFIX = `${ML_API_ROUTE_PREFIX}/connectors`;
export const ML_SEARCH_MODELS_ROUTE = `${ML_MODEL_ROUTE_PREFIX}/_search`;
export const ML_SEARCH_CONNECTORS_ROUTE = `${ML_CONNECTOR_ROUTE_PREFIX}/_search`;

/**
 * OpenSearch APIs
 */
export const SEARCH_PIPELINE_ROUTE = '/_search/pipeline';

/**
 * NODE APIs
 */
export const BASE_NODE_API_PATH = '/api/flow_framework';

// OpenSearch node APIs
export const BASE_OPENSEARCH_NODE_API_PATH = `${BASE_NODE_API_PATH}/opensearch`;
export const CAT_INDICES_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/catIndices`;
export const GET_MAPPINGS_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/mappings`;
export const GET_INDEX_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/getIndex`;
export const SEARCH_INDEX_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/search`;
export const INGEST_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/ingest`;
export const BULK_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/bulk`;
export const SIMULATE_PIPELINE_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/simulatePipeline`;
export const INGEST_PIPELINE_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/getIngestPipeline`;
export const SEARCH_PIPELINE_NODE_API_PATH = `${BASE_OPENSEARCH_NODE_API_PATH}/getSearchPipeline`;

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
export const BASE_CONNECTOR_NODE_API_PATH = `${BASE_NODE_API_PATH}/connector`;
export const SEARCH_MODELS_NODE_API_PATH = `${BASE_MODEL_NODE_API_PATH}/search`;
export const SEARCH_CONNECTORS_NODE_API_PATH = `${BASE_CONNECTOR_NODE_API_PATH}/search`;

/**
 * Remote model dimensions. Used for attempting to pre-fill dimension size
 * based on the specified remote model from a remote service, if found
 */

// Cohere
export const COHERE_DIMENSIONS = {
  [`embed-english-v3.0`]: 1024,
  [`embed-english-light-v3.0`]: 384,
  [`embed-multilingual-v3.0`]: 1024,
  [`embed-multilingual-light-v3.0`]: 384,
  [`embed-english-v2.0`]: 4096,
  [`embed-english-light-v2.0`]: 1024,
  [`embed-multilingual-v2.0`]: 768,
};

// OpenAI
export const OPENAI_DIMENSIONS = {
  [`text-embedding-3-small`]: 1536,
  [`text-embedding-3-large`]: 3072,
  [`text-embedding-ada-002`]: 1536,
};

// Amazon BedRock
export const BEDROCK_DIMENSIONS = {
  [`amazon.titan-embed-text-v1`]: 1536,
  [`amazon.titan-embed-text-v2`]: 1024,
  [`amazon.titan-embed-image-v1`]: 1024,
  [`cohere.embed-english-v3`]: 1024, // same as Cohere directly
  [`cohere.embed-multilingual-v3`]: 1024, // same as Cohere directly
};

/**
 * Various constants pertaining to Workflow configs
 */

// frontend-specific workflow types, derived from the available preset templates
export enum WORKFLOW_TYPE {
  SEMANTIC_SEARCH = 'Semantic search',
  MULTIMODAL_SEARCH = 'Multimodal search',
  HYBRID_SEARCH = 'Hybrid search',
  SENTIMENT_ANALYSIS = 'Sentiment analysis',
  RAG = 'Retrieval-augmented generation',
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
  NORMALIZATION = 'normalization-processor',
  COLLAPSE = 'collapse',
  RERANK = 'rerank',
  TEXT_EMBEDDING = 'text-embedding-processor',
  TEXT_IMAGE_EMBEDDING = 'text-image-embedding-processor',
  
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
  INDEX = 'index',
  KNN_INDEX = 'knn_index',
  TRANSFORMER = 'transformer',
  ML_TRANSFORMER = 'ml_transformer',
  SEARCH_REQUEST = 'search_request',
  DOCUMENT = 'document',
  SEARCH_RESPONSE = 'search_response',
}

/**
 * LINKS
 */
export const ML_INFERENCE_DOCS_LINK =
  'https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/#configuration-parameters';
export const ML_INFERENCE_RESPONSE_DOCS_LINK =
  'https://opensearch.org/docs/latest/search-plugins/search-pipelines/ml-inference-search-response/#request-fields';
export const ML_CHOOSE_MODEL_LINK =
  'https://opensearch.org/docs/latest/ml-commons-plugin/integrating-ml-models/#choosing-a-model';
export const TEXT_CHUNKING_PROCESSOR_LINK =
  'https://opensearch.org/docs/latest/ingest-pipelines/processors/text-chunking/';
export const CREATE_WORKFLOW_LINK =
  'https://opensearch.org/docs/latest/automating-configurations/api/create-workflow/';
export const WORKFLOW_TUTORIAL_LINK =
  'https://opensearch.org/docs/latest/automating-configurations/workflow-tutorial/';
export const NORMALIZATION_PROCESSOR_LINK =
  'https://opensearch.org/docs/latest/search-plugins/search-pipelines/normalization-processor/';
export const GITHUB_FEEDBACK_LINK =
  'https://github.com/opensearch-project/dashboards-flow-framework/issues/new/choose';

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
 * DEFAULT FIELD VALUES
 */
export const DEFAULT_TEXT_FIELD = 'my_text';
export const DEFAULT_VECTOR_FIELD = 'my_embedding';
export const DEFAULT_IMAGE_FIELD = 'my_image';
export const DEFAULT_LABEL_FIELD = 'label';
export const DEFAULT_LLM_RESPONSE_FIELD = 'llm_response';

/**
 * QUERY PRESETS
 */
export const VECTOR_FIELD_PATTERN = `{{vector_field}}`;
export const TEXT_FIELD_PATTERN = `{{text_field}}`;
export const IMAGE_FIELD_PATTERN = `{{image_field}}`;
export const LABEL_FIELD_PATTERN = `{{label_field}}`;
export const QUERY_TEXT_PATTERN = `{{query_text}}`;
export const QUERY_IMAGE_PATTERN = `{{query_image}}`;
export const MODEL_ID_PATTERN = `{{model_id}}`;
export const VECTOR = 'vector';
export const VECTOR_PATTERN = `{{${VECTOR}}}`;
export const VECTOR_TEMPLATE_PLACEHOLDER = `\$\{${VECTOR}\}`;
export const DEFAULT_K = 10;

export const FETCH_ALL_QUERY = {
  query: {
    match_all: {},
  },
  size: 1000,
};
export const TERM_QUERY_TEXT = {
  query: {
    term: {
      [TEXT_FIELD_PATTERN]: {
        value: QUERY_TEXT_PATTERN,
      },
    },
  },
};
export const TERM_QUERY_LABEL = {
  query: {
    term: {
      [LABEL_FIELD_PATTERN]: {
        value: QUERY_TEXT_PATTERN,
      },
    },
  },
};
export const KNN_QUERY = {
  _source: {
    excludes: [VECTOR_FIELD_PATTERN],
  },
  query: {
    knn: {
      [VECTOR_FIELD_PATTERN]: {
        vector: VECTOR_PATTERN,
        k: DEFAULT_K,
      },
    },
  },
};
export const SEMANTIC_SEARCH_QUERY_NEURAL = {
  _source: {
    excludes: [VECTOR_FIELD_PATTERN],
  },
  query: {
    neural: {
      [VECTOR_FIELD_PATTERN]: {
        query_text: QUERY_TEXT_PATTERN,
        model_id: MODEL_ID_PATTERN,
        k: DEFAULT_K,
      },
    },
  },
};
export const MULTIMODAL_SEARCH_QUERY_NEURAL = {
  _source: {
    excludes: [VECTOR_FIELD_PATTERN],
  },
  query: {
    neural: {
      [VECTOR_FIELD_PATTERN]: {
        query_text: QUERY_TEXT_PATTERN,
        query_image: QUERY_IMAGE_PATTERN,
        model_id: MODEL_ID_PATTERN,
        k: DEFAULT_K,
      },
    },
  },
};
export const MULTIMODAL_SEARCH_QUERY_BOOL = {
  query: {
    bool: {
      must: [
        {
          match: {
            [TEXT_FIELD_PATTERN]: QUERY_TEXT_PATTERN,
          },
        },
        {
          match: {
            [IMAGE_FIELD_PATTERN]: QUERY_IMAGE_PATTERN,
          },
        },
      ],
    },
  },
};
export const HYBRID_SEARCH_QUERY_MATCH_KNN = {
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
          knn: {
            [VECTOR_FIELD_PATTERN]: {
              vector: VECTOR_PATTERN,
              k: DEFAULT_K,
            },
          },
        },
      ],
    },
  },
};
export const HYBRID_SEARCH_QUERY_MATCH_NEURAL = {
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
              k: DEFAULT_K,
            },
          },
        },
      ],
    },
  },
};
export const HYBRID_SEARCH_QUERY_MATCH_TERM = {
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
          term: {
            [TEXT_FIELD_PATTERN]: {
              value: QUERY_TEXT_PATTERN,
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
    name: 'Term',
    query: customStringify(TERM_QUERY_TEXT),
  },
  {
    name: 'Basic k-NN',
    query: customStringify(KNN_QUERY),
  },
  {
    name: `${WORKFLOW_TYPE.SEMANTIC_SEARCH} (neural)`,
    query: customStringify(SEMANTIC_SEARCH_QUERY_NEURAL),
  },
  {
    name: WORKFLOW_TYPE.MULTIMODAL_SEARCH,
    query: customStringify(MULTIMODAL_SEARCH_QUERY_BOOL),
  },
  {
    name: `${WORKFLOW_TYPE.MULTIMODAL_SEARCH} (neural)`,
    query: customStringify(MULTIMODAL_SEARCH_QUERY_NEURAL),
  },
  {
    name: `Hybrid search (match & k-NN queries)`,
    query: customStringify(HYBRID_SEARCH_QUERY_MATCH_KNN),
  },
  {
    name: `Hybrid search (match & term queries)`,
    query: customStringify(HYBRID_SEARCH_QUERY_MATCH_TERM),
  },
  {
    name: `Hybrid search (match & neural queries)`,
    query: customStringify(HYBRID_SEARCH_QUERY_MATCH_NEURAL),
  },
] as QueryPreset[];

/**
 * PROMPT PRESETS
 */
export const SUMMARIZE_DOCS_PROMPT =
  "Human: You are a professional data analyist. \
You are given a list of document results. You will \
analyze the data and generate a human-readable summary of the results. If you don't \
know the answer, just say I don't know.\
\n\n Results: <provide some results> \
\n\n Human: Please summarize the results.\
\n\n Assistant:";

export const QA_WITH_DOCUMENTS_PROMPT =
  "Human: You are a professional data analyist. \
You are given a list of document results, along with a question. You will \
analyze the results and generate a human-readable response to the question, \
based on the results. If you don't know the answer, just say I don't know.\
\n\n Results: <provide some results> \
\n\n Question: <provide some question> \
\n\n Human: Please answer the question using the provided results.\
\n\n Assistant:";

export const PROMPT_PRESETS = [
  {
    name: 'Summarize documents',
    prompt: SUMMARIZE_DOCS_PROMPT,
  },
  {
    name: 'QA with documents',
    prompt: QA_WITH_DOCUMENTS_PROMPT,
  },
] as PromptPreset[];

/**
 * MISCELLANEOUS
 */
export enum PROCESSOR_CONTEXT {
  INGEST = 'ingest',
  SEARCH_REQUEST = 'search_request',
  SEARCH_RESPONSE = 'search_response',
}
export enum TRANSFORM_CONTEXT {
  INPUT = 'input',
  OUTPUT = 'output',
}
export const START_FROM_SCRATCH_WORKFLOW_NAME = 'Start From Scratch';
export const DEFAULT_NEW_WORKFLOW_NAME = 'new_workflow';
export const DEFAULT_NEW_WORKFLOW_DESCRIPTION = 'My new workflow';
export const DEFAULT_NEW_WORKFLOW_STATE_TYPE = ('NOT_STARTED' as any) as typeof WORKFLOW_STATE;
export const DATE_FORMAT_PATTERN = 'MM/DD/YY hh:mm A';
export const EMPTY_FIELD_STRING = '--';
export const OMIT_SYSTEM_INDEX_PATTERN = '*,-.*';
export const INDEX_NOT_FOUND_EXCEPTION = 'index_not_found_exception';
export const ERROR_GETTING_WORKFLOW_MSG = 'Failed to retrieve template';
export const NO_TEMPLATES_FOUND_MSG = 'There are no templates';
export const NO_MODIFICATIONS_FOUND_TEXT =
  'Template does not contain any modifications';
export const JSONPATH_ROOT_SELECTOR = '$';
export const REQUEST_PREFIX = '_request.';
export const REQUEST_PREFIX_WITH_JSONPATH_ROOT_SELECTOR = '$._request.';
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
export const MODEL_OUTPUT_SCHEMA_NESTED_PATH =
  'output.properties.inference_results.items.properties.output.items.properties.dataAsMap.properties';
export const MODEL_OUTPUT_SCHEMA_FULL_PATH = 'output.properties';
export const PROMPT_FIELD = 'prompt'; // TODO: likely expand to support a pattern and/or multiple (e.g., "prompt", "prompt_template", etc.)
export enum CONFIG_STEP {
  INGEST = 'Ingestion pipeline',
  SEARCH = 'Search pipeline',
}
export enum SOURCE_OPTIONS {
  MANUAL = 'manual',
  UPLOAD = 'upload',
  EXISTING_INDEX = 'existing_index',
}
