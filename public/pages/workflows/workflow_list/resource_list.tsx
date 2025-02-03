/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { columns } from '../../workflow_detail/tools/resources/columns';
import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiBasicTable,
  EuiButtonIcon,
  RIGHT_ALIGNMENT,
  EuiText,
  Direction,
  EuiEmptyPrompt,
  EuiLoadingSpinner,
} from '@elastic/eui';
import {
  Workflow,
  WorkflowResource,
  customStringify,
} from '../../../../common';
import {
  AppState,
  getIndex,
  getIngestPipeline,
  getSearchPipeline,
  useAppDispatch,
} from '../../../store';
import {
  extractIdsByStepType,
  getDataSourceId,
  getErrorMessageForStepType,
} from '../../../utils';
import { useSelector } from 'react-redux';

interface ResourceListProps {
  workflow?: Workflow;
}

/**
 * The searchable list of resources for a particular workflow.
 */
export function ResourceList(props: ResourceListProps) {
  const [allResources, setAllResources] = useState<WorkflowResource[]>([]);
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState<{
    [key: string]: any;
  }>({});
  const {
    loading,
    getIndexErrorMessage,
    getIngestPipelineErrorMessage,
    getSearchPipelineErrorMessage,
    indexDetails,
    ingestPipelineDetails,
    searchPipelineDetails,
  } = useSelector((state: AppState) => state.opensearch);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof WorkflowResource>('id');
  const [sortDirection, setSortDirection] = useState<Direction>('asc');

  // Hook to initialize all resources. Reduce to unique IDs, since
  // the backend resources may include the same resource multiple times
  // (e.g., register and deploy steps persist the same model ID resource)
  useEffect(() => {
    if (props.workflow?.resourcesCreated) {
      const resourcesMap: { [id: string]: WorkflowResource } = {};
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

  // Renders the expanded row to show resource details in a code block.
  const renderExpandedRow = (
    data: any,
    resourceDetailsErrorMessage?: string
  ) => (
    <EuiFlexGroup direction="column" gutterSize="xs">
      <EuiFlexItem grow={true} style={{ paddingLeft: '20px' }}>
        <EuiText size="m">
          <h4>Resource details</h4>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem grow={true} style={{ paddingLeft: '20px' }}>
        {!resourceDetailsErrorMessage && !loading ? (
          <EuiCodeBlock
            language="json"
            fontSize="m"
            isCopyable={true}
            overflowHeight={150}
          >
            {customStringify(data)}
          </EuiCodeBlock>
        ) : loading ? (
          <EuiEmptyPrompt
            icon={<EuiLoadingSpinner size="xl" />}
            title={<h2>Loading</h2>}
          />
        ) : (
          <EuiEmptyPrompt
            iconType="alert"
            iconColor="danger"
            title={<h2>Error loading resource details</h2>}
            body={<p>{resourceDetailsErrorMessage}</p>}
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  // Expands or collapses the details for a resource item.
  const toggleDetails = async (item: WorkflowResource) => {
    const updatedItemIdToExpandedRowMap = { ...itemIdToExpandedRowMap };

    if (updatedItemIdToExpandedRowMap[item.id]) {
      delete updatedItemIdToExpandedRowMap[item.id];
      setItemIdToExpandedRowMap(updatedItemIdToExpandedRowMap);
    } else {
      const value =
        indexDetails[item.id] ??
        ingestPipelineDetails[item.id] ??
        searchPipelineDetails[item.id] ??
        '';
      const resourceDetailsErrorMessage = getErrorMessageForStepType(
        item.stepType,
        getIndexErrorMessage,
        getIngestPipelineErrorMessage,
        getSearchPipelineErrorMessage
      );

      const result = { [item.id]: value };
      if (result) {
        setItemIdToExpandedRowMap((prevMap) => ({
          ...prevMap,
          [item.id]: renderExpandedRow(result, resourceDetailsErrorMessage),
        }));
      }
    }
  };

  // Handles table pagination and sorting.
  const onTableChange = ({
    page = { index: pageIndex, size: pageSize },
    sort = { field: 'id', direction: 'asc' },
  }: any) => {
    setPageIndex(page.index);
    setPageSize(page.size);
    setSortField(sort.field as keyof WorkflowResource);
    setSortDirection(sort.direction);
  };

  const sortedItems = [...allResources].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    return a[sortField] > b[sortField]
      ? 1 * multiplier
      : a[sortField] < b[sortField]
      ? -1 * multiplier
      : 0;
  });

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount: allResources.length,
    pageSizeOptions: [10, 25, 50],
  };

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiBasicTable
          itemId="id"
          itemIdToExpandedRowMap={itemIdToExpandedRowMap}
          isExpandable
          sorting={{ sort: { field: sortField, direction: sortDirection } }}
          pagination={pagination}
          onChange={onTableChange}
          columns={[
            ...columns,
            {
              align: RIGHT_ALIGNMENT,
              width: '40px',
              isExpander: true,
              render: (item: WorkflowResource) => (
                <EuiButtonIcon
                  onClick={() => toggleDetails(item)}
                  aria-label={
                    itemIdToExpandedRowMap[item.id] ? 'Collapse' : 'Expand'
                  }
                  iconType={
                    itemIdToExpandedRowMap[item.id] ? 'arrowUp' : 'arrowDown'
                  }
                />
              ),
            },
          ]}
          items={sortedItems}
          noItemsMessage={'No existing resources found'}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
