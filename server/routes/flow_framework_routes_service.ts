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
  BASE_NODE_API_PATH,
  CREATE_WORKFLOW_NODE_API_PATH,
  DELETE_WORKFLOW_NODE_API_PATH,
  DEPROVISION_WORKFLOW_NODE_API_PATH,
  GET_PRESET_WORKFLOWS_NODE_API_PATH,
  GET_WORKFLOW_NODE_API_PATH,
  GET_WORKFLOW_STATE_NODE_API_PATH,
  PROVISION_WORKFLOW_NODE_API_PATH,
  SEARCH_WORKFLOWS_NODE_API_PATH,
  UPDATE_WORKFLOW_NODE_API_PATH,
  WORKFLOW_STATE,
  Workflow,
  WorkflowDict,
  WorkflowResource,
  WorkflowTemplate,
} from '../../common';
import { getClientBasedOnDataSource } from '../utils/helpers';
import {
  generateCustomError,
  getResourcesCreatedFromResponse,
  getWorkflowStateFromResponse,
  getWorkflowsFromResponses,
  isIgnorableError,
  toWorkflowObj,
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

  router.get(
    {
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/workflow/{workflow_id}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
          dataSourceId: schema.string(),
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

  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/workflow/search`,
      validate: {
        params: schema.object({
          dataSourceId: schema.string(),
        }),
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

  router.get(
    {
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/workflow/state/{workflow_id}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
          dataSourceId: schema.string(),
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
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/workflow/create`,
      validate: {
        params: schema.object({
          dataSourceId: schema.string(),
        }),
        body: schema.any(),
      },
    },
    flowFrameworkRoutesService.createWorkflow
  );

  router.put(
    {
      path: `${UPDATE_WORKFLOW_NODE_API_PATH}/{workflow_id}/{update_fields}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
          update_fields: schema.boolean(),
        }),
        body: schema.any(),
      },
    },
    flowFrameworkRoutesService.updateWorkflow
  );

  router.put(
    {
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/workflow/update/{workflow_id}/{update_fields}`,
      validate: {
        params: schema.object({
          dataSourceId: schema.string(),
          workflow_id: schema.string(),
          update_fields: schema.boolean(),
        }),
        body: schema.any(),
      },
    },
    flowFrameworkRoutesService.updateWorkflow
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

  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/workflow/provision/{workflow_id}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
          dataSourceId: schema.string(),
        }),
      },
    },
    flowFrameworkRoutesService.provisionWorkflow
  );

  router.post(
    {
      path: `${DEPROVISION_WORKFLOW_NODE_API_PATH}/{workflow_id}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
        }),
      },
    },
    flowFrameworkRoutesService.deprovisionWorkflow
  );

  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/workflow/deprovision/{workflow_id}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
          dataSourceId: schema.string(),
        }),
      },
    },
    flowFrameworkRoutesService.deprovisionWorkflow
  );


  router.post(
    {
      path: `${DEPROVISION_WORKFLOW_NODE_API_PATH}/{workflow_id}/{resource_ids}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
          resource_ids: schema.string(),
        }),
      },
    },
    flowFrameworkRoutesService.deprovisionWorkflow
  );

  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/workflow/deprovision/{workflow_id}/{resource_ids}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
          resource_ids: schema.string(),
          dataSourceId: schema.string(),
        }),
      },
    },
    flowFrameworkRoutesService.deprovisionWorkflow
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

  router.delete(
    {
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/workflow/delete/{workflow_id}`,
      validate: {
        params: schema.object({
          workflow_id: schema.string(),
          dataSourceId: schema.string(),
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

  router.get(
    {
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/workflow/presets`,
      validate: {
        params: schema.object({
          dataSourceId: schema.string(),
        }),
      },
    },
    flowFrameworkRoutesService.getPresetWorkflows
  );
}

export class FlowFrameworkRoutesService {
  dataSourceEnabled: boolean;
  private client: any; 

  constructor(client: any, dataSourceEnabled: boolean) {
    this.client = client;
    this.dataSourceEnabled = dataSourceEnabled;
  }

  // TODO: can remove or simplify if we can fetch all data from a single API call. Tracking issue:
  // https://github.com/opensearch-project/flow-framework/issues/171
  // Current implementation is making two calls and combining results via helper fn
  getWorkflow = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { workflow_id } = req.params as { workflow_id: string };
    try {
      const { dataSourceId = '' } = req.params as { dataSourceId?: string };
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
        this.client
      );
      const response = await callWithRequest('flowFramework.getWorkflow', {
        workflow_id,
      });
      const workflow = toWorkflowObj(response, workflow_id);

      const stateResponse = await callWithRequest('flowFramework.getWorkflowState', {
        workflow_id,
      });
      const state = getWorkflowStateFromResponse(
        stateResponse.state as typeof WORKFLOW_STATE
      );
      const resourcesCreated = getResourcesCreatedFromResponse(
        stateResponse.resources_created as WorkflowResource[]
      );
      const workflowWithState = {
        ...workflow,
        state,
        error: stateResponse.error,
        resourcesCreated,
      } as Workflow;
      return res.ok({ body: { workflow: workflowWithState } });
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
      const { dataSourceId = '' } = req.params as { dataSourceId?: string };
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
        this.client
      );

      const workflowsResponse = await callWithRequest('flowFramework.searchWorkflows', {
        body,
      });
      const workflowHits = workflowsResponse.hits?.hits as any[] | []

      const workflowStatesResponse = await callWithRequest('flowFramework.searchWorkflowState', {
        body,
      });
      const workflowStateHits = workflowStatesResponse.hits?.hits as any[] | []

      const workflowDict = getWorkflowsFromResponses(
        workflowHits,
        workflowStateHits
      );
      return res.ok({ body: { workflows: workflowDict } });
    } catch (err: any) {
      if (isIgnorableError(err)) {
        return res.ok({ body: { workflows: {} as WorkflowDict } });
      }
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
      const { dataSourceId = '' } = req.params as { dataSourceId?: string };
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
        this.client
      );
      const response = await callWithRequest('flowFramework.getWorkflowState', {
        workflow_id,
      });
      const state = getWorkflowStateFromResponse(
        response.state as typeof WORKFLOW_STATE | undefined
      );
      const resourcesCreated = getResourcesCreatedFromResponse(
        response.resources_created as WorkflowResource[] | undefined
      );
      return res.ok({
        body: {
          workflowId: workflow_id,
          workflowState: state,
          resourcesCreated,
        },
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
      const { dataSourceId = '' } = req.params as { dataSourceId?: string };
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
        this.client
      );
      const response = await callWithRequest('flowFramework.createWorkflow', {
        body,
      });
      const workflowWithId = {
        ...body,
        id: response.workflow_id,
      };
      return res.ok({ body: { workflow: workflowWithId } });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  updateWorkflow = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { workflow_id, update_fields } = req.params as {
      workflow_id: string;
      update_fields: boolean;
    };
    const workflowTemplate = req.body as WorkflowTemplate;
    try {
      const { dataSourceId = '' } = req.params as { dataSourceId?: string };
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
        this.client
      );
      await callWithRequest('flowFramework.updateWorkflow', {
        workflow_id,
        // default update_fields to false if not explicitly set otherwise
        update_fields: update_fields,
        body: workflowTemplate,
      });

      return res.ok({ body: { workflowId: workflow_id, workflowTemplate } });
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
      const { dataSourceId = '' } = req.params as { dataSourceId?: string };
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
        this.client
      );
      await callWithRequest('flowFramework.provisionWorkflow', {
        workflow_id,
      });
      return res.ok();
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  deprovisionWorkflow = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { workflow_id, resource_ids } = req.params as {
      workflow_id: string;
      resource_ids?: string;
    };
    try {
      const { dataSourceId = '' } = req.params as { dataSourceId?: string };
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
        this.client
      );
      if (resource_ids !== undefined) {
        await callWithRequest('flowFramework.forceDeprovisionWorkflow', {
          workflow_id,
          resource_ids,
        });
      } else {
        await callWithRequest('flowFramework.deprovisionWorkflow', {
          workflow_id,
        });
      }
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
      const { dataSourceId = '' } = req.params as { dataSourceId?: string };
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
        this.client
      );

      const response = await callWithRequest('flowFramework.deleteWorkflow', {
        workflow_id,
      });
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
      const workflowTemplates = [] as Partial<WorkflowTemplate>[];
      jsonTemplates.forEach((jsonTemplate) => {
        const templateData = fs.readFileSync(
          path.join(jsonTemplateDir, jsonTemplate)
        );
        const workflowTemplate = JSON.parse(templateData.toString()) as Partial<
          WorkflowTemplate
        >;
        workflowTemplates.push(workflowTemplate);
      });

      return res.ok({ body: { workflowTemplates } });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };
}
