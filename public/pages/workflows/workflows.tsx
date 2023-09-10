/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { EuiPageHeader, EuiText } from '@elastic/eui';
import { BREADCRUMBS } from '../../utils';
import { getCore } from '../../services';

export function Workflows() {
  useEffect(() => {
    getCore().chrome.setBreadcrumbs([
      BREADCRUMBS.AI_APPLICATION_BUILDER,
      BREADCRUMBS.WORKFLOWS,
    ]);
  });

  return (
    <EuiPageHeader>
      <EuiText>Workflows page placeholder...</EuiText>
    </EuiPageHeader>
  );
}
