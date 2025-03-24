/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { BaseComponent } from '../base_component';
import { isKnnIndex } from '../../utils/utils';

/**
 * A basic search request placeholder UI component.
 * Does not have any functionality.
 */
export class SearchRequest extends BaseComponent {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.SEARCH_REQUEST;
    this.label = 'Query';
    this.description = 'Search request';
    this.outputs = [
      {
        id: 'search_request',
        label: '',
      },
    ];
  }

  /**
   * Validates if the index supports Knn if it is Knn query
   * @param query The current search query
   * @param indexSettings The settings of the selected index
   * @returns Object containing validation result and warning message if needed
   */
  validateKnnQueryToHaveValidKnnIndex(
    query: string,
    indexSettings: string
  ): {
    isValid: boolean;
    warningMessage?: string;
  } {
    try {
      const queryString =
        typeof query === 'string' ? query : JSON.stringify(query);
      const hasKnnQuery = this.isKnnQuery(queryString);

      if (hasKnnQuery) {
        const isKnnEnabled = isKnnIndex(indexSettings);

        if (!isKnnEnabled) {
          return {
            isValid: false,
            warningMessage:
              'Warning: You are using a neural/KNN query, but the selected index does not have KNN enabled (index.knn:true). Please select a KNN-enabled index for proper vector search functionality.',
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating KNN query:', error);
      return { isValid: true };
    }
  }

  /**
   * Determines if a query is a KNN query
   * @param queryString The query string to check
   * @returns boolean indicating if it's a KNN query
   */
  isKnnQuery(queryString: string): boolean {
    try {
      const query =
        typeof queryString === 'string' ? JSON.parse(queryString) : queryString;

      const queryAsString = JSON.stringify(query);

      const hasKnn = queryAsString.includes('"knn":{');
      const hasNeural = queryAsString.includes('"neural":{');

      console.log('KNN query detection:', { hasKnn, hasNeural, queryAsString });

      return hasKnn || hasNeural;
    } catch (error) {
      console.error('Error in isKnnQuery:', error);
      // Fallback to string-based detection
      return (
        queryString.includes('"knn":{') || queryString.includes('"neural":{')
      );
    }
  }
}
