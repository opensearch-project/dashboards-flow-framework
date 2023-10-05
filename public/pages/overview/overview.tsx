/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageContent,
  EuiText,
} from '@elastic/eui';
import { BREADCRUMBS } from '../../utils';
import { getCore } from '../../services';

export function Overview() {
  useEffect(() => {
    getCore().chrome.setBreadcrumbs([
      BREADCRUMBS.AI_APPLICATION_BUILDER,
      BREADCRUMBS.OVERVIEW,
    ]);
  });

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader pageTitle="Overview" />

        <EuiPageContent>
          <EuiText>TODO: Put overview details here...</EuiText>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
}
