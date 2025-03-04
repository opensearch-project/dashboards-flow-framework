/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FLOW_FRAMEWORK_SEARCH_WORKFLOWS_ROUTE,
  FLOW_FRAMEWORK_SEARCH_WORKFLOW_STATE_ROUTE,
  FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX,
  PROVISION_TIMEOUT,
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
      fmt: `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}?provision=false`,
    },
    needBody: true,
    method: 'POST',
  });

  flowFramework.updateWorkflow = ca({
    url: {
      fmt: `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/<%=workflow_id%>?update_fields=<%=update_fields%>`,
      req: {
        workflow_id: {
          type: 'string',
          required: true,
        },
        update_fields: {
          type: 'boolean',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  flowFramework.updateAndReprovisionWorkflow = ca({
    url: {
      fmt: `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/<%=workflow_id%>?update_fields=<%=update_fields%>&reprovision=true&wait_for_completion_timeout=${PROVISION_TIMEOUT}`,
      req: {
        workflow_id: {
          type: 'string',
          required: true,
        },
        update_fields: {
          type: 'boolean',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  flowFramework.updateAndReprovisionWorkflowAsync = ca({
    url: {
      fmt: `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/<%=workflow_id%>?update_fields=<%=update_fields%>&reprovision=true`,
      req: {
        workflow_id: {
          type: 'string',
          required: true,
        },
        update_fields: {
          type: 'boolean',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  flowFramework.provisionWorkflow = ca({
    url: {
      fmt: `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/<%=workflow_id%>/_provision?wait_for_completion_timeout=${PROVISION_TIMEOUT}`,
      req: {
        workflow_id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'POST',
  });

  flowFramework.provisionWorkflowAsync = ca({
    url: {
      fmt: `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/<%=workflow_id%>/_provision`,
      req: {
        workflow_id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'POST',
  });

  flowFramework.deprovisionWorkflow = ca({
    url: {
      fmt: `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/<%=workflow_id%>/_deprovision`,
      req: {
        workflow_id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'POST',
  });

  flowFramework.forceDeprovisionWorkflow = ca({
    url: {
      fmt: `${FLOW_FRAMEWORK_WORKFLOW_ROUTE_PREFIX}/<%=workflow_id%>/_deprovision?allow_delete=<%=resource_ids%>`,
      req: {
        workflow_id: {
          type: 'string',
          required: true,
        },
        resource_ids: {
          type: 'string',
          required: true,
        },
      },
    },
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
