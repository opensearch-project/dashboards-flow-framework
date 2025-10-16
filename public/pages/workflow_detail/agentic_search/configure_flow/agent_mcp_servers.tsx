/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn } from 'formik';
import {
  EuiAccordion,
  EuiSpacer,
  EuiButtonIcon,
  EuiText,
  EuiFormRow,
  EuiSmallButtonEmpty,
  EuiPanel,
  EuiToolTip,
  EuiIcon,
  EuiLink,
} from '@elastic/eui';
import {
  Agent,
  DEFAULT_MCP_SERVER,
  MCP_AGENT_CONFIG_DOCS_LINK,
  MCPConnector,
} from '../../../../../common';
import { AppState } from '../../../../store';
import { MCPToolFilters } from './mcp_tool_filters';
import { MCPServerSelector } from './mcp_server_selector';

interface AgentMCPServersProps {
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
}

export function AgentMCPServers({
  agentForm,
  setAgentForm,
}: AgentMCPServersProps) {
  const { connectors } = useSelector((state: AppState) => state.ml);

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
              <EuiFormRow label="MCP Server" fullWidth>
                <MCPServerSelector
                  allServers={mcpServers}
                  serverIndex={serverIndex}
                  updateMCPServer={updateMCPServer}
                />
              </EuiFormRow>
              <EuiSpacer size="s" />
              <EuiFormRow
                label={
                  <>
                    Tool filters
                    <EuiToolTip content="Define regular expressions that specify which tools from the MCP server to make available to the agent. If omitted, all tools exposed by the connector will be available.">
                      <EuiIcon
                        type="questionInCircle"
                        color="subdued"
                        style={{ marginLeft: '4px' }}
                      />
                    </EuiToolTip>
                  </>
                }
                labelAppend={
                  <EuiText size="xs">
                    <EuiLink href={MCP_AGENT_CONFIG_DOCS_LINK} target="_blank">
                      Learn more
                    </EuiLink>
                  </EuiText>
                }
                fullWidth
              >
                <MCPToolFilters
                  mcpServer={server}
                  index={serverIndex}
                  updateMCPServer={updateMCPServer}
                />
              </EuiFormRow>
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
  );
}
