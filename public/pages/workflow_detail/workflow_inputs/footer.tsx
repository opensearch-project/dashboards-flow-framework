/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
} from '@elastic/eui';
import { CREATE_STEP } from './workflow_inputs';

interface FooterProps {
  selectedStep: CREATE_STEP;
  setSelectedStep: (step: CREATE_STEP) => void;
}

/**
 * The footer component containing the navigation buttons.
 */
export function Footer(props: FooterProps) {
  return (
    <EuiFlexGroup direction="column" gutterSize="none">
      <EuiFlexItem>
        <EuiHorizontalRule margin="m" />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup direction="row" justifyContent="flexEnd">
          {props.selectedStep === CREATE_STEP.INGEST ? (
            <EuiFlexItem grow={false}>
              <EuiButton
                onClick={() => props.setSelectedStep(CREATE_STEP.SEARCH)}
              >
                Next
              </EuiButton>
            </EuiFlexItem>
          ) : (
            <>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={() => props.setSelectedStep(CREATE_STEP.INGEST)}
                >
                  Back
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  disabled={true}
                  onClick={() =>
                    // TODO: implement creation
                    console.log('Placeholder for workflow creation...')
                  }
                >
                  Create
                </EuiButton>
              </EuiFlexItem>
            </>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
