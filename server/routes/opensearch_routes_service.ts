/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { SearchRequest } from '@opensearch-project/opensearch/api/types';
import {
  IRouter,
  IOpenSearchDashboardsResponse,
  RequestHandlerContext,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
} from '../../../../src/core/server';
import { CAT_INDICES_NODE_API_PATH, Index } from '../../common';
import { generateCustomError } from './helpers';

/**
 * Server-side routes to process OpenSearch-related node API calls and execute the
 * corresponding API calls against the OpenSearch cluster.
 */
export function registerOpenSearchRoutes(
  router: IRouter,
  opensearchRoutesService: OpenSearchRoutesService
): void {
  router.get(
    {
      path: `${CAT_INDICES_NODE_API_PATH}/{pattern}`,
      validate: {
        params: schema.object({
          pattern: schema.string(),
        }),
      },
    },
    opensearchRoutesService.catIndices
  );
}

export class OpenSearchRoutesService {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  catIndices = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { pattern } = req.params as { pattern: string };
    try {
      const response = await this.client
        .asScoped(req)
        .callAsCurrentUser('cat.indices', {
          index: pattern,
          format: 'json',
          h: 'health,index',
        });

      // re-formatting the index results to match Index
      const cleanedIndices = response.map((index: any) => ({
        name: index.index,
        health: index.health,
      })) as Index[];

      return res.ok({ body: cleanedIndices });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };
}
