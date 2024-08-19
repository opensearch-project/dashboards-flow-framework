/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createGetterSetter } from '../../../src/plugins/opensearch_dashboards_utils/public';
import {
  CoreStart,
  NotificationsStart,
  IUiSettingsClient,
  AppMountParameters,
} from '../../../src/core/public';
import { RouteService } from './route_service';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface DataSourceEnabled {
  enabled: boolean;
}

export const [getCore, setCore] = createGetterSetter<CoreStart>('Core');

export const [getRouteService, setRouteService] = createGetterSetter<
  RouteService
>('');

export const [
  getSavedObjectsClient,
  setSavedObjectsClient,
] = createGetterSetter<CoreStart['savedObjects']['client']>(
  'SavedObjectsClient'
);

export const [
  getDataSourceManagementPlugin,
  setDataSourceManagementPlugin,
] = createGetterSetter<DataSourceManagementPluginSetup>('DataSourceManagement');

export const [getDataSourceEnabled, setDataSourceEnabled] = createGetterSetter<
  DataSourceEnabled
>('DataSourceEnabled');

export const [getNotifications, setNotifications] = createGetterSetter<
  NotificationsStart
>('Notifications');

export const [getUISettings, setUISettings] = createGetterSetter<
  IUiSettingsClient
>('UISettings');

export const [getApplication, setApplication] = createGetterSetter<
  CoreStart['application']
>('Application');

export const [getNavigationUI, setNavigationUI] = createGetterSetter<
  NavigationPublicPluginStart['ui']
>('Navigation');

export const [getHeaderActionMenu, setHeaderActionMenu] = createGetterSetter<
  AppMountParameters['setHeaderActionMenu']
>('SetHeaderActionMenu');
