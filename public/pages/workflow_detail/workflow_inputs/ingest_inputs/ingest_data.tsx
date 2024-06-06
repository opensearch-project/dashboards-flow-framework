/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiRadioGroup,
  EuiTitle,
} from '@elastic/eui';
import { IConfigField, Workflow } from '../../../../../common';
import { SelectField, TextField } from '../input_fields';

interface IngestDataProps {
  workflow: Workflow;
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
          field={
            props.workflow.ui_metadata?.config?.ingest?.index
              ?.name as IConfigField
          }
          fieldPath={'ingest.index.name'}
          onFormChange={props.onFormChange}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
