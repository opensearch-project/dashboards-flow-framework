/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiHeader, EuiPage, EuiPageHeader, EuiText } from '@elastic/eui';

export function UseCases() {
  console.log('rendering useCases');
  return (
    <EuiPage>
      <EuiPageHeader>
        <EuiHeader>
          <EuiText>Put library of preset use cases here...</EuiText>
        </EuiHeader>
      </EuiPageHeader>
    </EuiPage>
  );
}
