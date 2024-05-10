/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiPanel,
  EuiTitle,
} from '@elastic/eui';
import { Workflow } from '../../../../common';
import { Footer } from './footer';
import { IngestInputs } from './ingest_inputs';
import { SearchInputs } from './search_inputs';

interface WorkflowInputsProps {
  workflow: Workflow | undefined;
}

export enum CREATE_STEP {
  INGEST = 'Step 1: Define ingestion pipeline',
  SEARCH = 'Step 2: Define search pipeline',
}

/**
 * The workflow inputs component containing the multi-step flow to create ingest
 * and search flows for a particular workflow.
 */

export function WorkflowInputs(props: WorkflowInputsProps) {
  const [selectedStep, setSelectedStep] = useState<CREATE_STEP>(
    CREATE_STEP.INGEST
  );

  useEffect(() => {}, [selectedStep]);

  return (
    <EuiPanel paddingSize="m">
      {props.workflow === undefined ? (
        <EuiLoadingSpinner size="xl" />
      ) : (
        <EuiFlexGroup
          direction="column"
          justifyContent="spaceBetween"
          style={{ height: '100%', paddingBottom: '48px' }}
        >
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h4>{selectedStep}</h4>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            {selectedStep === CREATE_STEP.INGEST ? (
              <IngestInputs workflow={props.workflow} />
            ) : (
              <SearchInputs workflow={props.workflow} />
            )}
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Footer
              selectedStep={selectedStep}
              setSelectedStep={setSelectedStep}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </EuiPanel>
  );
}
