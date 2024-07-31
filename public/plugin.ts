/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppMountParameters,
  CoreSetup,
  CoreStart,
  Plugin,
} from '../../../src/core/public';
import {
  FlowFrameworkDashboardsPluginSetup,
  FlowFrameworkDashboardsPluginStart,
} from './types';
import { PLUGIN_ID } from '../common';
import { 
  setCore, 
  setRouteService,
  setSavedObjectsClient,
  setDataSourceManagementPlugin,
  setDataSourceEnabled,
  setNotifications,
 } from './services';
import { configureRoutes } from './route_service';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { DataSourcePluginSetup } from '../../../src/plugins/data_source/public';

export interface FlowFrameworkDashboardsSetupDeps {
  dataSourceManagement: DataSourceManagementPluginSetup;
  dataSource: DataSourcePluginSetup;
  flowFrameworkDashboards: FlowFrameworkDashboardsPluginSetup;
}

export class FlowFrameworkDashboardsPlugin
  implements
    Plugin<
      FlowFrameworkDashboardsSetupDeps,
      FlowFrameworkDashboardsPluginStart
    > {
  public setup(core: CoreSetup, plugins: any) {
    // Register the plugin in the side navigation
    core.application.register({
      id: PLUGIN_ID,
      title: 'Flow Framework',
      category: {
        id: 'opensearch',
        label: 'OpenSearch plugins',
        // TODO: this may change after plugin position is finalized
        order: 2000,
      },
      // TODO: can i remove this below order
      order: 5000,
      async mount(params: AppMountParameters) {
        const { renderApp } = await import('./render_app');
        const [coreStart] = await core.getStartServices();
        const routeServices = configureRoutes(coreStart);
        setCore(coreStart);
        setRouteService(routeServices);
        return renderApp(coreStart, params);
      },
    });
    setDataSourceManagementPlugin(plugins.dataSourceManagement);
    const enabled = !!plugins.dataSource;
    setDataSourceEnabled({ enabled });
    return {};
  }

  public start(core: CoreStart): FlowFrameworkDashboardsPluginStart {
    setNotifications(core.notifications);
    setSavedObjectsClient(core.savedObjects.client);
    return {};
  }

  public stop() {}
}
