/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';
import semver from 'semver';
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
  EuiEmptyPrompt,
  EuiSpacer,
} from '@elastic/eui';
import { AppState } from '../../../store';
import {
  EMPTY_FIELD_STRING,
  MAX_WORKFLOW_NAME_TO_DISPLAY,
  MINIMUM_FULL_SUPPORTED_VERSION,
  UIState,
  WORKFLOW_TYPE,
  WORKFLOW_TYPE_LEGACY,
  Workflow,
  getCharacterLimitedString,
} from '../../../../common';
import { columns } from './columns';
import { MultiSelectFilter } from '../../../general_components';
import { WORKFLOWS_TAB } from '../workflows';
import { DeleteWorkflowModal } from './delete_workflow_modal';
import { ResourceList } from './resource_list';
import { isValidUiWorkflow } from '../../../utils';

interface WorkflowListProps {
  setSelectedTabId: (tabId: WORKFLOWS_TAB) => void;
  dataSourceVersion?: string;
}

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
  const { workflows, loading } = useSelector(
    (state: AppState) => state.workflows
  );

  // table filters. the list of filters depends on the datasource version, if applicable.
  const isPreV219 =
    props.dataSourceVersion !== undefined &&
    semver.lt(props.dataSourceVersion, MINIMUM_FULL_SUPPORTED_VERSION);
  const filterType = isPreV219 ? WORKFLOW_TYPE_LEGACY : WORKFLOW_TYPE;
  const filterOptions = Object.values(filterType).map((type) => {
    // @ts-ignore
    return {
      name: type,
      checked: 'on',
    } as EuiFilterSelectItem;
  });

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
        Object.values(workflows || {}),
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
              <h2>{`Resources configured for '${getCharacterLimitedString(
                selectedWorkflow.name,
                MAX_WORKFLOW_NAME_TO_DISPLAY
              )}'`}</h2>
            </EuiText>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            {!isValidUiWorkflow(selectedWorkflow) ||
              selectedWorkflow?.ui_metadata?.type === WORKFLOW_TYPE.UNKNOWN ? (
              <EuiEmptyPrompt
                title={<h2>Invalid workflow type</h2>}
                titleSize="s"
                body={
                  <>
                    <EuiText size="s">
                      Displaying resources from workflows of unknown type is not
                      currently supported.
                    </EuiText>
                  </>
                }
              />
            ) : (
              <ResourceList workflow={selectedWorkflow} />
            )}
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
      <EuiFlexGroup direction="column">
        <EuiSpacer size="m" />
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
          {loading ? (
            <EuiFlexGroup
              justifyContent="center"
              alignItems="center"
              style={{ minHeight: '400px' }}
            >
              <EuiFlexItem grow={false}>
                <EuiLoadingSpinner size="xl" />
              </EuiFlexItem>
            </EuiFlexGroup>
          ) : (
            <EuiInMemoryTable<Workflow>
              items={filteredWorkflows}
              rowHeader="name"
              // @ts-ignore
              columns={columns(tableActions)}
              sorting={sorting}
              pagination={true}
              hasActions={true}
            />
          )}
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
  // A common use case for API users is to create workflows to register agents for
  // things like chatbots. We specifically filter those out on the UI to prevent confusion.
  const allWorkflowsExceptRegisterAgent = allWorkflows.filter(
    (workflow) => workflow.use_case !== 'REGISTER_AGENT'
  );
  // If missing/invalid fields for each workflow, add defaults
  const allWorkflowsWithDefaults = allWorkflowsExceptRegisterAgent.map(
    (workflow) => ({
      ...workflow,
      description: workflow.description || EMPTY_FIELD_STRING,
      ui_metadata: {
        ...workflow.ui_metadata,
        type:
          workflow.ui_metadata?.type !== undefined &&
            Object.values(WORKFLOW_TYPE).includes(workflow.ui_metadata?.type)
            ? workflow.ui_metadata?.type
            : WORKFLOW_TYPE.UNKNOWN,
      } as UIState,
    })
  );
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
