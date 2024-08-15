/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppMountParameters,
  CoreSetup,
  DEFAULT_NAV_GROUPS,
  DEFAULT_APP_CATEGORIES,
  CoreStart,
  Plugin,
} from '../../../src/core/public';
import {
  FlowFrameworkDashboardsPluginStart,
  FlowFrameworkDashboardsPluginSetup,
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

export class FlowFrameworkDashboardsPlugin
  implements
    Plugin<
      FlowFrameworkDashboardsPluginSetup,
      FlowFrameworkDashboardsPluginStart
    > {
  public setup(
    core: CoreSetup,
    plugins: any
  ): FlowFrameworkDashboardsPluginSetup {
    const hideInAppSideNavBar = core.chrome.navGroup.getNavGroupEnabled();
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
        return renderApp(coreStart, params, hideInAppSideNavBar);
      },
    });
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.search, [
      {
        id: PLUGIN_ID,
        title: 'Search Studio',
        category: DEFAULT_APP_CATEGORIES.configure,
        showInAllNavGroup: true,
      },
    ]);
    setDataSourceManagementPlugin(plugins.dataSourceManagement);
    const enabled = !!plugins.dataSource;
    setDataSourceEnabled({ enabled });
    return {
      dataSourceManagement: plugins.dataSourceManagement,
      dataSource: plugins.dataSource,
    };
  }

  public start(core: CoreStart): FlowFrameworkDashboardsPluginStart {
    setNotifications(core.notifications);
    setSavedObjectsClient(core.savedObjects.client);
    return {};
  }

  public stop() {}
}
