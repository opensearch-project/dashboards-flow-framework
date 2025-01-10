/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiBadge } from '@elastic/eui';
import { PARENT_NODE_HEIGHT } from '../../../../utils';

interface GroupComponentProps {
  data: { label: string };
}

/**
 * A simple base component for grouping.
 * For more details on resizing, see https://reactflow.dev/examples/nodes/node-resizer
 */
export function GroupComponent(props: GroupComponentProps) {
  return (
    <EuiFlexItem
      style={{ paddingTop: `${PARENT_NODE_HEIGHT - 40}px`, paddingLeft: 20 }}
    >
      <EuiFlexGroup style={{ backgroundColor: 'transparent' }}>
        <EuiFlexItem grow={false} style={{ backgroundColor: 'transparent' }}>
          <EuiBadge>{props.data.label}</EuiBadge>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  );
}
