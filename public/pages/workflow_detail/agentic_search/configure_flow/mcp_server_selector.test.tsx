/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MCPServerSelector } from './mcp_server_selector';
import {
  CONNECTOR_PROTOCOL,
  DEFAULT_MCP_SERVER,
  MCPConnector,
} from '../../../../../common';

// Setup mock store
const mockStore = configureStore([]);

describe('MCPServerSelector', () => {
  // Initial state for the Redux store
  const initialState = {
    ml: {
      connectors: {
        'connector-1': {
          id: 'connector-1',
          name: 'Test Connector 1',
          protocol: CONNECTOR_PROTOCOL.MCP_SSE,
        },
        'connector-2': {
          id: 'connector-2',
          name: 'Test Connector 2',
          protocol: CONNECTOR_PROTOCOL.MCP_STREAMABLE_HTTP,
        },
        'connector-3': {
          id: 'connector-3',
          name: 'Non-MCP Connector',
          protocol: CONNECTOR_PROTOCOL.HTTP,
        },
      },
    },
  };

  const mockUpdateMCPServer = jest.fn();
  const serverIndex = 0;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('filters out non-MCP connectors from dropdown options', () => {
    const store = mockStore(initialState);
    const allServers: MCPConnector[] = [{ ...DEFAULT_MCP_SERVER }];

    const { container } = render(
      <Provider store={store}>
        <MCPServerSelector
          allServers={allServers}
          serverIndex={serverIndex}
          updateMCPServer={mockUpdateMCPServer}
        />
      </Provider>
    );

    // Verify MCP connectors are in the dropdown
    expect(container.innerHTML).toContain('Test Connector 1');
    expect(container.innerHTML).toContain('Test Connector 2');

    // Verify non-MCP connectors are NOT in the dropdown
    expect(container.innerHTML).not.toContain('Non-MCP Connector');
  });

  test('filters out already selected connectors from other servers', () => {
    const store = mockStore(initialState);
    const allServers: MCPConnector[] = [
      {
        mcp_connector_id: 'connector-1',
        tool_filters: [],
      },
      {
        mcp_connector_id: '',
        tool_filters: [],
      },
    ];

    const { container } = render(
      <Provider store={store}>
        <MCPServerSelector
          allServers={allServers}
          serverIndex={1}
          updateMCPServer={mockUpdateMCPServer}
        />
      </Provider>
    );

    // Verify the already selected connector is not in the dropdown options for the second server
    expect(container.innerHTML).not.toContain('Test Connector 1');
    expect(container.innerHTML).toContain('Test Connector 2');
  });

  test('shows warning message when no connectors are available', () => {
    // Mock a state with no connectors
    const emptyState = {
      ml: {
        connectors: {},
      },
    };
    const store = mockStore(emptyState);
    const allServers: MCPConnector[] = [{ ...DEFAULT_MCP_SERVER }];

    render(
      <Provider store={store}>
        <MCPServerSelector
          allServers={allServers}
          serverIndex={serverIndex}
          updateMCPServer={mockUpdateMCPServer}
        />
      </Provider>
    );

    // Check that the warning message is displayed
    expect(screen.getByText('No MCP connectors found')).toBeInTheDocument();
  });
});
