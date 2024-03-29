/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiText,
  EuiTitle,
  EuiButtonIcon,
  EuiPanel,
} from '@elastic/eui';
interface PlaceholderComponentProps {}

/**
 * A placeholder component used when users drag and drop a component into the workspace.
 * If it is not eligible, it is removed.
 */
export function PlaceholderComponent(props: PlaceholderComponentProps) {
  return (
    <EuiFlexItem>
      <div>
        <EuiPanel></EuiPanel>
      </div>
    </EuiFlexItem>
  );
}
