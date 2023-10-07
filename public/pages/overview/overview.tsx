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

/**
 * The overview page. This contains a detailed description on what
 * this plugin offers, and links to different resources (blogs, demos,
 * documentation, etc.)
 *
 * This may be hidden for the initial release until we have sufficient content
 * such that this page adds enough utility & user value.
 */
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
