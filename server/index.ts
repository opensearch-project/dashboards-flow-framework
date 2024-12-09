/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PluginConfigDescriptor,
  PluginInitializerContext,
} from '../../../src/core/server';
import { FlowFrameworkDashboardsPlugin } from './plugin';
import { configSchema, ConfigSchema } from '../server/types';

export const config: PluginConfigDescriptor<ConfigSchema> = {
  schema: configSchema,
};

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new FlowFrameworkDashboardsPlugin(initializerContext);
}

export {
  FlowFrameworkDashboardsPluginSetup,
  FlowFrameworkDashboardsPluginStart,
} from './types';
