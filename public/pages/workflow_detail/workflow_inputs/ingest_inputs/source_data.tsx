/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle } from '@elastic/eui';

interface SourceDataProps {}

/**
 * Input component for configuring the source data for ingest.
 */
export function SourceData(props: SourceDataProps) {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiTitle size="xs">
          <h4>Source data</h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText grow={false}>TODO</EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
