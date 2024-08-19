/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule } from '@elastic/eui';
import { SourceData } from './source_data';
import { EnrichData } from './enrich_data';
import { IngestData } from './ingest_data';
import { WorkflowConfig } from '../../../../../common';

interface IngestInputsProps {
  setIngestDocs: (docs: string) => void;
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
}

/**
 * The base component containing all of the ingest-related inputs
 */
export function IngestInputs(props: IngestInputsProps) {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <SourceData setIngestDocs={props.setIngestDocs} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EnrichData uiConfig={props.uiConfig} setUiConfig={props.setUiConfig} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <IngestData />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
