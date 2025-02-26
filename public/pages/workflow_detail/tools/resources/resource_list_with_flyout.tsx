/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Direction,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiIcon,
} from '@elastic/eui';
import {
  Workflow,
  WorkflowResource,
  customStringify,
} from '../../../../../common';
import {
  AppState,
  useAppDispatch,
  getIndex,
  getIngestPipeline,
  getSearchPipeline,
} from '../../../../store';
import {
  extractIdsByStepType,
  getDataSourceId,
  getErrorMessageForStepType,
} from '../../../../utils';
import { columns } from './columns';
import { ResourceFlyout } from './resource_flyout';

interface ResourceListFlyoutProps {
  workflow?: Workflow;
}

/**
 * The searchable list of resources for a particular workflow.
 */
export function ResourceListWithFlyout(props: ResourceListFlyoutProps) {
  const [allResources, setAllResources] = useState<WorkflowResource[]>([]);
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const [resourceDetails, setResourceDetails] = useState<string | null>(null);
  const [rowErrorMessage, setRowErrorMessage] = useState<string | null>(null);
  const {
    loading,
    getIndexErrorMessage,
    getIngestPipelineErrorMessage,
    getSearchPipelineErrorMessage,
    indexDetails,
    ingestPipelineDetails,
    searchPipelineDetails,
  } = useSelector((state: AppState) => state.opensearch);

  // Hook to initialize all resources. Reduce to unique IDs, since
  // the backend resources may include the same resource multiple times
  // (e.g., register and deploy steps persist the same model ID resource)
  useEffect(() => {
    if (props.workflow?.resourcesCreated) {
      const resourcesMap = {} as { [id: string]: WorkflowResource };
      props.workflow.resourcesCreated.forEach((resource) => {
        resourcesMap[resource.id] = resource;
      });
      setAllResources(Object.values(resourcesMap || {}));
    }
  }, [props.workflow?.resourcesCreated]);

  useEffect(() => {
    const {
      indexIds,
      ingestPipelineIds,
      searchPipelineIds,
    } = extractIdsByStepType(allResources);

    if (indexIds) {
      try {
        dispatch(getIndex({ index: indexIds, dataSourceId }));
      } catch {}
    }

    if (ingestPipelineIds) {
      try {
        dispatch(
          getIngestPipeline({ pipelineId: ingestPipelineIds, dataSourceId })
        );
      } catch {}
    }

    if (searchPipelineIds) {
      try {
        dispatch(
          getSearchPipeline({ pipelineId: searchPipelineIds, dataSourceId })
        );
      } catch {}
    }
  }, [allResources]);

  const sorting = {
    sort: {
      field: 'id',
      direction: 'asc' as Direction,
    },
  };

  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<
    WorkflowResource | undefined
  >(undefined);

  // Opens the flyout and fetches resource details for the selected row.
  const openFlyout = async (row: WorkflowResource) => {
    setSelectedRowData(row);
    setIsFlyoutVisible(true);
    const value =
      indexDetails[row.id] ??
      ingestPipelineDetails[row.id] ??
      searchPipelineDetails[row.id] ??
      '';
    setResourceDetails(customStringify({ [row.id]: value }));
    const resourceDetailsErrorMessage = getErrorMessageForStepType(
      row.stepType,
      getIndexErrorMessage,
      getIngestPipelineErrorMessage,
      getSearchPipelineErrorMessage
    );
    setRowErrorMessage(resourceDetailsErrorMessage);
  };

  // Closes the flyout and resets the selected resource data.
  const closeFlyout = () => {
    setIsFlyoutVisible(false);
    setSelectedRowData(undefined);
    setResourceDetails(null);
  };

  return (
    <>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiInMemoryTable<WorkflowResource>
            items={allResources}
            rowHeader="id"
            columns={[
              ...columns,
              {
                name: 'Actions',
                width: '20%',

                render: (row: WorkflowResource) => (
                  <EuiIcon
                    onClick={() => openFlyout(row)}
                    type="inspect"
                    size="m"
                    style={{ cursor: 'pointer' }}
                  />
                ),
              },
            ]}
            sorting={sorting}
            pagination={true}
            message={'No existing resources found'}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      {isFlyoutVisible && (
        <ResourceFlyout
          resourceName={selectedRowData?.id || ''}
          resourceDetails={resourceDetails || ''}
          onClose={closeFlyout}
          loading={loading}
          errorMessage={rowErrorMessage || undefined}
        />
      )}
    </>
  );
}
