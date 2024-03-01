/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import {
  EuiFlexItem,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFieldSearch,
} from '@elastic/eui';

import { UseCase } from './use_case';
import { getPresetWorkflows } from './presets';
import { Workflow } from '../../../../common';

interface NewWorkflowProps {}

/**
 * TODO: may rename this later on.
 *
 * Contains the searchable library of templated workflows based
 * on a variety of use cases. Can click on them to load in a pre-configured
 * workflow for users to start with.
 */
export function NewWorkflow(props: NewWorkflowProps) {
  // preset workflow state
  const presetWorkflows = getPresetWorkflows();
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>(
    getPresetWorkflows()
  );

  // search bar state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debounceSearchQuery = debounce((query: string) => {
    setSearchQuery(query);
  }, 200);

  // When search query updated, re-filter preset list
  useEffect(() => {
    setFilteredWorkflows(fetchFilteredWorkflows(presetWorkflows, searchQuery));
  }, [searchQuery]);

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={true}>
        <EuiFieldSearch
          fullWidth={true}
          placeholder="Search"
          onChange={(e) => debounceSearchQuery(e.target.value)}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGrid columns={3} gutterSize="l">
          {filteredWorkflows.map((workflow: Workflow) => {
            return (
              <EuiFlexItem>
                <UseCase
                  title={workflow.name}
                  description={workflow.description || ''}
                />
              </EuiFlexItem>
            );
          })}
        </EuiFlexGrid>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

// Collect the final preset workflow list after applying all filters
function fetchFilteredWorkflows(
  allWorkflows: Workflow[],
  searchQuery: string
): Workflow[] {
  return searchQuery.length === 0
    ? allWorkflows
    : allWorkflows.filter((workflow) =>
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
}
