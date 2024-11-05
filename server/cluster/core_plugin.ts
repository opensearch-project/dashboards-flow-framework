/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SEARCH_PIPELINE_ROUTE } from '../../common';

export function corePlugin(Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  Client.prototype.coreClient = components.clientAction.namespaceFactory();
  const coreClient = Client.prototype.coreClient.prototype;

  coreClient.getSearchPipeline = ca({
    url: {
      fmt: `${SEARCH_PIPELINE_ROUTE}/<%=pipeline_id%>`,
      req: {
        pipeline_id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'GET',
  });
}
