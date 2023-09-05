/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from '../../../../src/core/server';
import { BASE_NODE_API_PATH } from '../../common';

export function defineRoutes(router: IRouter) {
  router.get(
    {
      path: BASE_NODE_API_PATH,
      validate: false,
    },
    async (context, request, response) => {
      return response.ok({
        body: {
          time: new Date().toISOString(),
        },
      });
    }
  );
}
