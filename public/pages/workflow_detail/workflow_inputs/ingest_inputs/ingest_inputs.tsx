/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule } from '@elastic/eui';
import { SourceData } from './source_data';
import { EnrichData } from './enrich_data';
import { IngestData } from './ingest_data';
import { Workflow } from '../../../../../common';

interface IngestInputsProps {
  workflow: Workflow;
  onFormChange: () => void;
}

/**
 * The base component containing all of the ingest-related inputs
 */
export function IngestInputs(props: IngestInputsProps) {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <SourceData />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EnrichData
          workflow={props.workflow}
          onFormChange={props.onFormChange}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <IngestData workflow={props.workflow} />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
