/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { EuiPageSideBar, EuiSideNav, EuiPageTemplate } from '@elastic/eui';
import { Navigation, APP_PATH } from './utils';
import {
  Overview,
  UseCases,
  Workflows,
  WorkflowDetail,
  WorkflowDetailRouterProps,
} from './pages';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends RouteComponentProps {}

export const AiFlowDashboardsApp = (props: Props) => {
  const sidebar = (
    <EuiPageSideBar style={{ minWidth: 190 }} hidden={false}>
      <EuiSideNav
        style={{ width: 190 }}
        items={[
          {
            name: Navigation.AiApplicationBuilder,
            id: 0,
            items: [
              {
                name: Navigation.UseCases,
                id: 1,
                href: `#${APP_PATH.USE_CASES}`,
                isSelected: props.location.pathname === APP_PATH.USE_CASES,
              },
              {
                name: Navigation.Workflows,
                id: 2,
                href: `#${APP_PATH.WORKFLOWS}`,
                isSelected: props.location.pathname === APP_PATH.WORKFLOWS,
              },
            ],
          },
        ]}
      />
    </EuiPageSideBar>
  );

  // Render the application DOM.
  return (
    <EuiPageTemplate
      template="empty"
      pageContentProps={{ paddingSize: 'm' }}
      pageSideBar={sidebar}
    >
      <Switch>
        <Route
          path={APP_PATH.USE_CASES}
          render={(routeProps: RouteComponentProps) => <UseCases />}
        />
        <Route
          path={APP_PATH.WORKFLOW_DETAIL}
          render={(
            routeProps: RouteComponentProps<WorkflowDetailRouterProps>
          ) => <WorkflowDetail {...routeProps} />}
        />
        <Route
          path={APP_PATH.WORKFLOWS}
          render={(routeProps: RouteComponentProps) => <Workflows />}
        />
        {/* Defaulting to Overview page */}
        <Route
          path={`${APP_PATH.HOME}`}
          render={(routeProps: RouteComponentProps) => <Overview />}
        />
      </Switch>
    </EuiPageTemplate>
  );
};
