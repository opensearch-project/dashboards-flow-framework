/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexItem, EuiText } from '@elastic/eui';
import { USE_NEW_HOME_PAGE } from '../../../utils';
/**
 * Base component for rendering processor form inputs based on the processor type
 */

interface LeftNavProps {}

/**
 * The base left navigation component. Used as a lightweight preview of the ingest and search
 * flows, as well as a way to click and navigate to the individual components of the flows.
 */
export function LeftNav(props: LeftNavProps) {
  return (
    <EuiFlexItem
      grow={false}
      style={{
        marginTop: USE_NEW_HOME_PAGE ? '0' : '58px',
        height: USE_NEW_HOME_PAGE ? '100%' : 'calc(100% - 58px)',
        width: '500px',
        gap: '4px',
      }}
    >
      <EuiText size="s">Left nav</EuiText>
    </EuiFlexItem>
  );
}
