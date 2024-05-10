/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle } from '@elastic/eui';

interface EnrichDataProps {}

/**
 * Input component for configuring any data enrichment for ingest (ingest pipeline processors etc.)
 */
export function EnrichData(props: EnrichDataProps) {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiTitle size="xs">
          <h4>Enrich data</h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText grow={false}>TODO</EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
