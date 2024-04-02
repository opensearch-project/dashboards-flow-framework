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
import { SEARCH_MODELS_NODE_API_PATH } from '../../common';
import { generateCustomError, getModelsFromResponses } from './helpers';

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
}

export class MLRoutesService {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  searchModels = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body;
    try {
      const modelsResponse = await this.client
        .asScoped(req)
        .callAsCurrentUser('mlClient.searchModels', { body });
      const modelHits = modelsResponse.hits.hits as any[];
      const modelDict = getModelsFromResponses(modelHits);

      return res.ok({ body: { models: modelDict } });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };
}
