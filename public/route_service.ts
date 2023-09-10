/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, HttpFetchError } from '../../../src/core/public';
import { SEARCH_PATH } from '../common';

export interface RouteService {
  searchIndex: (indexName: string, body: {}) => Promise<any | HttpFetchError>;
}

export function configureRoutes(core: CoreStart): RouteService {
  return {
    searchIndex: async (indexName: string, body: {}) => {
      try {
        const response = await core.http.post<{ respString: string }>(
          `${SEARCH_PATH}/${indexName}`,
          {
            body: JSON.stringify(body),
          }
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
  };
}
