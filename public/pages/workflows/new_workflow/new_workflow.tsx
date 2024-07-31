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
  EuiLoadingSpinner,
} from '@elastic/eui';
import { useSelector } from 'react-redux';
import { UseCase } from './use_case';
import { Workflow, WorkflowTemplate } from '../../../../common';
import { AppState, useAppDispatch, getWorkflowPresets } from '../../../store';
import { enrichPresetWorkflowWithUiMetadata } from './utils';
import { useLocation } from 'react-router-dom';
import { getDataSourceFromURL } from '../../../utils/helpers';

interface NewWorkflowProps {}

/**
 * Contains the searchable library of templated workflows based
 * on a variety of use cases. Can click on them to load in a pre-configured
 * workflow for users to start with.
 */
export function NewWorkflow(props: NewWorkflowProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const MDSQueryParams = getDataSourceFromURL(location);
  const dataSourceId = MDSQueryParams.dataSourceId;

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

  // initial state
  useEffect(() => {
    dispatch(getWorkflowPresets({dataSourceId:dataSourceId}));
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
        <EuiFieldSearch
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
