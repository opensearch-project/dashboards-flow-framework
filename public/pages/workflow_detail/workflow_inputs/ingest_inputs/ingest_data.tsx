/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiTitle } from '@elastic/eui';
import { TextField } from '../input_fields';
import { AdvancedSettings } from './advanced_settings';

interface IngestDataProps {}

/**
 * Input component for configuring the data ingest (the OpenSearch index)
 */
export function IngestData(props: IngestDataProps) {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h2>Ingest data</h2>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem>
        <TextField label="Index name" fieldPath={'ingest.index.name'} />
      </EuiFlexItem>
      <EuiFlexItem>
        <AdvancedSettings />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
