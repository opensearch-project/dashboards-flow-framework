/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { snakeCase } from 'lodash';
import {
  MLIngestProcessor,
  MLSearchRequestProcessor,
  NormalizationProcessor,
} from '../../../configs';
import {
  WorkflowTemplate,
  START_FROM_SCRATCH_WORKFLOW_NAME,
  DEFAULT_NEW_WORKFLOW_NAME,
  UIState,
  WORKFLOW_TYPE,
  FETCH_ALL_QUERY,
  customStringify,
  TERM_QUERY,
  MULTIMODAL_SEARCH_QUERY_BOOL,
  IProcessorConfig,
  VECTOR_TEMPLATE_PLACEHOLDER,
  VECTOR_PATTERN,
  KNN_QUERY,
  HYBRID_SEARCH_QUERY_MATCH_KNN,
} from '../../../../common';
import { generateId } from '../../../utils';

// Fn to produce the complete preset template with all necessary UI metadata.
export function enrichPresetWorkflowWithUiMetadata(
  presetWorkflow: Partial<WorkflowTemplate>
): WorkflowTemplate {
  let uiMetadata = {} as UIState;
  switch (presetWorkflow.ui_metadata?.type || WORKFLOW_TYPE.CUSTOM) {
    case WORKFLOW_TYPE.SEMANTIC_SEARCH: {
      uiMetadata = fetchSemanticSearchMetadata();
      break;
    }
    case WORKFLOW_TYPE.MULTIMODAL_SEARCH: {
      uiMetadata = fetchMultimodalSearchMetadata();
      break;
    }
    case WORKFLOW_TYPE.HYBRID_SEARCH: {
      uiMetadata = fetchHybridSearchMetadata();
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
    type: WORKFLOW_TYPE.CUSTOM,
    config: {
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
    },
  };
}

export function fetchSemanticSearchMetadata(): UIState {
  let baseState = fetchEmptyMetadata();
  baseState.type = WORKFLOW_TYPE.SEMANTIC_SEARCH;
  baseState.config.ingest.enrich.processors = [new MLIngestProcessor().toObj()];
  baseState.config.ingest.index.name.value = generateId('knn_index', 6);
  baseState.config.ingest.index.settings.value = customStringify({
    [`index.knn`]: true,
  });
  baseState.config.search.request.value = customStringify(TERM_QUERY);
  baseState.config.search.enrichRequest.processors = [
    injectQueryTemplateInProcessor(
      new MLSearchRequestProcessor().toObj(),
      KNN_QUERY
    ),
  ];
  return baseState;
}

export function fetchMultimodalSearchMetadata(): UIState {
  let baseState = fetchEmptyMetadata();
  baseState.type = WORKFLOW_TYPE.MULTIMODAL_SEARCH;
  baseState.config.ingest.enrich.processors = [new MLIngestProcessor().toObj()];
  baseState.config.ingest.index.name.value = generateId('knn_index', 6);
  baseState.config.ingest.index.settings.value = customStringify({
    [`index.knn`]: true,
  });
  baseState.config.search.request.value = customStringify(
    MULTIMODAL_SEARCH_QUERY_BOOL
  );
  baseState.config.search.enrichRequest.processors = [
    injectQueryTemplateInProcessor(
      new MLSearchRequestProcessor().toObj(),
      MULTIMODAL_SEARCH_QUERY_BOOL
    ),
  ];
  return baseState;
}

export function fetchHybridSearchMetadata(): UIState {
  let baseState = fetchEmptyMetadata();
  baseState.type = WORKFLOW_TYPE.HYBRID_SEARCH;
  baseState.config.ingest.enrich.processors = [new MLIngestProcessor().toObj()];
  baseState.config.ingest.index.name.value = generateId('knn_index', 6);
  baseState.config.ingest.index.settings.value = customStringify({
    [`index.knn`]: true,
  });
  baseState.config.search.request.value = customStringify(TERM_QUERY);
  baseState.config.search.enrichResponse.processors = [
    injectDefaultWeightsInNormalizationProcessor(
      new NormalizationProcessor().toObj()
    ),
  ];
  baseState.config.search.enrichRequest.processors = [
    injectQueryTemplateInProcessor(
      new MLSearchRequestProcessor().toObj(),
      HYBRID_SEARCH_QUERY_MATCH_KNN
    ),
  ];
  return baseState;
}

// Utility fn to process workflow names from their presentable/readable titles
// on the UI, to a valid name format.
// This leads to less friction if users decide to save the name later on.
export function processWorkflowName(workflowName: string): string {
  return workflowName === START_FROM_SCRATCH_WORKFLOW_NAME
    ? DEFAULT_NEW_WORKFLOW_NAME
    : snakeCase(workflowName);
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

// set default weights for a normalization processor. assumes there is 2 queries, and equally
// balances the weight. We don't hardcode in the configuration, since we don't want to set
// invalid defaults for arbitrary use cases (e.g., more than 2 queries). In this case, we
// are already setting 2 queries by default, so we can make this assumption.
function injectDefaultWeightsInNormalizationProcessor(
  processorConfig: IProcessorConfig
): IProcessorConfig {
  processorConfig.optionalFields = processorConfig.optionalFields?.map(
    (optionalField) => {
      let updatedField = optionalField;
      if (optionalField.id === 'weights') {
        updatedField = {
          ...updatedField,
          value: '0.5, 0.5',
        };
      }
      return updatedField;
    }
  );
  return processorConfig;
}
