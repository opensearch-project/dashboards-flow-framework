/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { i18n } from '@osd/i18n';
import { FormattedMessage, I18nProvider } from '@osd/i18n/react';
import {
  Route,
  RouteComponentProps,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';
import { Navigation, APP_PATH } from '../../common';
import { UseCases } from '../pages';

import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiTitle,
  EuiText,
  EuiPageSideBar,
  EuiSideNav,
} from '@elastic/eui';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PLUGIN_ID, PLUGIN_NAME } from '../../common';

interface Props extends RouteComponentProps {}

interface AiFlowDashboardsAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}

export const AiFlowDashboardsApp = ({
  basename,
  notifications,
  http,
  navigation,
}: AiFlowDashboardsAppDeps) => {
  // const sideNav = [
  //   {
  //     name: Navigation.AiApplicationBuilder,
  //     id: 0,
  //     href: `#${APP_PATH.USE_CASES}`,
  //     items: [
  //       {
  //         name: Navigation.UseCases,
  //         id: 1,
  //         href: `#${APP_PATH.USE_CASES}`,
  //         isSelected: props.location.pathname === APP_PATH.DASHBOARD,
  //       },
  //       {
  //         name: Navigation.Detectors,
  //         id: 2,
  //         href: `#${APP_PATH.LIST_DETECTORS}`,
  //         isSelected: props.location.pathname === APP_PATH.LIST_DETECTORS,
  //       },
  //     ],
  //   },
  // ];

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <EuiPage restrictWidth="1000px">
            {/* <EuiPageSideBar style={{ minWidth: 150 }} hidden={hideSideNavBar}>
              <EuiSideNav style={{ width: 150 }} items={sideNav} />
            </EuiPageSideBar> */}
            <EuiPageBody>
              <Switch>
                <Route
                  path={APP_PATH.USE_CASES}
                  render={(props: RouteComponentProps) => <UseCases />}
                />
              </Switch>
            </EuiPageBody>
          </EuiPage>
        </>
      </I18nProvider>
    </Router>
  );
};
