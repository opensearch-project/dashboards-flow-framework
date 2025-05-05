/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { EuiFlexItem, EuiIcon } from '@elastic/eui';

interface DownArrowProps {
  isDisabled?: boolean;
}

/**
 * The base component for rendering the ingest-related components, including real-time provisioning / error states.
 */
export function DownArrow(props: DownArrowProps) {
  return (
    <EuiFlexItem grow={false} style={{ alignItems: 'center' }}>
      <EuiIcon
        type="sortDown"
        size="l"
        color={props.isDisabled ? 'subdued' : undefined}
      />
    </EuiFlexItem>
  );
}
