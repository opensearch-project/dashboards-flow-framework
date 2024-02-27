/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';
import {
  EuiInMemoryTable,
  Direction,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFilterSelectItem,
  EuiFieldSearch,
} from '@elastic/eui';
import { AppState } from '../../../store';
import { Workflow } from '../../../../common';
import { columns } from './columns';
import { MultiSelectFilter } from '../../../general_components';
import { getStateOptions } from '../../../utils';

interface WorkflowListProps {}

const sorting = {
  sort: {
    field: 'name',
    direction: 'asc' as Direction,
  },
};

/**
 * The searchable list of created workflows.
 */
export function WorkflowList(props: WorkflowListProps) {
  const { workflows } = useSelector((state: AppState) => state.workflows);
  const workflowsAsList = Object.values(workflows);

  // search bar state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debounceSearchQuery = debounce((query: string) => {
    setSearchQuery(query);
  }, 100);

  // filters state
  const [selectedStates, setSelectedStates] = useState<EuiFilterSelectItem[]>(
    getStateOptions()
  );
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>(
    workflowsAsList || []
  );

  // When a filter selection or search query changes, update the list
  useEffect(() => {
    setFilteredWorkflows(
      fetchFilteredWorkflows(workflowsAsList, selectedStates, searchQuery)
    );
  }, [selectedStates, searchQuery]);

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup direction="row" gutterSize="m">
          <EuiFlexItem grow={true}>
            <EuiFieldSearch
              fullWidth={true}
              placeholder="Search workflows..."
              onChange={(e) => debounceSearchQuery(e.target.value)}
            />
          </EuiFlexItem>
          <MultiSelectFilter
            filters={getStateOptions()}
            title="Status"
            setSelectedFilters={setSelectedStates}
          />
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiInMemoryTable<Workflow>
          items={filteredWorkflows}
          rowHeader="name"
          columns={columns}
          sorting={sorting}
          pagination={true}
          message={'No existing workflows found'}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

// Collect the final workflow list after applying all filters
function fetchFilteredWorkflows(
  allWorkflows: Workflow[],
  stateFilters: EuiFilterSelectItem[],
  searchQuery: string
): Workflow[] {
  // @ts-ignore
  const stateFilterStrings = stateFilters.map((filter) => filter.name);
  const filteredWorkflows = allWorkflows.filter((workflow) =>
    stateFilterStrings.includes(workflow.state)
  );
  return searchQuery.length === 0
    ? filteredWorkflows
    : filteredWorkflows.filter((workflow) =>
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
}
