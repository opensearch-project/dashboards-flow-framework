/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle } from '@elastic/eui';

interface EnrichSearchRequestProps {}

/**
 * Input component for enriching a search request (configuring search request processors, etc.)
 */
export function EnrichSearchRequest(props: EnrichSearchRequestProps) {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiTitle size="xs">
          <h4>Enrich search request</h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText grow={false}>TODO</EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
