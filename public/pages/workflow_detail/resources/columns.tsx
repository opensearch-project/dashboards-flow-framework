/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  WORKFLOW_STEP_TO_RESOURCE_TYPE_MAP,
  WORKFLOW_STEP_TYPE,
} from '../../../../common';

export const columns = [
  {
    field: 'id',
    name: 'ID',
    sortable: true,
  },
  {
    field: 'stepType',
    name: 'Type',
    sortable: true,
    render: (stepType: WORKFLOW_STEP_TYPE) => {
      return WORKFLOW_STEP_TO_RESOURCE_TYPE_MAP[stepType];
    },
  },
];
