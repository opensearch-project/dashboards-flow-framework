/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiLink } from '@elastic/eui';
import {
  EMPTY_FIELD_STRING,
  PLUGIN_ID,
  Workflow,
  toFormattedDate,
} from '../../../../common';

export const columns = (actions: any[]) => [
  {
    field: 'name',
    name: 'Name',
    sortable: true,
    render: (name: string, workflow: Workflow) => (
      <EuiLink href={`${PLUGIN_ID}#/workflows/${workflow.id}`}>{name}</EuiLink>
    ),
  },
  {
    field: 'state',
    name: 'Status',
    sortable: true,
  },
  {
    field: 'use_case',
    name: 'Type',
    sortable: true,
  },
  {
    field: 'lastUpdated',
    name: 'Last updated',
    sortable: true,
    render: (lastUpdated: number) =>
      lastUpdated !== undefined
        ? toFormattedDate(lastUpdated)
        : EMPTY_FIELD_STRING,
  },
  {
    field: 'lastLaunched',
    name: 'Last launched',
    sortable: true,
    render: (lastLaunched: number) =>
      lastLaunched !== undefined
        ? toFormattedDate(lastLaunched)
        : EMPTY_FIELD_STRING,
  },
  {
    name: 'Actions',
    actions,
  },
];
