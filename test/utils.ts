/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  INITIAL_ML_STATE,
  INITIAL_OPENSEARCH_STATE,
  INITIAL_PRESETS_STATE,
  INITIAL_WORKFLOWS_STATE,
} from '../public/store';
import { WORKFLOW_TYPE } from '../common/constants';
import { UIState, Workflow } from '../common/interfaces';
import {
  fetchEmptyMetadata,
  fetchHybridSearchMetadata,
  fetchMultimodalSearchMetadata,
  fetchSemanticSearchMetadata,
} from '../public/pages/workflows/new_workflow/utils';

export function mockStore(
  workflowId: string,
  workflowName: string,
  workflowType: WORKFLOW_TYPE
) {
  return {
    getState: () => ({
      opensearch: INITIAL_OPENSEARCH_STATE,
      ml: INITIAL_ML_STATE,
      workflows: {
        ...INITIAL_WORKFLOWS_STATE,
        workflows: {
          [workflowId]: generateWorkflow(
            workflowId,
            workflowName,
            workflowType
          ),
        },
      },
      presets: INITIAL_PRESETS_STATE,
    }),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
    [Symbol.observable]: jest.fn(),
  };
}

function generateWorkflow(
  workflowId: string,
  workflowName: string,
  workflowType: WORKFLOW_TYPE
): Workflow {
  return {
    id: workflowId,
    name: workflowName,
    version: { template: '1.0.0', compatibility: ['2.17.0', '3.0.0'] },
    ui_metadata: getConfig(workflowType),
  };
}
function getConfig(workflowType: WORKFLOW_TYPE) {
  let uiMetadata = {} as UIState;
  switch (workflowType) {
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
  return uiMetadata;
}

export const resizeObserverMock = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
