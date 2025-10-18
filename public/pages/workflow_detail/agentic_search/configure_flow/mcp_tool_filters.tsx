/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EuiComboBox } from '@elastic/eui';
import { MCPConnector } from '../../../../../common';

interface MCPToolFiltersProps {
  mcpServer: MCPConnector;
  index: number;
  updateMCPServer: (mcpServer: MCPConnector, index: number) => void;
}

export function MCPToolFilters(props: MCPToolFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  useEffect(() => {
    setSelectedFilters(props.mcpServer?.tool_filters ?? []);
  }, [props.mcpServer]);

  function handleOptionsChange(updatedFilters: string[]): void {
    props.updateMCPServer(
      {
        ...props.mcpServer,
        tool_filters: updatedFilters,
      },
      props.index
    );
  }

  return (
    <EuiComboBox
      noSuggestions
      compressed
      placeholder="Create some filters"
      selectedOptions={selectedFilters.map((selectedFilter) => {
        return {
          label: selectedFilter,
          value: selectedFilter,
        };
      })}
      onChange={(options) => {
        handleOptionsChange(options.map((option) => option.value) as string[]);
      }}
      onCreateOption={(newFilter) =>
        handleOptionsChange([...selectedFilters, newFilter])
      }
      isClearable={true}
      isDisabled={false}
      fullWidth
      data-testid="toolFiltersComboBox"
    />
  );
}
