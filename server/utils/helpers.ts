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


import { isEmpty } from 'lodash';
import {
  ILegacyClusterClient,
  LegacyCallAPIOptions,
  OpenSearchDashboardsRequest,
  RequestHandlerContext,
} from '../../../../src/core/server';


export function getClientBasedOnDataSource(
  context: RequestHandlerContext,
  dataSourceEnabled: boolean,
  request: OpenSearchDashboardsRequest,
  dataSourceId: string,
  client: ILegacyClusterClient
): (
  endpoint: string,
  clientParams?: Record<string, any>,
  options?: LegacyCallAPIOptions
) => any {

  if (dataSourceEnabled && dataSourceId && dataSourceId.trim().length != 0) {
    // client for remote cluster
    return context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI;
  } else {
    // fall back to default local cluster
    return client.asScoped(request).callAsCurrentUser;
  }
}
const PERMISSIONS_ERROR_PATTERN =
  /no permissions for \[(.+)\] and User \[name=(.+), backend_roles/;

export const prettifyErrorMessage = (rawErrorMessage: string) => {
  if (isEmpty(rawErrorMessage) || rawErrorMessage === 'undefined') {
    return 'Unknown error is returned.';
  }
  const match = rawErrorMessage.match(PERMISSIONS_ERROR_PATTERN);
  if (isEmpty(match)) {
    return rawErrorMessage;
  } else {
    return `User ${match[2]} has no permissions to [${match[1]}].`;
  }
};
  