/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { EuiInMemoryTable, Direction } from '@elastic/eui';
import { AppState } from '../../../store';
import { IWorkflow } from '../../../../common';
import { columns } from './columns';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface WorkflowListProps {}

export function WorkflowList(props: WorkflowListProps) {
  const { workflows } = useSelector((state: AppState) => state.workflows);

  const sorting = {
    sort: {
      field: 'name',
      direction: 'asc' as Direction,
    },
  };

  return (
    <EuiInMemoryTable<IWorkflow>
      items={workflows}
      rowHeader="name"
      columns={columns}
      sorting={sorting}
      pagination={true}
      message={'No existing workflows found'}
    />
  );
}
