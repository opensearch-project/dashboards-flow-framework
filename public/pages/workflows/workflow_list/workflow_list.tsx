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
  EuiCompressedFieldSearch,
  EuiLoadingSpinner,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiText,
  EuiFlyoutBody,
} from '@elastic/eui';
import { AppState } from '../../../store';
import {
  MAX_WORKFLOW_NAME_TO_DISPLAY,
  UIState,
  WORKFLOW_TYPE,
  Workflow,
  getCharacterLimitedString,
} from '../../../../common';
import { columns } from './columns';
import { MultiSelectFilter } from '../../../general_components';
import { WORKFLOWS_TAB } from '../workflows';
import { DeleteWorkflowModal } from './delete_workflow_modal';
import { ResourceList } from './resource_list';

interface WorkflowListProps {
  setSelectedTabId: (tabId: WORKFLOWS_TAB) => void;
}

const sorting = {
  sort: {
    field: 'name',
    direction: 'asc' as Direction,
  },
};

const filterOptions = Object.values(WORKFLOW_TYPE).map((type) => {
  // @ts-ignore
  return {
    name: type,
    checked: 'on',
  } as EuiFilterSelectItem;
});

/**
 * The searchable list of created workflows.
 */
export function WorkflowList(props: WorkflowListProps) {
  const { workflows, loading } = useSelector(
    (state: AppState) => state.workflows
  );

  // actions state
  const [selectedWorkflow, setSelectedWorkflow] = useState<
    Workflow | undefined
  >(undefined);

  // delete workflow state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  function clearDeleteState() {
    setSelectedWorkflow(undefined);
    setIsDeleteModalOpen(false);
  }

  // view workflow resources state
  const [isResourcesFlyoutOpen, setIsResourcesFlyoutOpen] = useState<boolean>(
    false
  );

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
      description: 'Delete',
      type: 'icon',
      icon: 'trash',
      color: 'danger',
      onClick: (item: Workflow) => {
        setSelectedWorkflow(item);
        setIsDeleteModalOpen(true);
      },
    },
    {
      name: 'View resources',
      description: 'View related resources',
      type: 'icon',
      icon: 'link',
      color: 'primary',
      onClick: (item: Workflow) => {
        setSelectedWorkflow(item);
        setIsResourcesFlyoutOpen(true);
      },
    },
  ];

  return (
    <>
      {isDeleteModalOpen && selectedWorkflow?.id !== undefined && (
        <DeleteWorkflowModal
          workflow={selectedWorkflow}
          clearDeleteState={clearDeleteState}
        />
      )}
      {isResourcesFlyoutOpen && selectedWorkflow && (
        <EuiFlyout
          ownFocus={true}
          onClose={() => setIsResourcesFlyoutOpen(false)}
        >
          <EuiFlyoutHeader hasBorder={true}>
            <EuiText size="m">
              <h2>{`Active resources with ${getCharacterLimitedString(
                selectedWorkflow.name,
                MAX_WORKFLOW_NAME_TO_DISPLAY
              )}`}</h2>
            </EuiText>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <ResourceList workflow={selectedWorkflow} />
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFlexGroup
            direction="row"
            style={{ marginLeft: '0px', paddingTop: '10px' }}
          >
            <EuiText color="subdued">{`Manage existing workflows`}</EuiText>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup direction="row" gutterSize="m">
            <EuiFlexItem grow={true}>
              <EuiCompressedFieldSearch
                fullWidth={true}
                placeholder="Search"
                onChange={(e) => debounceSearchQuery(e.target.value)}
              />
            </EuiFlexItem>
            <MultiSelectFilter
              filters={filterOptions}
              title="Type"
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
