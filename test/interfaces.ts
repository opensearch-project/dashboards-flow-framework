/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { WORKFLOW_TYPE } from '../common/constants';

export type WorkflowInput = {
  id: string;
  name: string;
  type: WORKFLOW_TYPE;
  version?: string;
};
