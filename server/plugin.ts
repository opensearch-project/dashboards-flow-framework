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
import { flowFrameworkPlugin, mlPlugin } from './cluster';
import {
  FlowFrameworkDashboardsPluginSetup,
  FlowFrameworkDashboardsPluginStart,
} from './types';
import {
  registerOpenSearchRoutes,
  registerFlowFrameworkRoutes,
  OpenSearchRoutesService,
  FlowFrameworkRoutesService,
  registerMLRoutes,
  MLRoutesService,
} from './routes';
import { DataSourcePluginSetup } from '../../../src/plugins/data_source/server/types';
import { DataSourceManagementPlugin } from '../../../src/plugins/data_source_management/public';

import { ILegacyClusterClient } from '../../../src/core/server/';

export interface FFPluginSetupDependencies {
  dataSourceManagement?: ReturnType<DataSourceManagementPlugin['setup']>;
  dataSource?: DataSourcePluginSetup;
}

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

  public async setup(
    core: CoreSetup,
    { dataSource }: FFPluginSetupDependencies
    ) {
    this.logger.debug('flow-framework-dashboards: Setup');
    const router = core.http.createRouter();

    // Get global config
    const globalConfig = await this.globalConfig$.pipe(first()).toPromise();

    // Create OpenSearch client, including flow framework plugin APIs
    const client: ILegacyClusterClient = core.opensearch.legacy.createClient(
      'flow_framework',
      {
        plugins: [flowFrameworkPlugin, mlPlugin],
        ...globalConfig.opensearch,
      }
    );

    const dataSourceEnabled = !!dataSource;
    if (dataSourceEnabled) {
      dataSource.registerCustomApiSchema(flowFrameworkPlugin);
      dataSource.registerCustomApiSchema(mlPlugin);
    }
    const opensearchRoutesService = new OpenSearchRoutesService(client, dataSourceEnabled);
    const flowFrameworkRoutesService = new FlowFrameworkRoutesService(client, dataSourceEnabled);
    const mlRoutesService = new MLRoutesService(client, dataSourceEnabled);

    // Register server side APIs with the corresponding service functions
    registerOpenSearchRoutes(router, opensearchRoutesService);
    registerFlowFrameworkRoutes(router, flowFrameworkRoutesService);
    registerMLRoutes(router, mlRoutesService);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('flow-framework-dashboards: Started');
    return {};
  }

  public stop() {}
}
