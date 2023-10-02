/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { SearchRequest } from '@opensearch-project/opensearch/api/types';
import {
  IRouter,
  IOpenSearchDashboardsResponse,
} from '../../../../src/core/server';
import { SEARCH_INDICES_PATH, FETCH_INDICES_PATH, Index } from '../../common';
import { generateCustomError } from './helpers';

export function registerOpenSearchRoutes(router: IRouter): void {
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
    async (context, req, res): Promise<IOpenSearchDashboardsResponse<any>> => {
      const client = context.core.opensearch.client.asCurrentUser;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { index_name } = req.params;
      const body = req.body;

      const params = {
        index: index_name,
        body,
      } as SearchRequest;

      try {
        const response = await client.search(params);
        return res.ok({ body: response });
      } catch (err: any) {
        return generateCustomError(res, err);
      }
    }
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
    async (context, req, res): Promise<IOpenSearchDashboardsResponse<any>> => {
      const client = context.core.opensearch.client.asCurrentUser;
      const { pattern } = req.params;
      try {
        const response = await client.cat.indices({
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
    }
  );
}
