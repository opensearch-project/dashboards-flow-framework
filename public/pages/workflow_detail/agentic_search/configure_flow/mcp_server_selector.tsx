/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import { EuiCallOut, EuiSelect } from '@elastic/eui';
import {
  CONNECTOR_PROTOCOL,
  DEFAULT_MCP_SERVER,
  MCPConnector,
} from '../../../../../common';
import { AppState } from '../../../../store';
import { getIn } from 'formik';

interface MCPServerSelectorProps {
  allServers: MCPConnector[];
  serverIndex: number;
  updateMCPServer: (mcpServer: MCPConnector, index: number) => void;
}

export function MCPServerSelector(props: MCPServerSelectorProps) {
  const { connectors } = useSelector((state: AppState) => state.ml);
  const server = getIn(
    props,
    `allServers.${props.serverIndex}`,
    DEFAULT_MCP_SERVER
  ) as MCPConnector;

  // Only show unchosen connectors in the dropdown, but still include the selected connector
  // for the particular MCP server, if applicable.
  const connectorOptions = useMemo(() => {
    if (!isEmpty(props.allServers)) {
      const otherSelectedConnectorIds = props.allServers
        ?.map((mcpConnector) => mcpConnector.mcp_connector_id)
        .filter(
          (connectorId) => connectorId !== server?.mcp_connector_id
        ) as string[];
      return Object.values(connectors || {})
        .filter(
          // pre-filter to only MCP connectors
          (connector) =>
            [
              CONNECTOR_PROTOCOL.MCP_SSE,
              CONNECTOR_PROTOCOL.MCP_STREAMABLE_HTTP,
            ].includes(connector.protocol)
        )
        .filter(
          (connector) => !otherSelectedConnectorIds.includes(connector.id)
        )
        .map((connector) => ({
          value: connector.id,
          text: connector.name,
        }));
    } else {
      return [];
    }
  }, [props.allServers]);

  return (
    <>
      {connectorOptions.length > 0 ? (
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
          hasNoInitialSelection={!server?.mcp_connector_id}
        />
      ) : (
        <EuiCallOut size="s" color="warning" iconType={'alert'}>
          {props.allServers.length === 1
            ? 'No MCP connectors found'
            : 'No more MCP connectors found'}
        </EuiCallOut>
      )}
    </>
  );
}
