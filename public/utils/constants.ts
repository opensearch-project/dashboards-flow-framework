/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

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
  WORKFLOWS: { text: 'Workflows', href: `#${APP_PATH.WORKFLOWS}` },
});
