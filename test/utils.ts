/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  INITIAL_ERRORS_STATE,
  INITIAL_ML_STATE,
  INITIAL_OPENSEARCH_STATE,
  INITIAL_PRESETS_STATE,
  INITIAL_WORKFLOWS_STATE,
} from '../public/store';
import { WorkflowInput } from '../test/interfaces';
import {
  MINIMUM_FULL_SUPPORTED_VERSION,
  WORKFLOW_TYPE,
} from '../common/constants';
import { UIState, Workflow, WorkflowDict } from '../common/interfaces';
import {
  fetchAgenticSearchMetadata,
  fetchEmptyMetadata,
  fetchHybridSearchMetadata,
  fetchMultimodalSearchMetadata,
  fetchSemanticSearchMetadata,
} from '../public/pages/workflows/new_workflow/utils';
import fs from 'fs';
import path from 'path';

export function mockStore(...workflowSets: WorkflowInput[]) {
  let workflowDict = {} as WorkflowDict;
  workflowSets?.forEach((workflowInput) => {
    workflowDict[workflowInput.id] = generateWorkflow(workflowInput);
  });

  const state = {
    opensearch: INITIAL_OPENSEARCH_STATE,
    ml: INITIAL_ML_STATE,
    workflows: {
      ...INITIAL_WORKFLOWS_STATE,
      workflows: workflowDict,
    },
    presets: INITIAL_PRESETS_STATE,
    errors: INITIAL_ERRORS_STATE,
  };

  return {
    getState: () => state,
    dispatch: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
    replaceReducer: jest.fn(),
    [Symbol.observable]: jest.fn(),
  };
}

function generateWorkflow({ id, name, type }: WorkflowInput): Workflow {
  const isSearchWorkflow = [
    WORKFLOW_TYPE.SEMANTIC_SEARCH,
    WORKFLOW_TYPE.MULTIMODAL_SEARCH,
    WORKFLOW_TYPE.HYBRID_SEARCH,
  ].includes(type);

  const version = {
    template: '1.0.0',
    compatibility: isSearchWorkflow
      ? [MINIMUM_FULL_SUPPORTED_VERSION]
      : ['2.19.0', '3.0.0'],
  };

  return {
    id,
    name,
    version,
    ui_metadata: getConfig(type, version.compatibility[0]),
  };
}

function getConfig(workflowType: WORKFLOW_TYPE, version?: string) {
  let uiMetadata = {} as UIState;
  const searchVersion = version || MINIMUM_FULL_SUPPORTED_VERSION;

  switch (workflowType) {
    case WORKFLOW_TYPE.SEMANTIC_SEARCH: {
      uiMetadata = fetchSemanticSearchMetadata(searchVersion);
      break;
    }
    case WORKFLOW_TYPE.MULTIMODAL_SEARCH: {
      uiMetadata = fetchMultimodalSearchMetadata(searchVersion);
      break;
    }
    case WORKFLOW_TYPE.HYBRID_SEARCH: {
      uiMetadata = fetchHybridSearchMetadata(searchVersion);
      break;
    }
    case WORKFLOW_TYPE.AGENTIC_SEARCH: {
      uiMetadata = fetchAgenticSearchMetadata(searchVersion);
      break;
    }
    default: {
      uiMetadata = fetchEmptyMetadata();
      break;
    }
  }
  return uiMetadata;
}

const templatesDir = path.resolve(
  __dirname,
  '..',
  'server',
  'resources',
  'templates'
);

export const loadPresetWorkflowTemplates = () =>
  fs
    .readdirSync(templatesDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) =>
      JSON.parse(fs.readFileSync(path.join(templatesDir, file), 'utf8'))
    );

export const resizeObserverMock = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
