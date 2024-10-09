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
import { WorkflowInput } from '../test/interfaces';
import { WORKFLOW_TYPE } from '../common/constants';
import { UIState, Workflow } from '../common/interfaces';
import {
  fetchEmptyMetadata,
  fetchHybridSearchMetadata,
  fetchMultimodalSearchMetadata,
  fetchSemanticSearchMetadata,
} from '../public/pages/workflows/new_workflow/utils';
import fs from 'fs';
import path from 'path';

export function mockStore(...workflowSets: WorkflowInput[]) {
  return {
    getState: () => ({
      opensearch: INITIAL_OPENSEARCH_STATE,
      ml: INITIAL_ML_STATE,
      workflows: {
        ...INITIAL_WORKFLOWS_STATE,
        workflows: workflowSets.reduce(
          (acc, workflowInput) => ({
            ...acc,
            [workflowInput.id]: generateWorkflow(workflowInput),
          }),
          {}
        ),
      },
      presets: INITIAL_PRESETS_STATE,
    }),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
    [Symbol.observable]: jest.fn(),
  };
}

function generateWorkflow({ id, name, type }: WorkflowInput): Workflow {
  return {
    id,
    name,
    version: { template: '1.0.0', compatibility: ['2.18.0', '3.0.0'] },
    ui_metadata: getConfig(type),
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
