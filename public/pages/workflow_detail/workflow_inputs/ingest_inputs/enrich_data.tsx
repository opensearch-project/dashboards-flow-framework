/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiTitle } from '@elastic/eui';
import { ProcessorsList } from './processors_list';
import { Workflow } from '../../../../../common';

interface EnrichDataProps {
  workflow: Workflow;
  onFormChange: () => void;
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
          workflow={props.workflow}
          onFormChange={props.onFormChange}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
