/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import {
  EuiPageSideBar,
  EuiSideNav,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { Navigation, APP_PATH } from './utils';
import {
  Workflows,
  WorkflowDetail,
  WorkflowDetailRouterProps,
  WorkflowsRouterProps,
} from './pages';
import { MountPoint } from '../../../src/core/public';
import queryString from 'query-string';
import { constructHrefWithDataSourceId } from './utils/utils';

// styling
import './global-styles.scss';

interface Props extends RouteComponentProps {
  setHeaderActionMenu: (menuMount?: MountPoint) => void;
}

export const FlowFrameworkDashboardsApp = (props: Props) => {
  const { setHeaderActionMenu } = props;
  const queryParams = queryString.parse(location.search) as {
    [key: string]: string;
  };
  const dataSourceId = queryParams.dataSourceId;
  const sidebar = (
    <EuiPageSideBar style={{ minWidth: 190 }} hidden={false} paddingSize="l">
      <EuiSideNav
        style={{ width: 190 }}
        items={[
          {
            name: Navigation.FlowFramework,
            id: 0,
            items: [
              {
                name: Navigation.Workflows,
                id: 1,
                href: constructHrefWithDataSourceId(
                  APP_PATH.WORKFLOWS,
                  dataSourceId,
                  true
                ),
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
    <EuiFlexGroup
      direction="row"
      gutterSize="none"
      className="stretch-relative"
    >
      <EuiFlexItem grow={false}>{sidebar}</EuiFlexItem>
      <EuiFlexItem>
        <Switch>
          <Route
            path={APP_PATH.WORKFLOW_DETAIL}
            render={(
              routeProps: RouteComponentProps<WorkflowDetailRouterProps>
            ) => (
              <WorkflowDetail
                setActionMenu={setHeaderActionMenu}
                landingDataSourceId={dataSourceId}
                {...routeProps}
              />
            )}
          />
          <Route
            path={APP_PATH.WORKFLOWS}
            render={(routeProps: RouteComponentProps<WorkflowsRouterProps>) => (
              <Workflows
                setActionMenu={setHeaderActionMenu}
                landingDataSourceId={dataSourceId}
                {...routeProps}
              />
            )}
          />
          {/*
        Defaulting to Workflows page. The pathname will need to be updated
        to handle the redirection and get the router props consistent.
        */}
          <Route
            path={`${APP_PATH.HOME}`}
            render={(routeProps: RouteComponentProps<WorkflowsRouterProps>) => {
              if (props.history.location.pathname !== APP_PATH.WORKFLOWS) {
                props.history.replace({
                  ...history,
                  pathname: APP_PATH.WORKFLOWS,
                });
              }
              return (
                <Workflows
                  setActionMenu={setHeaderActionMenu}
                  landingDataSourceId={dataSourceId}
                  {...routeProps}
                />
              );
            }}
          />
        </Switch>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
