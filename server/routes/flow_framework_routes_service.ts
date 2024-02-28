/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import {
  IRouter,
  IOpenSearchDashboardsResponse,
  RequestHandlerContext,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
} from '../../../../src/core/server';
import {
  CREATE_WORKFLOW_NODE_API_PATH,
  DELETE_WORKFLOW_NODE_API_PATH,
  GET_WORKFLOW_NODE_API_PATH,
  GET_WORKFLOW_STATE_NODE_API_PATH,
  SEARCH_WORKFLOWS_NODE_API_PATH,
  WorkflowDict,
} from '../../common';
import { generateCustomError, toWorkflowObj } from './helpers';

/**
 * Server-side routes to process flow-framework-related node API calls and execute the
 * corresponding API calls against the OpenSearch cluster.
 */
export function registerFlowFrameworkRoutes(
  router: IRouter,
  flowFrameworkRoutesService: FlowFrameworkRoutesService
): void {
  router.get(
    {
      path: `${GET_WORKFLOW_NODE_API_PATH}/{workflow_id}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
        }),
      },
    },
    flowFrameworkRoutesService.getWorkflow
  );

  router.post(
    {
      path: SEARCH_WORKFLOWS_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
    },
    flowFrameworkRoutesService.searchWorkflows
  );

  router.get(
    {
      path: `${GET_WORKFLOW_STATE_NODE_API_PATH}/{workflow_id}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
        }),
      },
    },
    flowFrameworkRoutesService.getWorkflowState
  );

  router.post(
    {
      path: CREATE_WORKFLOW_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
    },
    flowFrameworkRoutesService.createWorkflow
  );

  router.delete(
    {
      path: `${DELETE_WORKFLOW_NODE_API_PATH}/{workflow_id}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
        }),
      },
    },
    flowFrameworkRoutesService.deleteWorkflow
  );
}

export class FlowFrameworkRoutesService {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  // TODO: test e2e
  getWorkflow = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { workflow_id } = req.params as { workflow_id: string };
    try {
      const response = await this.client
        .asScoped(req)
        .callAsCurrentUser('flowFramework.getWorkflow', { workflow_id });
      console.log('response from get workflow: ', response);
      // TODO: format response
      return res.ok({ body: response });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  searchWorkflows = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body;
    try {
      const response = await this.client
        .asScoped(req)
        .callAsCurrentUser('flowFramework.searchWorkflows', { body });
      const workflowHits = response.hits.hits as any[];
      const workflowsMap = {} as WorkflowDict;
      workflowHits.forEach((workflowHit: any) => {
        workflowsMap[workflowHit._id] = toWorkflowObj(workflowHit);
      });

      return res.ok({ body: { workflows: workflowsMap } });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  // TODO: test e2e
  getWorkflowState = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { workflow_id } = req.params as { workflow_id: string };
    try {
      const response = await this.client
        .asScoped(req)
        .callAsCurrentUser('flowFramework.getWorkflowState', { workflow_id });
      console.log('response from get workflow state: ', response);
      // TODO: format response
      return res.ok({ body: response });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  // TODO: test e2e
  createWorkflow = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body;

    try {
      const response = await this.client
        .asScoped(req)
        .callAsCurrentUser('flowFramework.createWorkflow', { body });
      console.log('response from create workflow: ', response);
      // TODO: format response
      return res.ok({ body: response });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  // TODO: test e2e
  deleteWorkflow = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { workflow_id } = req.params as { workflow_id: string };
    try {
      const response = await this.client
        .asScoped(req)
        .callAsCurrentUser('flowFramework.deleteWorkflow', { workflow_id });
      console.log('response from delete workflow: ', response);
      // TODO: format response
      return res.ok({ body: response });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };
}
