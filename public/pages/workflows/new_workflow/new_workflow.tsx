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
import { useDispatch, useSelector } from 'react-redux';
import { UseCase } from './use_case';
import {
  DEFAULT_NEW_WORKFLOW_NAME,
  START_FROM_SCRATCH_WORKFLOW_NAME,
  Workflow,
} from '../../../../common';
import { AppState, cacheWorkflow } from '../../../store';
import { getWorkflowPresets } from '../../../store/reducers';

interface NewWorkflowProps {}

/**
 * TODO: may rename this later on.
 *
 * Contains the searchable library of templated workflows based
 * on a variety of use cases. Can click on them to load in a pre-configured
 * workflow for users to start with.
 */
export function NewWorkflow(props: NewWorkflowProps) {
  const dispatch = useDispatch();
  const { presetWorkflows } = useSelector((state: AppState) => state.presets);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);

  // search bar state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debounceSearchQuery = debounce((query: string) => {
    setSearchQuery(query);
  }, 200);

  // initial state
  useEffect(() => {
    dispatch(getWorkflowPresets());
  }, []);

  useEffect(() => {
    setFilteredWorkflows(presetWorkflows);
  }, [presetWorkflows]);

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
          {filteredWorkflows.map((workflow: Workflow, index) => {
            return (
              <EuiFlexItem key={index}>
                <UseCase
                  title={workflow.name}
                  description={workflow.description || ''}
                  onClick={() =>
                    dispatch(
                      cacheWorkflow({
                        ...workflow,
                        name: processWorkflowName(workflow.name),
                      })
                    )
                  }
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

// Utility fn to process workflow names from their presentable/readable titles
// on the UI, to a valid name format.
// This leads to less friction if users decide to save the name later on.
function processWorkflowName(workflowName: string): string {
  return workflowName === START_FROM_SCRATCH_WORKFLOW_NAME
    ? DEFAULT_NEW_WORKFLOW_NAME
    : toSnakeCase(workflowName);
}

function toSnakeCase(text: string): string {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
}
