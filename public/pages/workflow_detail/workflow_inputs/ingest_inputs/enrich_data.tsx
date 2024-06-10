/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiTitle } from '@elastic/eui';
import { ProcessorsList } from './processors_list';
import { WorkflowConfig } from '../../../../../common';

interface EnrichDataProps {
  onFormChange: () => void;
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
}

/**
 * Base component for configuring any data enrichment
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
        <ProcessorsList
          onFormChange={props.onFormChange}
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
