/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataSourceAttributes } from '../../../../../../src/plugins/data_source/common/data_sources';
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
  searchConnectors,
} from '../../../store';
import { enrichPresetWorkflowWithUiMetadata } from './utils';
import { getDataSourceId } from '../../../utils';
import { getSavedObjectsClient } from '../../../services';
import semver from 'semver';

interface NewWorkflowProps {}

export const getEffectiveVersion = async (
  dataSourceId: string | undefined
): Promise<string> => {
  try {
    // Don't make the API call if no dataSourceId
    if (dataSourceId === undefined) {
      return '2.17.0';
    }

    const dataSource = await getSavedObjectsClient().get<DataSourceAttributes>(
      'data-source',
      dataSourceId
    );
    const version = dataSource?.attributes?.dataSourceVersion || '2.17.0';

    // We use backend 2.18 for now and set it to be 2.19 for frontend logic
    if (version === '2.17.0') {
      return '2.17.0';
    } else {
      return '2.19.0';
    }
  } catch (error) {
    console.error('Error getting version:', error);
    return '2.17.0';
  }
};

const filterWorkflowsByVersion = async (
  workflows: WorkflowTemplate[],
  dataSourceId: string
): Promise<WorkflowTemplate[]> => {
  const allowedPresetsFor217 = [
    'Semantic Search',
    'Multimodal Search',
    'Hybrid Search',
  ];

  try {
    const version = await getEffectiveVersion(dataSourceId);

    if (semver.gte(version, '2.19.0')) {
      return workflows;
    }

    return workflows.filter((workflow) =>
      allowedPresetsFor217.includes(workflow.name)
    );
  } catch (error) {
    // Default to showing only allowed presets if version check fails
    return workflows.filter((workflow) =>
      allowedPresetsFor217.includes(workflow.name)
    );
  }
};

/**
 * Contains the searchable library of templated workflows based
 * on a variety of use cases. Can click on them to load in a pre-configured
 * workflow for users to start with.
 */
export function NewWorkflow(props: NewWorkflowProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
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
  // 2. fetch the ML models and connectors. these may be used in quick-create views when selecting a preset,
  //    so we optimize by fetching once at the top-level here.
  useEffect(() => {
    dispatch(getWorkflowPresets());
    dispatch(searchModels({ apiBody: FETCH_ALL_QUERY, dataSourceId }));
    dispatch(searchConnectors({ apiBody: FETCH_ALL_QUERY, dataSourceId }));
  }, []);

  useEffect(() => {
    const loadWorkflows = async () => {
      if (presetWorkflows) {
        const version = await getEffectiveVersion(dataSourceId);
        const enrichedWorkflows = presetWorkflows.map((presetWorkflow) =>
          enrichPresetWorkflowWithUiMetadata(presetWorkflow, version)
        );

        const versionFilteredWorkflows = await filterWorkflowsByVersion(
          enrichedWorkflows,
          dataSourceId!
        );

        setAllWorkflows(versionFilteredWorkflows);
      }
    };

    loadWorkflows();
  }, [presetWorkflows, dataSourceId]);

  // When search query updated, re-filter preset list
  useEffect(() => {
    setFilteredWorkflows(fetchFilteredWorkflows(allWorkflows, searchQuery));
    console.log('filteredWorkflows:', filteredWorkflows);
  }, [searchQuery]);

  useEffect(() => {
    setFilteredWorkflows(allWorkflows);
    return () => {
      console.log('filteredWorkflows:', filteredWorkflows);
    };
  }, [allWorkflows]);

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
