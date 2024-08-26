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
  EuiCompressedFieldSearch,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { useSelector } from 'react-redux';
import { UseCase } from './use_case';
import {
  FETCH_ALL_QUERY,
  Workflow,
  WorkflowTemplate,
} from '../../../../common';
import {
  AppState,
  useAppDispatch,
  getWorkflowPresets,
  searchModels,
} from '../../../store';
import { enrichPresetWorkflowWithUiMetadata } from './utils';
import { getDataSourceId } from '../../../utils';

interface NewWorkflowProps {}

/**
 * Contains the searchable library of templated workflows based
 * on a variety of use cases. Can click on them to load in a pre-configured
 * workflow for users to start with.
 */
export function NewWorkflow(props: NewWorkflowProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();

  // workflows state
  const { presetWorkflows, loading } = useSelector(
    (state: AppState) => state.presets
  );
  const [allWorkflows, setAllWorkflows] = useState<WorkflowTemplate[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<
    WorkflowTemplate[]
  >([]);

  // search bar state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debounceSearchQuery = debounce((query: string) => {
    setSearchQuery(query);
  }, 200);

  // on initial load:
  // 1. fetch the workflow presets persisted on server-side
  // 2. fetch the ML models. these may be used in quick-create views when selecting a preset,
  //    so we optimize by fetching once at the top-level here.
  useEffect(() => {
    dispatch(getWorkflowPresets());
    dispatch(searchModels({ apiBody: FETCH_ALL_QUERY, dataSourceId }));
  }, []);

  // initial hook to populate all workflows
  // enrich them with dynamically-generated UI flows based on use case
  useEffect(() => {
    if (presetWorkflows) {
      setAllWorkflows(
        presetWorkflows.map((presetWorkflow) =>
          enrichPresetWorkflowWithUiMetadata(presetWorkflow)
        )
      );
    }
  }, [presetWorkflows]);

  // initial hook to populate filtered workflows
  useEffect(() => {
    setFilteredWorkflows(allWorkflows);
  }, [allWorkflows]);

  // When search query updated, re-filter preset list
  useEffect(() => {
    setFilteredWorkflows(fetchFilteredWorkflows(allWorkflows, searchQuery));
  }, [searchQuery]);

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={true}>
        <EuiCompressedFieldSearch
          fullWidth={true}
          placeholder="Search"
          onChange={(e) => debounceSearchQuery(e.target.value)}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        {loading ? (
          <EuiLoadingSpinner size="xl" />
        ) : (
          <EuiFlexGrid columns={3} gutterSize="l">
            {filteredWorkflows.map((workflow: Workflow, index) => {
              return (
                <EuiFlexItem key={index}>
                  <UseCase workflow={workflow} />
                </EuiFlexItem>
              );
            })}
          </EuiFlexGrid>
        )}
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
