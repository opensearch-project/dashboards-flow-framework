/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { constructHrefWithDataSourceId } from './utils';
import { getUISettings } from '../../public/services';
import { SEARCH_STUDIO } from '../../common/constants';

export enum Navigation {
  FlowFramework = 'Flow Framework',
  Workflows = 'Workflows',
}

export enum APP_PATH {
  HOME = '/',
  WORKFLOWS = '/workflows',
  WORKFLOW_DETAIL = '/workflows/:workflowId',
}

export const BREADCRUMBS = Object.freeze({
  FLOW_FRAMEWORK: { text: 'Flow Framework' },
  WORKFLOWS: (dataSourceId?: string) => ({
    text: 'Workflows',
    href: constructHrefWithDataSourceId(APP_PATH.WORKFLOWS, dataSourceId),
  }),
  TITLE: { text: SEARCH_STUDIO },
  TITLE_WITH_REF: (dataSourceId?: string) => ({
    text: SEARCH_STUDIO,
    href: constructHrefWithDataSourceId(APP_PATH.WORKFLOWS, dataSourceId),
  }),
  WORKFLOW_NAME: (workflowName: string) => ({
    text: workflowName,
  }),
});

export const SHOW_ACTIONS_IN_HEADER = getUISettings().get(
  'home:useNewHomePage'
);
