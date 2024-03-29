/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiTitle } from '@elastic/eui';

interface GroupComponentProps {
  data: { label: string };
}

/**
 * A simple base component for grouping.
 * For more details on resizing, see https://reactflow.dev/examples/nodes/node-resizer
 */
export function GroupComponent(props: GroupComponentProps) {
  return (
    <>
      <EuiTitle size="l">
        <h2 style={{ marginLeft: '8px' }}>{props.data.label}</h2>
      </EuiTitle>
    </>
  );
}
