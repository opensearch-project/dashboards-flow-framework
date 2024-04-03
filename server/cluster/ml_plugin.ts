/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ML_SEARCH_MODELS_ROUTE } from '../../common';

/**
 * Used during the plugin's setup() lifecycle phase to register various client actions
 * representing ML plugin APIs. These are then exposed and used on the
 * server-side when processing node APIs - see server/routes/ml_routes_service
 * for examples.
 */
export function mlPlugin(Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  Client.prototype.mlClient = components.clientAction.namespaceFactory();
  const mlClient = Client.prototype.mlClient.prototype;

  mlClient.searchModels = ca({
    url: {
      fmt: ML_SEARCH_MODELS_ROUTE,
    },
    needBody: true,
    method: 'POST',
  });
}
