/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema, TypeOf } from '@osd/config-schema';

export const configSchema = schema.object({
  enabled: schema.maybe(schema.boolean()),
});

export type ConfigSchema = TypeOf<typeof configSchema>;

export interface FlowFrameworkDashboardsPluginSetup {}
export interface FlowFrameworkDashboardsPluginStart {}
