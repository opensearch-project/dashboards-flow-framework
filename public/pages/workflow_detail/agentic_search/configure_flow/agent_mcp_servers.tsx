/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiAccordion,
  EuiSpacer,
  EuiButtonIcon,
  EuiText,
  EuiFormRow,
  EuiSmallButtonEmpty,
  EuiPanel,
  EuiSelect,
  EuiTextArea,
} from '@elastic/eui';
import { Agent, MCPConnector } from '../../../../../common';
import { AppState } from '../../../../store';

interface AgentMCPServersProps {
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
}

const DEFAULT_MCP_SERVER = {
  mcp_connector_id: '',
  tool_filters: [],
} as MCPConnector;

export function AgentMCPServers({
  agentForm,
  setAgentForm,
}: AgentMCPServersProps) {
  const { connectors } = useSelector((state: AppState) => state.ml);
  const [connectorOptions, setConnectorOptions] = useState<
    { value: string; text: string }[]
  >([]);
  useEffect(() => {
    setConnectorOptions(
      Object.values(connectors || {}).map((connector) => ({
        value: connector.id,
        text: connector.name,
      }))
    );
  }, [connectors]);

  // Persist state for each search MCP server accordion. Only support one at a time
  const [openAccordionIndex, setOpenAccordionIndex] = useState<
    number | undefined
  >(undefined);

  const [mcpServers, setMcpServers] = useState<MCPConnector[]>([]);
  useEffect(() => {
    setMcpServers(getIn(agentForm, 'parameters.mcp_connectors', []));
  }, [agentForm?.parameters?.mcp_connectors]);

  function addMCPServer() {
    const updatedMCPServers = [...mcpServers, { ...DEFAULT_MCP_SERVER }];
    setAgentForm({
      ...agentForm,
      parameters: {
        ...agentForm?.parameters,
        mcp_connectors: updatedMCPServers,
      },
    });
    setOpenAccordionIndex(updatedMCPServers.length - 1);
  }

  function removeMCPServer(index: number) {
    const updatedMCPServers = mcpServers.filter(
      (_: MCPConnector, i: number) => i !== index
    );
    setAgentForm({
      ...agentForm,
      parameters: {
        ...agentForm?.parameters,
        mcp_connectors: updatedMCPServers,
      },
    });
  }

  function updateMCPServer(updatedMCPServer: MCPConnector, index: number) {
    const updatedMCPServers = [...mcpServers];
    updatedMCPServers[index] = updatedMCPServer;
    setAgentForm({
      ...agentForm,
      parameters: {
        ...agentForm?.parameters,
        mcp_connectors: updatedMCPServers,
      },
    });
  }

  return (
    <>
      <div>
        {mcpServers.map((server: MCPConnector, serverIndex: number) => (
          <div key={serverIndex} style={{ marginBottom: '8px' }}>
            <EuiPanel color="transparent" paddingSize="s">
              <EuiAccordion
                id={`mcp-server-${serverIndex}`}
                forceState={
                  openAccordionIndex === serverIndex ? 'open' : undefined
                }
                onToggle={(isOpen) => {
                  setOpenAccordionIndex(isOpen ? serverIndex : undefined);
                }}
                buttonContent={
                  <EuiText size="s">
                    {getIn(
                      connectors,
                      `${server.mcp_connector_id}.name`,
                      undefined
                    ) || `MCP Server ${serverIndex + 1}`}
                  </EuiText>
                }
                extraAction={
                  <EuiButtonIcon
                    aria-label="Remove MCP server"
                    iconType="trash"
                    color="danger"
                    onClick={(e: any) => {
                      e.stopPropagation(); // Prevent accordion toggle
                      removeMCPServer(serverIndex);
                    }}
                  />
                }
                paddingSize="s"
              >
                <EuiPanel color="subdued" paddingSize="s" hasBorder={false}>
                  <EuiFormRow label="MCP Server" fullWidth>
                    <EuiSelect
                      options={connectorOptions}
                      value={server.mcp_connector_id}
                      onChange={(e) => {
                        updateMCPServer(
                          {
                            ...DEFAULT_MCP_SERVER,
                            mcp_connector_id: e.target.value,
                          } as MCPConnector,
                          serverIndex
                        );
                      }}
                      placeholder="Select an MCP server"
                      fullWidth
                      compressed
                      hasNoInitialSelection={isEmpty(server.mcp_connector_id)}
                    />
                  </EuiFormRow>
                  <EuiSpacer size="s" />
                  <EuiFormRow label="Tool filters" fullWidth>
                    <EuiTextArea
                      value={server.tool_filters}
                      onChange={(e) => {
                        updateMCPServer(
                          {
                            ...DEFAULT_MCP_SERVER,
                            tool_filters: JSON.parse(e.target.value),
                          } as MCPConnector,
                          serverIndex
                        );
                      }}
                      placeholder="Enter tool filters"
                      fullWidth
                      compressed
                    />
                  </EuiFormRow>
                </EuiPanel>
              </EuiAccordion>
            </EuiPanel>
          </div>
        ))}
        <EuiSmallButtonEmpty
          style={{ marginLeft: '-8px' }}
          iconType="plusInCircle"
          onClick={addMCPServer}
          data-testid="addMCPServerButton"
        >
          Add MCP server
        </EuiSmallButtonEmpty>
      </div>
    </>
  );
}
