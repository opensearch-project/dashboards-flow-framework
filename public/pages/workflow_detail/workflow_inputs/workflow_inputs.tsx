/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FormikProps } from 'formik';
import {
  EuiButton,
  EuiButtonEmpty,
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
import { useAppDispatch } from '../../../store';

// styling
import '../workspace/workspace-styles.scss';

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
  const dispatch = useAppDispatch();

  // selected step state
  const [selectedStep, setSelectedStep] = useState<CREATE_STEP>(
    CREATE_STEP.INGEST
  );

  // ingestion data state. We need to persist separately from the form, since
  // we do not need/want to persist this in form state or in backend
  const [ingestDocs, setIngestDocs] = useState<{}[]>([]);

  // TODO: running props.validateAndSubmit(props.formikProps) will need to be ran before every ingest and
  // search, if the form is dirty / values have changed. This will update the workflow if needed.
  // Note that the temporary data (the ingest docs and the search query) will not need to be persisted
  // in the form (need to confirm if query-side / using search template, will need to persist something)
  function validateAndRunIngestion(): void {
    console.log('running ingestion...');
    try {
      props.validateAndSubmit(props.formikProps);
      const indexName = props.formikProps.values.ingest.index.name;
      const doc = ingestDocs[0];
      // dispatch(ingest({ index: indexName, doc: docObj }))
      //   .unwrap()
      //   .then(async (resp) => {
      //     //setResponse(result);
      //     console.log('response: ', resp);
      //   })
      //   .catch((error: any) => {
      //     getCore().notifications.toasts.addDanger(error);
      //     // setResponse({});
      //     console.log('error: ', error);
      //   });
    } catch (err) {
      console.log('error: ', err);
    }
  }

  function validateAndRunQuery(): void {
    console.log('running query...');
    props.validateAndSubmit(props.formikProps);
  }

  return (
    <EuiPanel paddingSize="m" grow={true} className="workspace-panel">
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
            style={{
              overflowY: 'scroll',
              overflowX: 'hidden',
            }}
          >
            {selectedStep === CREATE_STEP.INGEST ? (
              <IngestInputs
                workflow={props.workflow}
                onFormChange={props.onFormChange}
                ingestDocs={ingestDocs}
                setIngestDocs={setIngestDocs}
              />
            ) : (
              <SearchInputs workflow={props.workflow} />
            )}
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ marginBottom: '-10px' }}>
            <EuiFlexGroup direction="column" gutterSize="none">
              <EuiFlexItem>
                <EuiHorizontalRule margin="m" />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFlexGroup direction="row" justifyContent="flexEnd">
                  {selectedStep === CREATE_STEP.INGEST ? (
                    <>
                      <EuiFlexItem grow={false}>
                        <EuiButtonEmpty
                          onClick={() => setSelectedStep(CREATE_STEP.SEARCH)}
                        >
                          Skip
                        </EuiButtonEmpty>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          fill={true}
                          onClick={() => {
                            validateAndRunIngestion();
                          }}
                        >
                          Run ingestion
                        </EuiButton>
                      </EuiFlexItem>
                    </>
                  ) : (
                    <>
                      <EuiFlexItem grow={false}>
                        <EuiButtonEmpty
                          onClick={() => setSelectedStep(CREATE_STEP.INGEST)}
                        >
                          Back
                        </EuiButtonEmpty>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          disabled={false}
                          onClick={() => {
                            validateAndRunQuery();
                          }}
                        >
                          Run query
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
