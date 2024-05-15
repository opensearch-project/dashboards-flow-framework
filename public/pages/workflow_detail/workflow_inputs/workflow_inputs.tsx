/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiLoadingSpinner,
  EuiPanel,
  EuiTitle,
} from '@elastic/eui';
import { Workflow, WorkflowFormValues } from '../../../../common';
import { IngestInputs } from './ingest_inputs';
import { SearchInputs } from './search_inputs';
import { FormikProps } from 'formik';

interface WorkflowInputsProps {
  workflow: Workflow | undefined;
  formikProps: FormikProps<WorkflowFormValues>;
  onFormChange: () => void;
  validateAndSubmit: (formikProps: FormikProps<WorkflowFormValues>) => void;
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
          style={{
            height: '100%',
          }}
        >
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h4>{selectedStep}</h4>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem
            grow={true}
            style={{ overflowY: 'scroll', maxHeight: '55vh' }}
          >
            {selectedStep === CREATE_STEP.INGEST ? (
              <IngestInputs
                workflow={props.workflow}
                onFormChange={props.onFormChange}
              />
            ) : (
              <SearchInputs workflow={props.workflow} />
            )}
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="column" gutterSize="none">
              <EuiFlexItem>
                <EuiHorizontalRule margin="m" />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFlexGroup direction="row" justifyContent="flexEnd">
                  {selectedStep === CREATE_STEP.INGEST ? (
                    <EuiFlexItem grow={false}>
                      <EuiButton
                        onClick={() => setSelectedStep(CREATE_STEP.SEARCH)}
                      >
                        Next
                      </EuiButton>
                    </EuiFlexItem>
                  ) : (
                    <>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          onClick={() => setSelectedStep(CREATE_STEP.INGEST)}
                        >
                          Back
                        </EuiButton>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          disabled={false}
                          onClick={() => {
                            console.log('creating...');
                            props.validateAndSubmit(props.formikProps);
                          }}
                        >
                          Create
                        </EuiButton>
                      </EuiFlexItem>
                    </>
                  )}
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </EuiPanel>
  );
}
