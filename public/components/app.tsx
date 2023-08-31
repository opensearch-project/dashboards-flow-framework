/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { EuiPage, EuiPageBody, EuiPageSideBar, EuiSideNav } from '@elastic/eui';
import { CoreStart } from '../../../../src/core/public';
import { Navigation, APP_PATH } from '../../common';
import { UseCases } from '../pages';
import { CoreServicesConsumer } from '../core_services';

interface Props extends RouteComponentProps {}

export const AiFlowDashboardsApp = (props: Props) => {
  const sideNav = [
    {
      name: Navigation.AiApplicationBuilder,
      id: 0,
      href: `#${APP_PATH.USE_CASES}`,
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
  ];

  // Render the application DOM.
  return (
    <CoreServicesConsumer>
      {(core: CoreStart | null) =>
        core && (
          <I18nProvider>
            <>
              <EuiPage restrictWidth="1000px">
                <EuiPageSideBar style={{ minWidth: 150 }} hidden={false}>
                  <EuiSideNav style={{ width: 150 }} items={sideNav} />
                </EuiPageSideBar>
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
        )
      }
    </CoreServicesConsumer>
  );
};
