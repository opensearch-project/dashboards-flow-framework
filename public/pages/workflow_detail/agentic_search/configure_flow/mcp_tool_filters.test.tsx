/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MCPToolFilters } from './mcp_tool_filters';
import { MCPConnector } from '../../../../../common';

describe('MCPToolFilters', () => {
  const mockUpdateMCPServer = jest.fn();
  const serverIndex = 0;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with empty filters', () => {
    const mcpServer: MCPConnector = {
      mcp_connector_id: 'test-connector',
      tool_filters: [],
    };

    render(
      <MCPToolFilters
        mcpServer={mcpServer}
        index={serverIndex}
        updateMCPServer={mockUpdateMCPServer}
      />
    );

    // Verify the component renders
    const comboBox = screen.getByTestId('toolFiltersComboBox');
    expect(comboBox).toBeInTheDocument();
  });

  test('renders with existing filters', () => {
    const mcpServer: MCPConnector = {
      mcp_connector_id: 'test-connector',
      tool_filters: ['filter1', 'filter2'],
    };

    render(
      <MCPToolFilters
        mcpServer={mcpServer}
        index={serverIndex}
        updateMCPServer={mockUpdateMCPServer}
      />
    );

    // Verify the component renders with filters
    expect(document.body.textContent).toContain('filter1');
    expect(document.body.textContent).toContain('filter2');
  });
});
