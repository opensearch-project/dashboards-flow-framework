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
  EuiLoadingSpinner,
} from '@elastic/eui';
import { AppState, deleteWorkflow, useAppDispatch } from '../../../store';
import { UIState, WORKFLOW_TYPE, Workflow } from '../../../../common';
import { columns } from './columns';
import {
  DeleteWorkflowModal,
  MultiSelectFilter,
} from '../../../general_components';

interface WorkflowListProps {}

const sorting = {
  sort: {
    field: 'name',
    direction: 'asc' as Direction,
  },
};

const filterOptions = [
  // @ts-ignore
  {
    name: WORKFLOW_TYPE.SEMANTIC_SEARCH,
    checked: 'on',
  } as EuiFilterSelectItem,
  // @ts-ignore
  {
    name: WORKFLOW_TYPE.CUSTOM,
    checked: 'on',
  } as EuiFilterSelectItem,
  // @ts-ignore
  {
    name: WORKFLOW_TYPE.UNKNOWN,
    checked: 'on',
  } as EuiFilterSelectItem,
];

/**
 * The searchable list of created workflows.
 */
export function WorkflowList(props: WorkflowListProps) {
  const dispatch = useAppDispatch();
  const { workflows, loading } = useSelector(
    (state: AppState) => state.workflows
  );

  // delete workflow state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<
    Workflow | undefined
  >(undefined);
  function clearDeleteState() {
    setWorkflowToDelete(undefined);
    setIsDeleteModalOpen(false);
  }

  // search bar state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debounceSearchQuery = debounce((query: string) => {
    setSearchQuery(query);
  }, 200);

  // filters state
  const [selectedTypes, setSelectedTypes] = useState<EuiFilterSelectItem[]>(
    filterOptions
  );
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);

  // When any filter changes or new workflows are found, update the list
  useEffect(() => {
    setFilteredWorkflows(
      fetchFilteredWorkflows(
        Object.values(workflows),
        selectedTypes,
        searchQuery
      )
    );
  }, [selectedTypes, searchQuery, workflows]);

  const tableActions = [
    {
      name: 'Delete',
      description: 'Delete this workflow',
      type: 'icon',
      icon: 'trash',
      color: 'danger',
      onClick: (item: Workflow) => {
        setWorkflowToDelete(item);
        setIsDeleteModalOpen(true);
      },
    },
  ];

  return (
    <>
      {isDeleteModalOpen && workflowToDelete?.id !== undefined && (
        <DeleteWorkflowModal
          workflow={workflowToDelete}
          onClose={() => {
            clearDeleteState();
          }}
          onConfirm={() => {
            dispatch(deleteWorkflow(workflowToDelete.id as string));
            clearDeleteState();
          }}
        />
      )}
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFlexGroup direction="row" gutterSize="m">
            <EuiFlexItem grow={true}>
              <EuiFieldSearch
                fullWidth={true}
                placeholder="Search"
                onChange={(e) => debounceSearchQuery(e.target.value)}
              />
            </EuiFlexItem>
            <MultiSelectFilter
              filters={filterOptions}
              title="Status"
              setSelectedFilters={setSelectedTypes}
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
            message={loading === true ? <EuiLoadingSpinner size="xl" /> : null}
            hasActions={true}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}

// Collect the final workflow list after applying all filters
function fetchFilteredWorkflows(
  allWorkflows: Workflow[],
  typeFilters: EuiFilterSelectItem[],
  searchQuery: string
): Workflow[] {
  // If missing/invalid ui metadata, add defaults
  const allWorkflowsWithDefaults = allWorkflows.map((workflow) => ({
    ...workflow,
    ui_metadata: {
      ...workflow.ui_metadata,
      type: workflow.ui_metadata?.type || WORKFLOW_TYPE.UNKNOWN,
    } as UIState,
  }));
  // @ts-ignore
  const typeFilterStrings = typeFilters.map((filter) => filter.name);
  const filteredWorkflows = allWorkflowsWithDefaults.filter((workflow) =>
    typeFilterStrings.includes(workflow.ui_metadata?.type)
  );
  return searchQuery.length === 0
    ? filteredWorkflows
    : filteredWorkflows.filter((workflow) =>
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
}
