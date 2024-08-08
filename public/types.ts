/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { DataSourcePluginSetup } from '../../../src/plugins/data_source/public';

export interface FlowFrameworkDashboardsPluginSetup {
  dataSourceManagement: DataSourceManagementPluginSetup;
  dataSource: DataSourcePluginSetup;
}

export interface FlowFrameworkDashboardsPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
