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
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiText,
} from '@elastic/eui';
import { AppState, deleteWorkflow, useAppDispatch } from '../../../store';
import { UIState, WORKFLOW_TYPE, Workflow } from '../../../../common';
import { columns } from './columns';
import {
  DeleteWorkflowModal,
  MultiSelectFilter,
  ResourceList,
} from '../../../general_components';
import { WORKFLOWS_TAB } from '../workflows';
import { getCore } from '../../../services';
import { getDataSourceId } from '../../../utils/utils';

interface WorkflowListProps {
  setSelectedTabId: (tabId: WORKFLOWS_TAB) => void;
}

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
  const dataSourceId = getDataSourceId();
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
          onClose={() => {
            clearDeleteState();
          }}
          onConfirm={async () => {
            clearDeleteState();
            await dispatch(
              deleteWorkflow({
                workflowId: selectedWorkflow.id as string,
                dataSourceId,
              })
            )
              .unwrap()
              .then((result) => {
                getCore().notifications.toasts.addSuccess(
                  `Successfully deleted ${selectedWorkflow.name}`
                );
              })
              .catch((err: any) => {
                getCore().notifications.toasts.addDanger(
                  `Failed to delete ${selectedWorkflow.name}`
                );
                console.error(
                  `Failed to delete ${selectedWorkflow.name}: ${err}`
                );
              });
          }}
        />
      )}
      {isResourcesFlyoutOpen && selectedWorkflow && (
        <EuiFlyout
          ownFocus={true}
          onClose={() => setIsResourcesFlyoutOpen(false)}
        >
          <EuiFlyoutHeader hasBorder={true}>
            <EuiTitle size="m">
              <h2>{`Active resources with ${selectedWorkflow.name}`}</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <ResourceList workflow={selectedWorkflow} />
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFlexGroup direction="row" style={{ marginLeft: '0px' }}>
            <EuiText color="subdued">{`Manage existing workflows`}</EuiText>
          </EuiFlexGroup>
        </EuiFlexItem>
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
