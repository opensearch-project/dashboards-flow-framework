/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { EuiPageHeader, EuiText } from '@elastic/eui';
import { CoreServicesContext } from '../../core_services';
import { CoreStart } from '../../../../../src/core/public';
import { BREADCRUMBS } from '../../utils';

export function Overview() {
  const core = React.useContext(CoreServicesContext) as CoreStart;
  useEffect(() => {
    core.chrome.setBreadcrumbs([BREADCRUMBS.AI_APPLICATION_BUILDER]);
  });

  return (
    <EuiPageHeader>
      <EuiText>Welcome to the AI Application Builder!</EuiText>
    </EuiPageHeader>
  );
}
