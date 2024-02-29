/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiLink } from '@elastic/eui';
import { PLUGIN_ID, Workflow } from '../../../../common';

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
    field: 'useCase',
    name: 'Type',
    sortable: true,
  },
  {
    field: 'lastUpdated',
    name: 'Last updated',
    sortable: true,
  },
  {
    field: 'lastLaunched',
    name: 'Last launched',
    sortable: true,
  },
  {
    name: 'Actions',
    actions,
  },
];
