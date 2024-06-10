/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFormikContext } from 'formik';
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
import {
  Workflow,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../common';
import { IngestInputs } from './ingest_inputs';
import { SearchInputs } from './search_inputs';
import {
  deprovisionWorkflow,
  ingest,
  provisionWorkflow,
  updateWorkflow,
  useAppDispatch,
} from '../../../store';
import { getCore } from '../../../services';
import { formikToUiConfig, reduceToTemplate } from '../../../utils';
import { configToTemplateFlows } from '../utils';

// styling
import '../workspace/workspace-styles.scss';

interface WorkflowInputsProps {
  workflow: Workflow | undefined;
  onFormChange: () => void;
  uiConfig: WorkflowConfig | undefined;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setIngestResponse: (ingestResponse: string) => void;
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
  const { submitForm, validateForm, values } = useFormikContext<
    WorkflowFormValues
  >();
  const dispatch = useAppDispatch();

  // selected step state
  const [selectedStep, setSelectedStep] = useState<CREATE_STEP>(
    CREATE_STEP.INGEST
  );

  // ingest state
  const [ingestDocs, setIngestDocs] = useState<{}[]>([]);

  // Utility fn to update the workflow, including any updated/new resources
  // Eventually, should be able to use fine-grained provisioning to do a single API call
  // instead of the currently-implemented deprovision -> update -> provision
  async function updateWorkflowAndResources(
    updatedWorkflow: Workflow
  ): Promise<boolean> {
    let success = false;
    await dispatch(deprovisionWorkflow(updatedWorkflow.id as string))
      .unwrap()
      .then(async (result) => {
        await dispatch(
          updateWorkflow({
            workflowId: updatedWorkflow.id as string,
            workflowTemplate: reduceToTemplate(updatedWorkflow),
          })
        )
          .unwrap()
          .then(async (result) => {
            await dispatch(provisionWorkflow(updatedWorkflow.id as string))
              .unwrap()
              .then((result) => {
                success = true;
              })
              .catch((error: any) => {
                console.error('Error provisioning updated workflow: ', error);
              });
          })
          .catch((error: any) => {
            console.error('Error updating workflow: ', error);
          });
      })
      .catch((error: any) => {
        console.error('Error deprovisioning workflow: ', error);
      });
    return success;
  }

  // Utility fn to validate the form and update the workflow if valid
  async function validateAndUpdateWorkflow(): Promise<boolean> {
    let success = false;
    // Submit the form to bubble up any errors.
    // Ideally we handle Promise accept/rejects with submitForm(), but there is
    // open issues for that - see https://github.com/jaredpalmer/formik/issues/2057
    // The workaround is to additionally execute validateForm() which will return any errors found.
    submitForm();
    await validateForm()
      .then(async (validationResults: {}) => {
        if (Object.keys(validationResults).length > 0) {
          console.error('Form invalid');
        } else {
          const updatedConfig = formikToUiConfig(
            values,
            props.uiConfig as WorkflowConfig
          );
          const updatedWorkflow = {
            ...props.workflow,
            ui_metadata: {
              ...props.workflow?.ui_metadata,
              config: updatedConfig,
            },
            workflows: configToTemplateFlows(updatedConfig),
          } as Workflow;
          success = await updateWorkflowAndResources(updatedWorkflow);
        }
      })
      .catch((error) => {
        console.error('Error validating form: ', error);
      });

    return success;
  }

  // TODO: running props.validateAndSubmit() will need to be ran before every ingest and
  // search, if the form is dirty / values have changed. This will update the workflow if needed.
  // Note that the temporary data (the ingest docs and the search query) will not need to be persisted
  // in the form (need to confirm if query-side / using search template, will need to persist something)
  async function validateAndRunIngestion(): Promise<boolean> {
    let success = false;
    try {
      success = await validateAndUpdateWorkflow();
      if (success && ingestDocs.length > 0) {
        const indexName = values.ingest.index.name;
        const doc = ingestDocs[0];
        dispatch(ingest({ index: indexName, doc }))
          .unwrap()
          .then(async (resp) => {
            props.setIngestResponse(JSON.stringify(resp, undefined, 2));
          })
          .catch((error: any) => {
            getCore().notifications.toasts.addDanger(error);
            props.setIngestResponse('');
            throw error;
          });
      }
    } catch (error) {
      console.error('Error ingesting documents: ', error);
    }

    return success;
  }

  function validateAndRunQuery(): void {
    console.log('running query...');
    validateAndUpdateWorkflow();
  }

  return (
    <EuiPanel paddingSize="m" grow={true} className="workspace-panel">
      {props.uiConfig === undefined ? (
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
                onFormChange={props.onFormChange}
                ingestDocs={ingestDocs}
                setIngestDocs={setIngestDocs}
                uiConfig={props.uiConfig}
                setUiConfig={props.setUiConfig}
              />
            ) : (
              <SearchInputs uiConfig={props.uiConfig} />
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
