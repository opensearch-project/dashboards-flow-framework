/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { EuiPageHeader, EuiText } from '@elastic/eui';
import { BREADCRUMBS } from '../../utils';
import { getCore } from '../../services';

export function UseCases() {
  useEffect(() => {
    getCore().chrome.setBreadcrumbs([
      BREADCRUMBS.AI_APPLICATION_BUILDER,
      BREADCRUMBS.USE_CASES,
    ]);
  });

  return (
    <EuiPageHeader>
      <EuiText>Use cases page placeholder...</EuiText>
    </EuiPageHeader>
  );
}
