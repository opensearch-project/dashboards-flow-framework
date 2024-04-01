/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiTitle } from '@elastic/eui';

interface GroupComponentProps {
  data: { label: string };
}

/**
 * A simple base component for grouping.
 * For more details on resizing, see https://reactflow.dev/examples/nodes/node-resizer
 */
export function GroupComponent(props: GroupComponentProps) {
  return (
    // TODO: investigate having custom bounds of child nodes to prevent
    // overlapping the group node title
    <EuiFlexGroup direction="column">
      <EuiFlexItem style={{ backgroundColor: 'transparent' }}>
        <EuiTitle size="l">
          <h2 style={{ marginLeft: '8px' }}>{props.data.label}</h2>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem></EuiFlexItem>
    </EuiFlexGroup>
  );
}
