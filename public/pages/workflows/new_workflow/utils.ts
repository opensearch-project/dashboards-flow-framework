/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { snakeCase } from 'lodash';
import { MLIngestProcessor } from '../../../configs';
import {
  WorkflowTemplate,
  START_FROM_SCRATCH_WORKFLOW_NAME,
  DEFAULT_NEW_WORKFLOW_NAME,
  UIState,
  WORKFLOW_TYPE,
  FETCH_ALL_QUERY_BODY,
  customStringify,
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
    // TODO: add more presets
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

function fetchEmptyMetadata(): UIState {
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
            value: 'my-new-index',
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
          value: customStringify(FETCH_ALL_QUERY_BODY),
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

function fetchSemanticSearchMetadata(): UIState {
  // We can reuse the base state. Only need to override a few things,
  // such as preset ingest processors.
  let baseState = fetchEmptyMetadata();
  baseState.type = WORKFLOW_TYPE.SEMANTIC_SEARCH;
  baseState.config.ingest.enrich.processors = [new MLIngestProcessor().toObj()];
  baseState.config.ingest.index.name.value = 'my-knn-index';
  baseState.config.ingest.index.settings.value = customStringify({
    [`index.knn`]: true,
  });
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
