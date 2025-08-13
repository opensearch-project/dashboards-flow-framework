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
  SEARCH_MODELS_NODE_API_PATH,
  BASE_NODE_API_PATH,
  SearchHit,
  SEARCH_CONNECTORS_NODE_API_PATH,
  REGISTER_AGENT_NODE_API_PATH,
  SEARCH_AGENTS_NODE_API_PATH,
} from '../../common';
import {
  generateCustomError,
  getConnectorsFromResponses,
  getModelsFromResponses,
} from './helpers';
import { getClientBasedOnDataSource } from '../utils/helpers';

/**
 * Server-side routes to process ml-plugin-related node API calls and execute the
 * corresponding API calls against the OpenSearch cluster.
 */
export function registerMLRoutes(
  router: IRouter,
  mlRoutesService: MLRoutesService
): void {
  router.post(
    {
      path: SEARCH_MODELS_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
    },
    mlRoutesService.searchModels
  );
  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/model/search`,
      validate: {
        body: schema.any(),
        params: schema.object({
          data_source_id: schema.string(),
        }),
      },
    },
    mlRoutesService.searchModels
  );
  router.post(
    {
      path: SEARCH_CONNECTORS_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
    },
    mlRoutesService.searchConnectors
  );
  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/connector/search`,
      validate: {
        body: schema.any(),
        params: schema.object({
          data_source_id: schema.string(),
        }),
      },
    },
    mlRoutesService.searchConnectors
  );

  router.post(
    {
      path: REGISTER_AGENT_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
    },
    mlRoutesService.registerAgent
  );

  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/agent/register`,
      validate: {
        body: schema.any(),
        params: schema.object({
          data_source_id: schema.string(),
        }),
      },
    },
    mlRoutesService.registerAgent
  );

  router.post(
    {
      path: SEARCH_AGENTS_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
    },
    mlRoutesService.searchAgents
  );

  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/agent/search`,
      validate: {
        body: schema.any(),
        params: schema.object({
          data_source_id: schema.string(),
        }),
      },
    },
    mlRoutesService.searchAgents
  );
}

export class MLRoutesService {
  private client: any;
  dataSourceEnabled: boolean;

  constructor(client: any, dataSourceEnabled: boolean) {
    this.client = client;
    this.dataSourceEnabled = dataSourceEnabled;
  }

  searchModels = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body;
    try {
      const { data_source_id = '' } = req.params as { data_source_id?: string };
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );
      const modelsResponse = await callWithRequest('mlClient.searchModels', {
        body,
      });

      const modelHits = modelsResponse.hits.hits as SearchHit[];
      const modelDict = getModelsFromResponses(modelHits);

      return res.ok({ body: { models: modelDict } });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  searchConnectors = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body;
    try {
      const { data_source_id = '' } = req.params as { data_source_id?: string };
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );
      const connectorsResponse = await callWithRequest(
        'mlClient.searchConnectors',
        {
          body,
        }
      );

      const connectorHits = connectorsResponse.hits.hits as SearchHit[];
      const connectorDict = getConnectorsFromResponses(connectorHits);

      return res.ok({ body: { connectors: connectorDict } });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  registerAgent = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body as {};
    try {
      const { data_source_id = '' } = req.params as { data_source_id?: string };
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );
      const response = await callWithRequest('mlClient.registerAgent', {
        body,
      });

      const agentWithId = {
        ...body,
        id: response.agent_id,
      };

      return res.ok({ body: { agent: agentWithId } });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  searchAgents = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body;
    try {
      const { data_source_id = '' } = req.params as { data_source_id?: string };
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );
      const response = await callWithRequest('mlClient.searchAgents', {
        body,
      });

      // Format the response into an AgentDict
      const agents = {};
      if (response.hits && response.hits.hits) {
        for (const hit of response.hits.hits) {
          const source = hit._source;
          // @ts-ignore
          agents[hit._id] = {
            id: hit._id,
            name: source.name,
            type: source.type,
            description: source.description,
          };
        }
      }

      return res.ok({ body: { agents } });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };
}
