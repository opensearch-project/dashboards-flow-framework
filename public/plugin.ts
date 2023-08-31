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
  AiFlowDashboardsPluginSetup,
  AiFlowDashboardsPluginStart,
} from './types';
import { PLUGIN_ID } from '../common';

export class AiFlowDashboardsPlugin
  implements Plugin<AiFlowDashboardsPluginSetup, AiFlowDashboardsPluginStart> {
  public setup(core: CoreSetup): AiFlowDashboardsPluginSetup {
    // Register the plugin in the side navigation
    core.application.register({
      id: PLUGIN_ID,
      title: 'AI Application Builder',
      category: {
        id: 'opensearch',
        label: 'OpenSearch plugins',
        order: 2000,
      },
      // TODO: can i remove this below order
      order: 5000,
      async mount(params: AppMountParameters) {
        const { renderApp } = await import('./application');
        const [coreStart] = await core.getStartServices();
        return renderApp(coreStart, params);
      },
    });
    return {};
  }

  public start(core: CoreStart): AiFlowDashboardsPluginStart {
    return {};
  }

  public stop() {}
}
