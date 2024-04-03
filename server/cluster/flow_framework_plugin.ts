/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FLOW_FRAMEWORK_SEARCH_WORKFLOWS_ROUTE,
  FLOW_FRAMEWORK_SEARCH_WORKFLOW_STATE_ROUTE,
  FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX,
} from '../../common';

/**
 * Used during the plugin's setup() lifecycle phase to register various client actions
 * representing Flow Framework plugin APIs. These are then exposed and used on the
 * server-side when processing node APIs - see server/routes/flow_framework_routes_service
 * for examples.
 */
export function flowFrameworkPlugin(Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  Client.prototype.flowFramework = components.clientAction.namespaceFactory();
  const flowFramework = Client.prototype.flowFramework.prototype;

  flowFramework.getWorkflow = ca({
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

  flowFramework.searchWorkflows = ca({
    url: {
      fmt: FLOW_FRAMEWORK_SEARCH_WORKFLOWS_ROUTE,
    },
    needBody: true,
    // Exposed client rejects making GET requests with a body. So, we use POST
    method: 'POST',
  });

  flowFramework.getWorkflowState = ca({
    url: {
      fmt: `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/<%=workflow_id%>/_status`,
      req: {
        workflow_id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'GET',
  });

  flowFramework.searchWorkflowState = ca({
    url: {
      fmt: FLOW_FRAMEWORK_SEARCH_WORKFLOW_STATE_ROUTE,
    },
    needBody: true,
    // Exposed client rejects making GET requests with a body. So, we use POST
    method: 'POST',
  });

  flowFramework.createWorkflow = ca({
    url: {
      fmt: `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}?provision=<%=provision%>`,
      req: {
        provision: {
          type: 'boolean',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'POST',
  });

  flowFramework.deleteWorkflow = ca({
    url: {
      fmt: `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/<%=workflow_id%>`,
      req: {
        workflow_id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'DELETE',
  });
}
