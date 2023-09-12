/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { EuiPageHeader, EuiText } from '@elastic/eui';
import { BREADCRUMBS } from '../../utils';
import { getCore } from '../../services';

export function Overview() {
  useEffect(() => {
    getCore().chrome.setBreadcrumbs([BREADCRUMBS.AI_APPLICATION_BUILDER]);
  });

  return (
    <EuiPageHeader>
      <EuiText>Welcome to the AI Application Builder!</EuiText>
    </EuiPageHeader>
  );
}
