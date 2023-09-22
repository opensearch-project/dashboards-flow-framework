/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiLink } from '@elastic/eui';
import { PLUGIN_ID, IWorkflow } from '../../../../common';

export const columns = [
  {
    field: 'name',
    name: 'Name',
    sortable: true,
    render: (name: string, workflow: IWorkflow) => (
      <EuiLink href={`${PLUGIN_ID}#/workflows/${workflow.id}`}>{name}</EuiLink>
    ),
  },
  {
    field: 'id',
    name: 'ID',
    sortable: true,
  },
  {
    field: 'description',
    name: 'Description',
    sortable: false,
  },
];
