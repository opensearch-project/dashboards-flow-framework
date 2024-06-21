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
    width: '33%',
    sortable: true,
    render: (name: string, workflow: Workflow) => (
      <EuiLink href={`${PLUGIN_ID}#/workflows/${workflow.id}`}>{name}</EuiLink>
    ),
  },
  {
    field: 'ui_metadata.type',
    name: 'Type',
    width: '33%',
    sortable: true,
  },
  {
    field: 'lastUpdated',
    name: 'Last saved',
    width: '33%',
    sortable: true,
    render: (lastUpdated: number) =>
      lastUpdated !== undefined
        ? toFormattedDate(lastUpdated)
        : EMPTY_FIELD_STRING,
  },
  {
    name: 'Actions',
    actions,
  },
];
