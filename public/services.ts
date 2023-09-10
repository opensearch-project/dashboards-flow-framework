/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createGetterSetter } from '../../../src/plugins/opensearch_dashboards_utils/public';
import { CoreStart } from '../../../src/core/public';
import { RouteService } from './route_service';

export const [getCore, setCore] = createGetterSetter<CoreStart>('Core');

export const [getRouteService, setRouteService] = createGetterSetter<
  RouteService
>('');
