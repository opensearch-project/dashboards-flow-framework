/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle } from '@elastic/eui';

interface IngestDataProps {}

/**
 * Input component for configuring the data ingest (the OpenSearch index)
 */
export function IngestData(props: IngestDataProps) {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiTitle size="xs">
          <h4>Ingest data</h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText grow={false}>TODO</EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
