/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, HttpFetchError } from '../../../src/core/public';
import { FETCH_INDICES_PATH, SEARCH_INDICES_PATH } from '../common';

export interface RouteService {
  searchIndex: (indexName: string, body: {}) => Promise<any | HttpFetchError>;
  fetchIndices: (pattern: string) => Promise<any | HttpFetchError>;
}

export function configureRoutes(core: CoreStart): RouteService {
  return {
    searchIndex: async (indexName: string, body: {}) => {
      try {
        const response = await core.http.get<{ respString: string }>(
          `${SEARCH_INDICES_PATH}/${indexName}`,
          {
            body: JSON.stringify(body),
          }
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
    fetchIndices: async (pattern: string) => {
      try {
        const response = await core.http.get<{ respString: string }>(
          `${FETCH_INDICES_PATH}/${pattern}`
        );
        return response;
      } catch (e: any) {
        return e as HttpFetchError;
      }
    },
  };
}
