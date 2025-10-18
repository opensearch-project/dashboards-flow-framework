/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { AgentMCPServers } from './agent_mcp_servers';
import { CONNECTOR_PROTOCOL, DEFAULT_MCP_SERVER } from '../../../../../common';

// Setup mock store
const mockStore = configureStore([]);

describe('AgentMCPServers', () => {
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
      },
    },
  };

  const mockSetAgentForm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with no MCP servers initially', () => {
    const store = mockStore(initialState);
    const mockAgentForm = {
      parameters: {
        mcp_connectors: [],
      },
    };

    render(
      <Provider store={store}>
        <AgentMCPServers
          agentForm={mockAgentForm}
          setAgentForm={mockSetAgentForm}
        />
      </Provider>
    );

    // Check that the "Add MCP server" button is present
    expect(screen.getByTestId('addMCPServerButton')).toBeInTheDocument();
  });

  test('adds a new MCP server when "Add MCP server" is clicked', () => {
    const store = mockStore(initialState);
    const mockAgentForm = {
      parameters: {
        mcp_connectors: [],
      },
    };

    render(
      <Provider store={store}>
        <AgentMCPServers
          agentForm={mockAgentForm}
          setAgentForm={mockSetAgentForm}
        />
      </Provider>
    );

    fireEvent.click(screen.getByText('Add MCP server'));

    // Check if setAgentForm is called with the correct arguments
    expect(mockSetAgentForm).toHaveBeenCalledWith({
      parameters: {
        mcp_connectors: [DEFAULT_MCP_SERVER],
      },
    });
  });

  test('removes an MCP server when trash button is clicked', () => {
    const store = mockStore(initialState);
    const mockAgentForm = {
      parameters: {
        mcp_connectors: [
          {
            mcp_connector_id: 'connector-1',
            tool_filters: ['filter1', 'filter2'],
          },
        ],
      },
    };

    render(
      <Provider store={store}>
        <AgentMCPServers
          agentForm={mockAgentForm}
          setAgentForm={mockSetAgentForm}
        />
      </Provider>
    );

    // Find and click the trash button
    const trashButton = screen.getByTestId('removeMCPServerButton');
    fireEvent.click(trashButton);

    // Check if setAgentForm is called with the correct arguments (empty array)
    expect(mockSetAgentForm).toHaveBeenCalledWith({
      parameters: {
        mcp_connectors: [],
      },
    });
  });

  test('disables "Add MCP server" button when there is an empty connector ID', () => {
    const store = mockStore(initialState);
    const mockAgentForm = {
      parameters: {
        mcp_connectors: [
          {
            mcp_connector_id: '', // Empty connector ID
            tool_filters: [],
          },
        ],
      },
    };

    render(
      <Provider store={store}>
        <AgentMCPServers
          agentForm={mockAgentForm}
          setAgentForm={mockSetAgentForm}
        />
      </Provider>
    );

    // Get the add button and check its disabled property
    const addButton = screen.getByTestId('addMCPServerButton');
    expect(addButton).toBeDisabled();
  });
});
