/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AgenticSearchApplicationContent } from './agentic_search_application_content';
import { Workflow } from '../../../../common';

const TEST_AGENT_ID = 'test-agent-id';
const TEST_WORKFLOW = {
  ui_metadata: {
    config: {
      search: {
        requestAgentId: {
          value: TEST_AGENT_ID,
        },
      },
    },
  },
} as Workflow;
const TEST_WORKFLOW_NO_AGENT = {
  ui_metadata: {
    config: {
      search: {
        requestAgentId: {
          value: '',
        },
      },
    },
  },
} as Workflow;

describe('AgenticSearchApplicationContent', () => {
  test('renders the component with agent', () => {
    render(<AgenticSearchApplicationContent workflow={TEST_WORKFLOW} />);

    expect(screen.queryByTestId('noAgentFoundCallout')).not.toBeInTheDocument();
    expect(screen.getByTestId('searchPipelineCodeBlock')).toBeInTheDocument();
    expect(screen.getByTestId('agenticSearchCodeBlock')).toBeInTheDocument();
  });
  test('renders the component with no agent', () => {
    render(
      <AgenticSearchApplicationContent workflow={TEST_WORKFLOW_NO_AGENT} />
    );

    expect(screen.getByTestId('noAgentFoundCallout')).toBeInTheDocument();
    expect(
      screen.queryByTestId('searchPipelineCodeBlock')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('agenticSearchCodeBlock')
    ).not.toBeInTheDocument();
  });
});
