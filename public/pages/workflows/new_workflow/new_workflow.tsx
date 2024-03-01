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
import { useDispatch } from 'react-redux';
import { UseCase } from './use_case';
import { getPresetWorkflows } from './presets';
import { Workflow } from '../../../../common';
import { cacheWorkflow } from '../../../store';

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
  // preset workflow state
  const presetWorkflows = getPresetWorkflows();
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>(
    getPresetWorkflows()
  );

  // search bar state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debounceSearchQuery = debounce((query: string) => {
    setSearchQuery(query);
  }, 200);

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
                        name: toSnakeCase(workflow.name),
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

// Utility fn to convert to snakecase. Used when caching the workflow
// to make a valid name and cause less friction if users decide
// to save it later on.
function toSnakeCase(text: string): string {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
}
