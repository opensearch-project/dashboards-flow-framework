/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import {
  AiFlowDashboardsPluginSetup,
  AiFlowDashboardsPluginStart,
} from './types';
import { registerOpenSearchRoutes } from './routes';

export class AiFlowDashboardsPlugin
  implements Plugin<AiFlowDashboardsPluginSetup, AiFlowDashboardsPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('ai-flow-dashboards: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    registerOpenSearchRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('ai-flow-dashboards: Started');
    return {};
  }

  public stop() {}
}
