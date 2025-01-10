/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiBadge } from '@elastic/eui';
import { NODE_SPACING, PARENT_NODE_HEIGHT } from '../../../../utils';

interface GroupComponentProps {
  data: { label: string };
  color: string;
}

/**
 * A simple base component for grouping.
 * For more details on resizing, see https://reactflow.dev/examples/nodes/node-resizer
 */
export function GroupComponent(props: GroupComponentProps) {
  return (
    <EuiFlexItem
      style={{
        paddingTop: `${PARENT_NODE_HEIGHT - NODE_SPACING - 10}px`,
        paddingLeft: NODE_SPACING,
      }}
    >
      <EuiFlexGroup style={{ backgroundColor: 'transparent' }}>
        <EuiFlexItem grow={false} style={{ backgroundColor: 'transparent' }}>
          <EuiBadge color={props.color}>{props.data.label}</EuiBadge>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  );
}
