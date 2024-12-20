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
  searchConnectors,
} from '../../../store';
import { enrichPresetWorkflowWithUiMetadata } from './utils';
import { getDataSourceId, isDataSourceReady } from '../../../utils';
import { getDataSourceEnabled } from '../../../services';
import semver from 'semver';
import { DataSourceAttributes } from '../../../../../../src/plugins/data_source/common/data_sources';
import { getSavedObjectsClient } from '../../../../public/services';
import {
  WORKFLOW_TYPE,
  MIN_SUPPORTED_VERSION,
} from '../../../../common/constants';

interface NewWorkflowProps {}

export const getEffectiveVersion = async (
  dataSourceId: string | undefined
): Promise<string> => {
  // console.log('Checking data source enabled status...');
  // const dataSourceEnabled = getDataSourceEnabled().enabled;
  // console.log('Data source enabled:', dataSourceEnabled);

  // // If MDS is disabled, return a default version
  // if (!dataSourceEnabled) {
  //   console.log('MDS is disabled, returning latest version');
  //   return '2.19.0';
  // }

  try {
    if (dataSourceId === undefined) {
      console.log('cannot find data source');
      throw new Error('Data source is required');
    }

    const dataSource = await getSavedObjectsClient().get<DataSourceAttributes>(
      'data-source',
      dataSourceId
    );
    // const version =
    //   dataSource?.attributes?.dataSourceVersion || MIN_SUPPORTED_VERSION;
    // return version;
    return '2.19.0';
  } catch (error) {
    console.error('Error getting version:', error);
    return MIN_SUPPORTED_VERSION;
  }
};

const filterPresetsByVersion = async (
  workflows: WorkflowTemplate[],
  dataSourceId: string | undefined
): Promise<WorkflowTemplate[]> => {
  console.log('Initial workflows count:', workflows.length);
  // if MDS is disabled, skip the version check and assume it is version 2.19+
  const dataSourceEnabled = getDataSourceEnabled().enabled;
  console.log('MDS enabled:', dataSourceEnabled);
  if (!dataSourceEnabled) {
    console.log('MDS is disabled, returning all workflows');
    return workflows;
  }

  if (!dataSourceId) {
    return [];
  }

  const allowedPresetsFor217 = [
    WORKFLOW_TYPE.SEMANTIC_SEARCH,
    WORKFLOW_TYPE.MULTIMODAL_SEARCH,
    WORKFLOW_TYPE.HYBRID_SEARCH,
  ];

  try {
    const version = await getEffectiveVersion(dataSourceId);

    if (semver.lt(version, '2.17.0')) {
      return [];
    }

    if (semver.gte(version, '2.17.0') && semver.lt(version, '2.19.0')) {
      return workflows.filter((workflow) => {
        const workflowType =
          workflow.ui_metadata?.type ?? WORKFLOW_TYPE.UNKNOWN;
        return allowedPresetsFor217.includes(workflowType as WORKFLOW_TYPE);
      });
    }

    return workflows;
  } catch (error) {
    return workflows.filter((workflow) => {
      const workflowType = workflow.ui_metadata?.type ?? WORKFLOW_TYPE.UNKNOWN;
      return allowedPresetsFor217.includes(workflowType as WORKFLOW_TYPE);
    });
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
  const dataSourceEnabled = getDataSourceEnabled().enabled;

  console.log('Initial render:', { dataSourceId, dataSourceEnabled });

  // workflows state
  const { presetWorkflows, loading } = useSelector(
    (state: AppState) => state.presets
  );
  const [allWorkflows, setAllWorkflows] = useState<WorkflowTemplate[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<
    WorkflowTemplate[]
  >([]);
  const [isVersionLoading, setIsVersionLoading] = useState(false);

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
    if (isDataSourceReady(dataSourceId)) {
      dispatch(searchModels({ apiBody: FETCH_ALL_QUERY, dataSourceId }));
      dispatch(searchConnectors({ apiBody: FETCH_ALL_QUERY, dataSourceId }));
    }
  }, [dataSourceId, dataSourceEnabled]);

  useEffect(() => {
    console.log('State changed:', {
      loading,
      isVersionLoading,
      presetWorkflowsLength: presetWorkflows?.length,
      allWorkflowsLength: allWorkflows.length,
      filteredWorkflowsLength: filteredWorkflows.length,
    });
  }, [
    loading,
    isVersionLoading,
    presetWorkflows,
    allWorkflows,
    filteredWorkflows,
  ]);

  // initial hook to populate all workflows
  // enrich them with dynamically-generated UI flows based on use case
  useEffect(() => {
    const loadWorkflows = async () => {
      console.log('loadWorkflows called:', {
        hasPresetWorkflows: Boolean(presetWorkflows?.length),
        dataSourceId,
      });

      if (!presetWorkflows || presetWorkflows.length === 0) {
        console.log('No preset workflows, returning early');

        return;
      }

      const dataSourceEnabled = getDataSourceEnabled().enabled;
      console.log('MDS enabled:', dataSourceEnabled);

      if (!dataSourceEnabled) {
        console.log('MDS disabled, setting all workflows');

        const enrichedWorkflows = presetWorkflows.map((presetWorkflow) =>
          enrichPresetWorkflowWithUiMetadata(presetWorkflow, '2.19.0')
        );
        setAllWorkflows(enrichedWorkflows);
        setFilteredWorkflows(enrichedWorkflows);
        setIsVersionLoading(false);
        return;
      }

      if (!dataSourceId) {
        console.log('No datasource ID, clearing workflows and setting loading');

        setAllWorkflows([]);
        setFilteredWorkflows([]);
        setIsVersionLoading(true);
        return;
      }
      console.log('Starting version check');

      setIsVersionLoading(true);

      //   const version = await getEffectiveVersion(dataSourceId);
      //   const enrichedWorkflows = presetWorkflows.map((presetWorkflow) =>
      //     enrichPresetWorkflowWithUiMetadata(presetWorkflow, version)
      //   );

      //   const versionFilteredWorkflows = await filterPresetsByVersion(
      //     enrichedWorkflows,
      //     dataSourceId
      //   );

      //   setAllWorkflows(versionFilteredWorkflows);
      //   setFilteredWorkflows(versionFilteredWorkflows);
      // };
      try {
        const version = await getEffectiveVersion(dataSourceId);
        console.log('Got version:', version);

        const enrichedWorkflows = presetWorkflows.map((presetWorkflow) =>
          enrichPresetWorkflowWithUiMetadata(presetWorkflow, version)
        );

        const versionFilteredWorkflows = await filterPresetsByVersion(
          enrichedWorkflows,
          dataSourceId
        );
        console.log(
          'Setting filtered workflows:',
          versionFilteredWorkflows.length
        );

        setAllWorkflows(versionFilteredWorkflows);
        setFilteredWorkflows(versionFilteredWorkflows);
        setIsVersionLoading(false);
      } catch (error) {
        console.error('Error loading workflows:', error);
        setAllWorkflows([]);
        setFilteredWorkflows([]);
        if (dataSourceId) {
          setIsVersionLoading(false);
        }
      }
    };

    loadWorkflows();
  }, [presetWorkflows, dataSourceId, dataSourceEnabled]);

  console.log('Render - loading states:', { loading, isVersionLoading });

  // When search query updated, re-filter preset list
  useEffect(() => {
    setFilteredWorkflows(fetchFilteredWorkflows(allWorkflows, searchQuery));
  }, [searchQuery]);

  useEffect(() => {
    setFilteredWorkflows(allWorkflows);
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
        {loading || isVersionLoading ? (
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
