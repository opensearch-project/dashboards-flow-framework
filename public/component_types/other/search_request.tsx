/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS } from '../../../common';
import { BaseComponent } from '../base_component';
import { isKnnIndex, isKnnQuery } from '../../utils/utils';

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
      const hasKnnQuery = isKnnQuery(queryString);

      if (hasKnnQuery) {
        const isKnnEnabled = isKnnIndex(indexSettings);

        if (!isKnnEnabled) {
          return {
            isValid: false,
            warningMessage:
              'Warning: The selected index does not have KNN enabled. Please selecte a KNN enabled index.',
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating KNN query:', error);
      return { isValid: true };
    }
  }
}
