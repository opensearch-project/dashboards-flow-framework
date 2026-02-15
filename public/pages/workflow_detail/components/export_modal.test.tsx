/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Workflow, WORKFLOW_TYPE } from '../../../../common';
import { ExportModal } from './export_modal';

const TEST_WORKFLOW_NAME = 'test-workflow-name';
const TEST_WORKFLOW_CUSTOM = {
  name: TEST_WORKFLOW_NAME,
  ui_metadata: {
    type: WORKFLOW_TYPE.CUSTOM,
    config: {},
  },
} as Workflow;
const TEST_WORKFLOW_AGENTIC = {
  name: TEST_WORKFLOW_NAME,
  ui_metadata: {
    type: WORKFLOW_TYPE.AGENTIC_SEARCH,
    config: {
      search: {
        requestAgentId: {
          value: 'test-agent-id',
        },
      },
    },
  },
} as Workflow;

jest.mock('../../../services', () => {
  const { mockCoreServices } = require('../../../../test');
  return {
    ...jest.requireActual('../../../services'),
    ...mockCoreServices,
  };
});

describe('ExportTemplateContent', () => {
  global.URL.createObjectURL = jest.fn();

  test('renders the component for non-agentic-search usecases', () => {
    render(
      <ExportModal
        workflow={TEST_WORKFLOW_CUSTOM}
        setIsExportModalOpen={jest.fn()}
      />
    );

    expect(
      screen.getByTestId('exportDataToggleButtonGroup')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('agenticSearchTabs')).not.toBeInTheDocument();
  });

  test('renders the component for agentic-search usecase', () => {
    render(
      <ExportModal
        workflow={TEST_WORKFLOW_AGENTIC}
        setIsExportModalOpen={jest.fn()}
      />
    );
    expect(
      screen.queryByTestId('exportDataToggleButtonGroup')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('agenticSearchTabs')).toBeInTheDocument();
    expect(screen.getByTestId('searchPipelineCodeBlock')).toBeInTheDocument();
    expect(screen.getByTestId('agenticSearchCodeBlock')).toBeInTheDocument();
  });
});
