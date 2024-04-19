/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Shared utility fns used in the prototyping page.
 */

export function getFormattedJSONString(obj: {}): string {
  return Object.values(obj).length > 0 ? JSON.stringify(obj, null, '\t') : '';
}
