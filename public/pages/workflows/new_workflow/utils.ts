/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MLIngestProcessor,
  MLSearchRequestProcessor,
  MLSearchResponseProcessor,
  NormalizationProcessor,
  TextEmbeddingIngestProcessor,
  TextImageEmbeddingIngestProcessor,
} from '../../../configs';
import {
  WorkflowTemplate,
  UIState,
  WORKFLOW_TYPE,
  FETCH_ALL_QUERY,
  customStringify,
  MULTIMODAL_SEARCH_QUERY_BOOL,
  IProcessorConfig,
  VECTOR_TEMPLATE_PLACEHOLDER,
  VECTOR_PATTERN,
  KNN_QUERY,
  HYBRID_SEARCH_QUERY_MATCH_KNN,
  WorkflowConfig,
  UI_METADATA_SCHEMA_VERSION,
  SEMANTIC_SEARCH_QUERY_NEURAL,
  MULTIMODAL_SEARCH_QUERY_NEURAL,
  HYBRID_SEARCH_QUERY_MATCH_NEURAL,
  MATCH_QUERY_TEXT,
  NEURAL_SPARSE_SEARCH_QUERY,
} from '../../../../common';
import { generateId } from '../../../utils';
import semver from 'semver';
import { MINIMUM_FULL_SUPPORTED_VERSION } from '../../../../common';

// Fn to produce the complete preset template with all necessary UI metadata.
export function enrichPresetWorkflowWithUiMetadata(
  presetWorkflow: Partial<WorkflowTemplate>,
  version: string
): WorkflowTemplate {
  const defaultVersion = MINIMUM_FULL_SUPPORTED_VERSION;
  const workflowVersion = version ?? defaultVersion;

  let uiMetadata = {} as UIState;
  switch (presetWorkflow.ui_metadata?.type || WORKFLOW_TYPE.CUSTOM) {
    case WORKFLOW_TYPE.SEMANTIC_SEARCH: {
      uiMetadata = fetchSemanticSearchMetadata(workflowVersion);
      break;
    }
    case WORKFLOW_TYPE.MULTIMODAL_SEARCH: {
      uiMetadata = fetchMultimodalSearchMetadata(workflowVersion);
      break;
    }
    case WORKFLOW_TYPE.HYBRID_SEARCH: {
      uiMetadata = fetchHybridSearchMetadata(workflowVersion);
      break;
    }
    case WORKFLOW_TYPE.VECTOR_SEARCH_WITH_RAG: {
      uiMetadata = fetchVectorSearchWithRAGMetadata(workflowVersion);
      break;
    }
    case WORKFLOW_TYPE.HYBRID_SEARCH_WITH_RAG: {
      uiMetadata = fetchHybridSearchWithRAGMetadata(workflowVersion);
      break;
    }
    case WORKFLOW_TYPE.SEMANTIC_SEARCH_USING_SPARSE_ENCODERS: {
      uiMetadata = fetchNeuralSparseSearchMetadata(workflowVersion);
      break;
    }
    default: {
      uiMetadata = fetchEmptyMetadata();
      break;
    }
  }

  return {
    ...presetWorkflow,
    ui_metadata: {
      ...presetWorkflow.ui_metadata,
      ...uiMetadata,
    },
  } as WorkflowTemplate;
}

export function fetchEmptyMetadata(): UIState {
  return {
    schema_version: UI_METADATA_SCHEMA_VERSION,
    type: WORKFLOW_TYPE.CUSTOM,
    config: fetchEmptyUIConfig(),
  };
}

export function fetchEmptyUIConfig(): WorkflowConfig {
  return {
    ingest: {
      enabled: {
        id: 'enabled',
        type: 'boolean',
        value: true,
      },
      pipelineName: {
        id: 'pipelineName',
        type: 'string',
        value: generateId('ingest_pipeline'),
      },
      enrich: {
        processors: [],
      },
      index: {
        name: {
          id: 'indexName',
          type: 'string',
          value: generateId('my_index', 6),
        },
        mappings: {
          id: 'indexMappings',
          type: 'json',
          value: customStringify({
            properties: {},
          }),
        },
        settings: {
          id: 'indexSettings',
          type: 'json',
        },
      },
    },
    search: {
      request: {
        id: 'request',
        type: 'json',
        value: customStringify(FETCH_ALL_QUERY),
      },
      pipelineName: {
        id: 'pipelineName',
        type: 'string',
        value: generateId('search_pipeline'),
      },
      index: {
        name: {
          id: 'indexName',
          type: 'string',
        },
      },
      enrichRequest: {
        processors: [],
      },
      enrichResponse: {
        processors: [],
      },
    },
  };
}

export function fetchSemanticSearchMetadata(version: string): UIState {
  const isPreV219 = semver.lt(version, MINIMUM_FULL_SUPPORTED_VERSION);
  let baseState = fetchEmptyMetadata();
  baseState.type = WORKFLOW_TYPE.SEMANTIC_SEARCH;

  baseState.config.ingest.enrich.processors = isPreV219
    ? [new TextEmbeddingIngestProcessor().toObj()]
    : [new MLIngestProcessor().toObj()];

  baseState.config.ingest.index.name.value = generateId('knn_index', 6);
  baseState.config.ingest.index.settings.value = customStringify({
    [`index.knn`]: true,
  });

  baseState.config.search.request.value = customStringify(
    isPreV219 ? SEMANTIC_SEARCH_QUERY_NEURAL : MATCH_QUERY_TEXT
  );

  baseState.config.search.enrichRequest.processors = isPreV219
    ? []
    : [
        injectQueryTemplateInProcessor(
          new MLSearchRequestProcessor().toObj(),
          KNN_QUERY
        ),
      ];

  return baseState;
}

export function fetchNeuralSparseSearchMetadata(version: string): UIState {
  let baseState = fetchEmptyMetadata();
  baseState.type = WORKFLOW_TYPE.SEMANTIC_SEARCH_USING_SPARSE_ENCODERS;

  baseState.config.ingest.enrich.processors = [new MLIngestProcessor().toObj()];

  baseState.config.ingest.index.name.value = generateId('neural_sparse_index', 6);
  baseState.config.ingest.index.settings.value = customStringify({});

    baseState.config.search.request.value = customStringify(MATCH_QUERY_TEXT);
  baseState.config.search.enrichRequest.processors = [
        injectQueryTemplateInProcessor(
          new MLSearchRequestProcessor().toObj(),
          NEURAL_SPARSE_SEARCH_QUERY
        ),
      ];

  return baseState;
}

export function fetchMultimodalSearchMetadata(version: string): UIState {
  const isPreV219 = semver.lt(version, MINIMUM_FULL_SUPPORTED_VERSION);
  let baseState = fetchEmptyMetadata();
  baseState.type = WORKFLOW_TYPE.MULTIMODAL_SEARCH;

  baseState.config.ingest.enrich.processors = isPreV219
    ? [new TextImageEmbeddingIngestProcessor().toObj()]
    : [new MLIngestProcessor().toObj()];

  baseState.config.ingest.index.name.value = generateId('knn_index', 6);
  baseState.config.ingest.index.settings.value = customStringify({
    [`index.knn`]: true,
  });

  baseState.config.search.request.value = customStringify(
    isPreV219 ? MULTIMODAL_SEARCH_QUERY_NEURAL : MULTIMODAL_SEARCH_QUERY_BOOL
  );

  baseState.config.search.enrichRequest.processors = isPreV219
    ? []
    : [
        injectQueryTemplateInProcessor(
          new MLSearchRequestProcessor().toObj(),
          KNN_QUERY
        ),
      ];

  return baseState;
}

export function fetchHybridSearchMetadata(version: string): UIState {
  const isPreV219 = semver.lt(version, MINIMUM_FULL_SUPPORTED_VERSION);
  let baseState = fetchEmptyMetadata();
  baseState.type = WORKFLOW_TYPE.HYBRID_SEARCH;

  baseState.config.ingest.enrich.processors = isPreV219
    ? [new TextEmbeddingIngestProcessor().toObj()]
    : [new MLIngestProcessor().toObj()];

  baseState.config.ingest.index.name.value = generateId('knn_index', 6);
  baseState.config.ingest.index.settings.value = customStringify({
    [`index.knn`]: true,
  });

  baseState.config.search.request.value = customStringify(
    isPreV219 ? HYBRID_SEARCH_QUERY_MATCH_NEURAL : MATCH_QUERY_TEXT
  );

  baseState.config.search.enrichResponse.processors = [
    new NormalizationProcessor().toObj(),
  ];

  baseState.config.search.enrichRequest.processors = isPreV219
    ? []
    : [
        injectQueryTemplateInProcessor(
          new MLSearchRequestProcessor().toObj(),
          HYBRID_SEARCH_QUERY_MATCH_KNN
        ),
      ];

  return baseState;
}

export function fetchVectorSearchWithRAGMetadata(version: string): UIState {
  let baseState = fetchEmptyMetadata();
  baseState.type = WORKFLOW_TYPE.VECTOR_SEARCH_WITH_RAG;
  // Ingest config: knn index w/ an ML inference processor
  baseState.config.ingest.enrich.processors = [new MLIngestProcessor().toObj()];
  baseState.config.ingest.index.name.value = generateId('knn_index', 6);
  baseState.config.ingest.index.settings.value = customStringify({
    [`index.knn`]: true,
  });
  // Search config: match query => ML inference processor for generating embeddings =>
  // ML inference processor for returning LLM-generated response of results
  baseState.config.search.request.value = customStringify(MATCH_QUERY_TEXT);
  baseState.config.search.enrichRequest.processors = [
    injectQueryTemplateInProcessor(
      new MLSearchRequestProcessor().toObj(),
      KNN_QUERY
    ),
  ];
  baseState.config.search.enrichResponse.processors = [
    new MLSearchResponseProcessor().toObj(),
  ];
  return baseState;
}

export function fetchHybridSearchWithRAGMetadata(version: string): UIState {
  let baseState = fetchEmptyMetadata();
  baseState.type = WORKFLOW_TYPE.HYBRID_SEARCH_WITH_RAG;
  // Ingest config: knn index w/ an ML inference processor
  baseState.config.ingest.enrich.processors = [new MLIngestProcessor().toObj()];
  baseState.config.ingest.index.name.value = generateId('knn_index', 6);
  baseState.config.ingest.index.settings.value = customStringify({
    [`index.knn`]: true,
  });
  // Search config: match query => ML inference processor for generating embeddings
  // with hybrid search => ML inference processor for returning LLM-generated response of results
  baseState.config.search.request.value = customStringify(MATCH_QUERY_TEXT);
  baseState.config.search.enrichRequest.processors = [
    injectQueryTemplateInProcessor(
      new MLSearchRequestProcessor().toObj(),
      HYBRID_SEARCH_QUERY_MATCH_KNN
    ),
  ];
  baseState.config.search.enrichResponse.processors = [
    new NormalizationProcessor().toObj(),
    new MLSearchResponseProcessor().toObj(),
  ];
  return baseState;
}

// populate the `query_template` config value with a given query template
// by default, we replace any vector pattern ("{{vector}}") with the unquoted
// vector template placeholder (${vector}) so it becomes a proper template
function injectQueryTemplateInProcessor(
  processorConfig: IProcessorConfig,
  queryObj: {}
): IProcessorConfig {
  processorConfig.optionalFields = processorConfig.optionalFields?.map(
    (optionalField) => {
      let updatedField = optionalField;
      if (optionalField.id === 'query_template') {
        updatedField = {
          ...updatedField,
          value: customStringify(queryObj).replace(
            new RegExp(`"${VECTOR_PATTERN}"`, 'g'),
            VECTOR_TEMPLATE_PLACEHOLDER
          ),
        };
      }
      return updatedField;
    }
  );
  return processorConfig;
}
