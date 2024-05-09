/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiText } from '@elastic/eui';
import { Workflow } from '../../../../common';

interface WorkflowInputsProps {
  workflow: Workflow | undefined;
}

/**
 * The workflow inputs component containing the multi-step flow to create ingest
 * and search flows for a particular workflow.
 */

export function WorkflowInputs(props: WorkflowInputsProps) {
  return (
    <EuiPanel paddingSize="m">
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiText>Hello world</EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
