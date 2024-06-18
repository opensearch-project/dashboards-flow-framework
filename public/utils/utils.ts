/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFilterSelectItem } from '@elastic/eui';
import { WORKFLOW_STATE } from '../../common';

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
