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
  SHAREABLE_WORKFLOW_RESOURCE_TYPE,
} from '../../../utils/utils';

export const columns = (
  actions: any[],
  resourceSharingAvailableTypes: string[] = []
) => {
  const dataSourceId = getDataSourceId();

  return [
    {
      field: 'name',
      name: 'Name',
      width: '25%',
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
      width: '25%',
      sortable: true,
    },
    {
      field: 'description',
      name: 'Description',
      width: '35%',
      sortable: false,
    },
    {
      field: 'lastUpdated',
      name: 'Last saved',
      width: '15%',
      sortable: true,
      render: (lastUpdated: number) =>
        lastUpdated !== undefined
          ? toFormattedDate(lastUpdated)
          : EMPTY_FIELD_STRING,
    },
    ...(resourceSharingAvailableTypes.includes(SHAREABLE_WORKFLOW_RESOURCE_TYPE)
      ? [
          {
            // Resource-sharing SPI marker column: the centralized Share button
            // is mounted here by security-dashboards-plugin when installed and
            // resource sharing is enabled for workflows.
            name: 'Access',
            width: '5%',
            render: (workflow: Workflow) =>
              resourceSharingAvailableTypes.includes(
                SHAREABLE_WORKFLOW_RESOURCE_TYPE
              ) ? (
                <div
                  data-resource-share-button
                  data-resource-id={workflow.id}
                  data-resource-type={SHAREABLE_WORKFLOW_RESOURCE_TYPE}
                  {...(workflow.name
                    ? { 'data-resource-name': workflow.name }
                    : {})}
                  data-resource-share-display="icon"
                  {...(dataSourceId
                    ? { 'data-resource-data-source-id': dataSourceId }
                    : {})}
                />
              ) : null,
          },
        ]
      : []),
    {
      name: 'Actions',
      width: '10%',
      actions,
    },
  ];
};
