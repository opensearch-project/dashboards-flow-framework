/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IComponent, IComponentData } from '../../common';

// Append 16 random characters
export function generateId(prefix: string) {
  const uniqueChar = () => {
    // eslint-disable-next-line no-bitwise
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${prefix}_${uniqueChar()}${uniqueChar()}${uniqueChar()}${uniqueChar()}`;
}

// Adding any instance metadata. Converting the base IComponent obj into
// an instance-specific IComponentData obj.
export function initComponentData(
  data: IComponent,
  componentId: string
): IComponentData {
  return {
    ...data,
    id: componentId,
  } as IComponentData;
}
