/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface FlowFrameworkDashboardsPluginSetup {}
export interface FlowFrameworkDashboardsPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
