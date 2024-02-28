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
import { first } from 'rxjs/operators';
import { flowFrameworkPlugin } from './cluster';
import {
  FlowFrameworkDashboardsPluginSetup,
  FlowFrameworkDashboardsPluginStart,
} from './types';
import {
  registerOpenSearchRoutes,
  registerFlowFrameworkRoutes,
  OpenSearchRoutesService,
  FlowFrameworkRoutesService,
} from './routes';

import { ILegacyClusterClient } from '../../../src/core/server/';

export class FlowFrameworkDashboardsPlugin
  implements
    Plugin<
      FlowFrameworkDashboardsPluginSetup,
      FlowFrameworkDashboardsPluginStart
    > {
  private readonly logger: Logger;
  private readonly globalConfig$: any;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    this.globalConfig$ = initializerContext.config.legacy.globalConfig$;
  }

  public async setup(core: CoreSetup) {
    this.logger.debug('flow-framework-dashboards: Setup');
    const router = core.http.createRouter();

    // Get global config
    const globalConfig = await this.globalConfig$.pipe(first()).toPromise();

    // Create OpenSearch client, including flow framework plugin APIs
    const client: ILegacyClusterClient = core.opensearch.legacy.createClient(
      'flow_framework',
      {
        plugins: [flowFrameworkPlugin],
        ...globalConfig.opensearch,
      }
    );

    const opensearchRoutesService = new OpenSearchRoutesService(client);
    const flowFrameworkRoutesService = new FlowFrameworkRoutesService(client);

    // Register server side APIs with the corresponding service functions
    registerOpenSearchRoutes(router, opensearchRoutesService);
    registerFlowFrameworkRoutes(router, flowFrameworkRoutesService);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('flow-framework-dashboards: Started');
    return {};
  }

  public stop() {}
}
