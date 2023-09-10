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
import { SEARCH_PATH } from '../../common';

export function registerOpenSearchRoutes(router: IRouter): void {
  router.post(
    {
      path: `${SEARCH_PATH}/{index_name}`,
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
        return res.customError({
          statusCode: err.statusCode || 500,
          body: {
            message: err.message,
            attributes: {
              error: err.body?.error || err.message,
            },
          },
        });
      }
    }
  );
}
