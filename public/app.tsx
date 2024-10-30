/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { APP_PATH } from './utils';
import {
  Workflows,
  WorkflowDetail,
  WorkflowDetailRouterProps,
  WorkflowsRouterProps,
} from './pages';
import { MountPoint } from '../../../src/core/public';

// styling
import './global-styles.scss';

interface Props extends RouteComponentProps {
  setHeaderActionMenu: (menuMount?: MountPoint) => void;
}

export const FlowFrameworkDashboardsApp = (props: Props) => {
  const { setHeaderActionMenu } = props;


  // Render the application DOM.
  return (
    <EuiFlexGroup
      direction="row"
      gutterSize="none"
      className="stretch-relative"
    >
      <EuiFlexItem>
        <Switch>
          <Route
            path={APP_PATH.WORKFLOW_DETAIL}
            render={(
              routeProps: RouteComponentProps<WorkflowDetailRouterProps>
            ) => (
              <WorkflowDetail
                setActionMenu={setHeaderActionMenu}
                {...routeProps}
              />
            )}
          />
          <Route
            path={APP_PATH.WORKFLOWS}
            render={(routeProps: RouteComponentProps<WorkflowsRouterProps>) => (
              <Workflows setActionMenu={setHeaderActionMenu} {...routeProps} />
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
