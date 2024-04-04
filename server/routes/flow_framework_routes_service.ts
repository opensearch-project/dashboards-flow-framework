/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
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
  GET_PRESET_WORKFLOWS_NODE_API_PATH,
  GET_WORKFLOW_NODE_API_PATH,
  GET_WORKFLOW_STATE_NODE_API_PATH,
  PROVISION_WORKFLOW_NODE_API_PATH,
  SEARCH_WORKFLOWS_NODE_API_PATH,
  WORKFLOW_STATE,
  Workflow,
  WorkflowTemplate,
  validateWorkflowTemplate,
} from '../../common';
import {
  generateCustomError,
  getWorkflowStateFromResponse,
  getWorkflowsFromResponses,
} from './helpers';

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

  router.post(
    {
      path: `${PROVISION_WORKFLOW_NODE_API_PATH}/{workflow_id}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
        }),
      },
    },
    flowFrameworkRoutesService.provisionWorkflow
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

  router.get(
    {
      path: GET_PRESET_WORKFLOWS_NODE_API_PATH,
      validate: {},
    },
    flowFrameworkRoutesService.getPresetWorkflows
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

  // TODO: can remove or simplify if we can fetch all data from a single API call. Tracking issue:
  // https://github.com/opensearch-project/flow-framework/issues/171
  // Current implementation is making two calls and combining results via helper fn
  searchWorkflows = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body;
    try {
      const workflowsResponse = await this.client
        .asScoped(req)
        .callAsCurrentUser('flowFramework.searchWorkflows', { body });
      const workflowHits = workflowsResponse.hits.hits as any[];

      const workflowStatesResponse = await this.client
        .asScoped(req)
        .callAsCurrentUser('flowFramework.searchWorkflowState', { body });
      const workflowStateHits = workflowStatesResponse.hits.hits as any[];

      const workflowDict = getWorkflowsFromResponses(
        workflowHits,
        workflowStateHits
      );
      return res.ok({ body: { workflows: workflowDict } });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

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
      const state = getWorkflowStateFromResponse(
        response.state as typeof WORKFLOW_STATE
      );
      return res.ok({
        body: { workflowId: workflow_id, workflowState: state },
      });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  createWorkflow = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body as Workflow;
    try {
      const response = await this.client
        .asScoped(req)
        .callAsCurrentUser('flowFramework.createWorkflow', { body });
      const workflowWithId = {
        ...body,
        id: response.workflow_id,
      };
      return res.ok({ body: { workflow: workflowWithId } });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  provisionWorkflow = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { workflow_id } = req.params as { workflow_id: string };
    try {
      await this.client
        .asScoped(req)
        .callAsCurrentUser('flowFramework.provisionWorkflow', { workflow_id });
      return res.ok();
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

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
      return res.ok({ body: { id: response._id } });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  getPresetWorkflows = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    try {
      // In the future we may get these from backend via some API. For now we can
      // persist a set of working presets on server-side.
      const jsonTemplateDir = path.resolve(__dirname, '../resources/templates');
      const jsonTemplates = fs
        .readdirSync(jsonTemplateDir)
        .filter((file) => path.extname(file) === '.json');
      const workflowTemplates = [] as WorkflowTemplate[];
      jsonTemplates.forEach((jsonTemplate) => {
        const templateData = fs.readFileSync(
          path.join(jsonTemplateDir, jsonTemplate)
        );
        const workflowTemplate = JSON.parse(
          templateData.toString()
        ) as WorkflowTemplate;
        if (validateWorkflowTemplate(workflowTemplate)) {
          workflowTemplates.push(workflowTemplate);
        }
      });

      return res.ok({ body: { workflowTemplates } });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };
}
