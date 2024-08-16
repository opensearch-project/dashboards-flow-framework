/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiLink } from '@elastic/eui';
import {
  EMPTY_FIELD_STRING,
  MAX_WORKFLOW_NAME_TO_DISPLAY,
  Workflow,
  getCharacterLimitedString,
  toFormattedDate,
} from '../../../../common';
import {
  constructHrefWithDataSourceId,
  getDataSourceId,
} from '../../../utils/utils';

export const columns = (actions: any[]) => {
  const dataSourceId = getDataSourceId();

  return [
    {
      field: 'name',
      name: 'Name',
      width: '35%',
      sortable: true,
      render: (name: string, workflow: Workflow) => (
        <EuiLink
          href={constructHrefWithDataSourceId(
            `/workflows/${workflow.id}`,
            dataSourceId
          )}
        >
          {getCharacterLimitedString(name, MAX_WORKFLOW_NAME_TO_DISPLAY)}
        </EuiLink>
      ),
    },
    {
      field: 'ui_metadata.type',
      name: 'Type',
      width: '20%',
      sortable: true,
    },
    {
      field: 'lastUpdated',
      name: 'Last saved',
      width: '35%',
      sortable: true,
      render: (lastUpdated: number) =>
        lastUpdated !== undefined
          ? toFormattedDate(lastUpdated)
          : EMPTY_FIELD_STRING,
    },
    {
      name: 'Actions',
      width: '10%',
      actions,
    },
  ];
};
