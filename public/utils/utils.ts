/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFilterSelectItem } from '@elastic/eui';
import { WORKFLOW_STATE, WORKFLOW_STEP_TYPE, Workflow } from '../../common';

// Append 16 random characters
export function generateId(prefix: string): string {
  const uniqueChar = () => {
    // eslint-disable-next-line no-bitwise
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${prefix}_${uniqueChar()}${uniqueChar()}${uniqueChar()}${uniqueChar()}`;
}

export function getStateOptions(): EuiFilterSelectItem[] {
  return [
    // @ts-ignore
    {
      name: WORKFLOW_STATE.NOT_STARTED,
      checked: 'on',
    } as EuiFilterSelectItem,
    // @ts-ignore
    {
      name: WORKFLOW_STATE.PROVISIONING,
      checked: 'on',
    } as EuiFilterSelectItem,
    // @ts-ignore
    {
      name: WORKFLOW_STATE.FAILED,
      checked: 'on',
    } as EuiFilterSelectItem,
    // @ts-ignore
    {
      name: WORKFLOW_STATE.COMPLETED,
      checked: 'on',
    } as EuiFilterSelectItem,
  ];
}

export function hasProvisionedIngestResources(
  workflow: Workflow | undefined
): boolean {
  let result = false;
  workflow?.resourcesCreated?.some((resource) => {
    if (
      resource.stepType ===
        WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE ||
      resource.stepType === WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE
    ) {
      result = true;
    }
  });
  return result;
}
