/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import { MDSQueryParams } from 'server/types';
import { getDataSourceEnabled} from '../services';
import queryString from 'query-string';


export const getDataSourceFromURL = (location: {
    search: string;
  }): MDSQueryParams => {
    const queryParams = queryString.parse(location.search);
    const dataSourceId = queryParams.dataSourceId;
    return { dataSourceId: typeof dataSourceId === 'string' ? dataSourceId : '' };
  };

export const constructHrefWithDataSourceId = (
    basePath: string,
    dataSourceId: string = '',
    withHash: Boolean
  ): string => {
    const dataSourceEnabled = getDataSourceEnabled().enabled;
    const url = new URLSearchParams();
    if (dataSourceEnabled && dataSourceId !== undefined) {
      url.set('dataSourceId', dataSourceId);
    }
    // we share this helper function to construct the href with dataSourceId
    // some places we need to return the url with hash, some places we don't need to
    // so adding this flag to indicate if we want to return the url with hash
    if (withHash) {
      return `#${basePath}?${url.toString()}`;
    }
    return `${basePath}?${url.toString()}`;
  };
