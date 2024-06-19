/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiTitle } from '@elastic/eui';
import { IConfigField, WorkflowConfig } from '../../../../../common';
import { TextField } from '../input_fields';
import { AdvancedSettings } from './advanced_settings';

interface IngestDataProps {
  uiConfig: WorkflowConfig;
  onFormChange: () => void;
}

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
        <TextField
          field={props.uiConfig.ingest.index?.name as IConfigField}
          fieldPath={'ingest.index.name'}
          onFormChange={props.onFormChange}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <AdvancedSettings
          uiConfig={props.uiConfig}
          onFormChange={props.onFormChange}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
