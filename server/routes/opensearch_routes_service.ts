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
import { SEARCH_INDICES_PATH, FETCH_INDICES_PATH, Index } from '../../common';
import { generateCustomError } from './helpers';

export function registerOpenSearchRoutes(
  router: IRouter,
  opensearchRoutesService: OpenSearchRoutesService
): void {
  router.post(
    {
      path: `${SEARCH_INDICES_PATH}/{index_name}`,
      validate: {
        params: schema.object({
          index_name: schema.string(),
        }),
        body: schema.any(),
      },
    },
    opensearchRoutesService.searchIndex
  );

  router.post(
    {
      path: `${FETCH_INDICES_PATH}/{pattern}`,
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

  searchIndex = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { index_name } = req.params;
    const body = req.body;

    const params = {
      index: index_name,
      body,
    } as SearchRequest;

    try {
      const response = await this.client
        .asScoped(req)
        .callAsCurrentUser.search(params);
      return res.ok({ body: response });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  catIndices = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { pattern } = req.params;
    try {
      const response = await this.client
        .asScoped(req)
        .callAsCurrentUser.cat.indices({
          index: pattern,
          format: 'json',
          h: 'health,index',
        });

      // re-formatting the index results to match Index
      const cleanedIndices = response.body.map((index) => ({
        name: index.index,
        health: index.health,
      })) as Index[];

      return res.ok({ body: cleanedIndices });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };
}
