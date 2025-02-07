/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { constructHrefWithDataSourceId } from './utils';
import { getUISettings } from '../../public/services';
import { PLUGIN_NAME } from '../../common/constants';

export enum Navigation {
  PluginName = PLUGIN_NAME,
  Workflows = 'Workflows',
}

export enum APP_PATH {
  HOME = '/',
  WORKFLOWS = '/workflows',
  WORKFLOW_DETAIL = '/workflows/:workflowId',
}

export const BREADCRUMBS = Object.freeze({
  PLUGIN_NAME: { text: PLUGIN_NAME },
  WORKFLOWS: (dataSourceId?: string) => ({
    text: 'Workflows',
    href: constructHrefWithDataSourceId(APP_PATH.WORKFLOWS, dataSourceId),
  }),
  TITLE: { text: PLUGIN_NAME },
  TITLE_WITH_REF: (dataSourceId?: string) => ({
    text: PLUGIN_NAME,
    href: constructHrefWithDataSourceId(APP_PATH.WORKFLOWS, dataSourceId),
  }),
  WORKFLOW_NAME: (workflowName: string) => ({
    text: workflowName,
  }),
});

export const USE_NEW_HOME_PAGE = getUISettings().get('home:useNewHomePage');

export const getAppBasePath = () => {
  const currentPath = window.location.pathname;
  return currentPath.substring(0, currentPath.indexOf('/app/'));
};
