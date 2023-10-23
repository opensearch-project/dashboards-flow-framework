/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import {
  EuiInMemoryTable,
  Direction,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldSearch,
  EuiFilterSelectItem,
} from '@elastic/eui';
import { WORKFLOW_STATE, WorkflowLaunch } from '../../../../common';
import { columns } from './columns';
import { MultiSelectFilter } from '../../../general_components';
import { getStateOptions } from '../../../utils';

interface LaunchListProps {}

/**
 * The searchable list of launches for this particular workflow.
 */
export function LaunchList(props: LaunchListProps) {
  // TODO: finalize how we persist launches for a particular workflow.
  // We may just add UI metadata tags to group workflows under a single, overall "workflow"
  // const { workflows } = useSelector((state: AppState) => state.workflows);
  const workflowLaunches = [
    {
      id: 'Launch_1',
      state: WORKFLOW_STATE.IN_PROGRESS,
      lastUpdated: 12345678,
    },
    {
      id: 'Launch_2',
      state: WORKFLOW_STATE.FAILED,
      lastUpdated: 12345677,
    },
  ] as WorkflowLaunch[];

  // search bar state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debounceSearchQuery = debounce((query: string) => {
    setSearchQuery(query);
  }, 100);

  // filters state
  const [selectedStates, setSelectedStates] = useState<EuiFilterSelectItem[]>(
    getStateOptions()
  );
  const [filteredLaunches, setFilteredLaunches] = useState<WorkflowLaunch[]>(
    workflowLaunches
  );

  // When a filter selection or search query changes, update the filtered launches
  useEffect(() => {
    setFilteredLaunches(
      fetchFilteredLaunches(workflowLaunches, selectedStates, searchQuery)
    );
  }, [selectedStates, searchQuery]);

  const sorting = {
    sort: {
      field: 'id',
      direction: 'asc' as Direction,
    },
  };

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup direction="row" gutterSize="m">
          <EuiFlexItem grow={true}>
            <EuiFieldSearch
              fullWidth={true}
              placeholder="Search launches..."
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
        <EuiInMemoryTable<WorkflowLaunch>
          items={filteredLaunches}
          rowHeader="id"
          columns={columns}
          sorting={sorting}
          pagination={true}
          message={'No existing launches found'}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

// Collect the final launch list after applying all filters
function fetchFilteredLaunches(
  allLaunches: WorkflowLaunch[],
  stateFilters: EuiFilterSelectItem[],
  searchQuery: string
): WorkflowLaunch[] {
  // @ts-ignore
  const stateFilterStrings = stateFilters.map((filter) => filter.name);
  const filteredLaunches = allLaunches.filter((launch) =>
    stateFilterStrings.includes(launch.state)
  );
  return searchQuery.length === 0
    ? filteredLaunches
    : filteredLaunches.filter((launch) =>
        launch.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
}
