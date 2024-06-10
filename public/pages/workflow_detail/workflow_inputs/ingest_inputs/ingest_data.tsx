/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiTitle } from '@elastic/eui';
import { IConfigField, WorkflowConfig } from '../../../../../common';
import { SelectField, TextField } from '../input_fields';

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
        <EuiTitle size="xs">
          <h4>Ingest data</h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem>
        <TextField
          field={props.uiConfig.ingest.index?.name as IConfigField}
          fieldPath={'ingest.index.name'}
          onFormChange={props.onFormChange}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
