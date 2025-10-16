/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import { EuiSelect } from '@elastic/eui';
import { DEFAULT_MCP_SERVER, MCPConnector } from '../../../../../common';
import { AppState } from '../../../../store';
import { getIn } from 'formik';

interface MCPServerSelectorProps {
  allServers: MCPConnector[];
  serverIndex: number;
  updateMCPServer: (mcpServer: MCPConnector, index: number) => void;
}

export function MCPServerSelector(props: MCPServerSelectorProps) {
  const { connectors } = useSelector((state: AppState) => state.ml);
  const [connectorOptions, setConnectorOptions] = useState<
    { value: string; text: string }[]
  >([]);
  const server = getIn(
    props,
    `allServers.${props.serverIndex}`,
    DEFAULT_MCP_SERVER
  ) as MCPConnector;

  // Only show unchosen connectors in the dropdown, but still include the selected connector
  // for the particular MCP server, if applicable.
  useEffect(() => {
    if (!isEmpty(props.allServers)) {
      const otherSelectedConnectorIds = props.allServers
        ?.map((mcpConnector) => mcpConnector.mcp_connector_id)
        .filter(
          (connectorId) => connectorId !== server?.mcp_connector_id
        ) as string[];
      setConnectorOptions(
        Object.values(connectors || {})
          .filter(
            (connector) => !otherSelectedConnectorIds.includes(connector.id)
          )
          .map((connector) => ({
            value: connector.id,
            text: connector.name,
          }))
      );
    }
  }, [props.allServers]);

  return (
    <EuiSelect
      options={connectorOptions}
      value={server.mcp_connector_id}
      onChange={(e) => {
        // if changing the selection, clear out any tool filters.
        props.updateMCPServer(
          {
            ...DEFAULT_MCP_SERVER,
            mcp_connector_id: e.target.value,
          } as MCPConnector,
          props.serverIndex
        );
      }}
      fullWidth
      compressed
      hasNoInitialSelection={isEmpty(server.mcp_connector_id)}
    />
  );
}
