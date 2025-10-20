/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';

/**
 * Static content for next steps & how to use the resources in your application
 */
export function ExportApplicationContent() {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          This is a placeholder tab for additional application export options.
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
