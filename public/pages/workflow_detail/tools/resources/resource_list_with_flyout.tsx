/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Direction,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiInMemoryTable,
  EuiTitle,
  EuiIcon,
  EuiText,
} from '@elastic/eui';
import {
  Workflow,
  WorkflowResource,
  customStringify,
} from '../../../../../common';
import { fetchResourceData } from '../../../workflows/workflow_list/resource_list';
import { useAppDispatch } from '../../../../store';
import { getDataSourceId } from '../../../../utils';
import { columns } from './columns';

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

  // Hook to initialize all resources. Reduce to unique IDs, since
  // the backend resources may include the same resource multiple times
  // (e.g., register and deploy steps persist the same model ID resource)
  useEffect(() => {
    if (props.workflow?.resourcesCreated) {
      const resourcesMap = {} as { [id: string]: WorkflowResource };
      props.workflow.resourcesCreated.forEach((resource) => {
        resourcesMap[resource.id] = resource;
      });
      setAllResources(Object.values(resourcesMap));
    }
  }, [props.workflow?.resourcesCreated]);

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
    try {
      const result = await fetchResourceData(row, dataSourceId!, dispatch);
      setResourceDetails(customStringify(result));
    } catch (error) {
      console.error('Failed to fetch resource data:', error);
      setResourceDetails('Error fetching resource data.');
    }
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
        <EuiFlyout onClose={closeFlyout}>
          <EuiFlyoutHeader>
            <EuiTitle>
              <h2>{selectedRowData?.id}</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiFlexGroup direction="column" gutterSize="xs">
              <EuiFlexItem grow={true} style={{ paddingLeft: '20px' }}>
                <EuiText size="m">
                  <h4>Resource details</h4>
                </EuiText>
              </EuiFlexItem>

              <EuiFlexItem grow={true}>
                <EuiCodeBlock
                  language="json"
                  fontSize="m"
                  isCopyable={true}
                  overflowHeight={680}
                >
                  {resourceDetails || 'Loading...'}
                </EuiCodeBlock>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </>
  );
}