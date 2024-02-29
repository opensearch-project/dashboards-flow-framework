/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import {
  EuiInMemoryTable,
  Direction,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFilterSelectItem,
  EuiFieldSearch,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { AppState, deleteWorkflow } from '../../../store';
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
  const dispatch = useDispatch();
  const { workflows, loading } = useSelector(
    (state: AppState) => state.workflows
  );

  // search bar state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debounceSearchQuery = debounce((query: string) => {
    setSearchQuery(query);
  }, 200);

  // filters state
  const [selectedStates, setSelectedStates] = useState<EuiFilterSelectItem[]>(
    getStateOptions()
  );
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);

  // When any filter changes or new workflows are found, update the list
  useEffect(() => {
    setFilteredWorkflows(
      fetchFilteredWorkflows(
        Object.values(workflows),
        selectedStates,
        searchQuery
      )
    );
  }, [selectedStates, searchQuery, workflows]);

  const tableActions = [
    {
      name: 'Delete',
      description: 'Delete this workflow',
      type: 'icon',
      icon: 'trash',
      color: 'danger',
      onClick: (item: Workflow) => {
        dispatch(deleteWorkflow(item.id));
      },
    },
  ];

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
          // @ts-ignore
          columns={columns(tableActions)}
          sorting={sorting}
          pagination={true}
          message={
            loading === true ? (
              <EuiLoadingSpinner size="xl" />
            ) : (
              'No existing workflows found'
            )
          }
          hasActions={true}
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
