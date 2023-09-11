/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { EuiBasicTable } from '@elastic/eui';
import { BREADCRUMBS } from '../../../utils';
import { getCore } from '../../../services';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface WorkflowListProps {}

interface WorkflowItem {
  name: string;
  description: string;
}

export function WorkflowList(props: WorkflowListProps) {
  useEffect(() => {
    getCore().chrome.setBreadcrumbs([
      BREADCRUMBS.AI_APPLICATION_BUILDER,
      BREADCRUMBS.WORKFLOWS,
    ]);
  });

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const columns = [
    {
      field: 'name',
      name: 'Name',
      sortable: true,
    },
    {
      field: 'description',
      name: 'Description',
      sortable: false,
    },
  ];

  const items = [
    {
      name: 'Workflow 1',
    },
  ] as WorkflowItem[];

  const sorting = {
    sort: {
      field: sortField,
      direction: sortDirection,
    },
    enableAllColumns: false,
    readOnly: false,
  };

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount: items.length,
    pageSizeOptions: [5, 10, 20],
  };

  const onTableChange = ({ page = {}, sort = {} }) => {
    const { index, size } = page;
    const { field, direction } = sort;

    setPageIndex(index);
    setPageSize(size);
    setSortField(field);
    setSortDirection(direction);
  };

  return (
    <EuiBasicTable<WorkflowItem>
      items={items}
      rowHeader="name"
      columns={columns}
      sorting={sorting}
      pagination={pagination}
      onChange={onTableChange}
      noItemsMessage={'No existing workflows found'}
    />
  );
}
