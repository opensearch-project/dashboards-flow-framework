/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX } from '../utils';

export function flowFrameworkPlugin(Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  Client.prototype.flowFramework = components.clientAction.namespaceFactory();
  const flowFramework = Client.prototype.flowFramework.prototype;

  flowFramework.deleteDetector = ca({
    url: {
      fmt: `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/<%=workflow_id%>`,
      req: {
        workflow_id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'GET',
  });
}
