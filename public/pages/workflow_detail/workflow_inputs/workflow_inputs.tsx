/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSpacer,
  EuiStepsHorizontal,
  EuiText,
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
  getWorkflow,
  ingest,
  provisionWorkflow,
  searchIndex,
  updateWorkflow,
  useAppDispatch,
} from '../../../store';
import { getCore } from '../../../services';
import {
  formikToUiConfig,
  reduceToTemplate,
  configToTemplateFlows,
  hasProvisionedIngestResources,
} from '../../../utils';
import { BooleanField } from './input_fields';
import { ExportOptions } from './export_options';

// styling
import '../workspace/workspace-styles.scss';

interface WorkflowInputsProps {
  workflow: Workflow | undefined;
  onFormChange: () => void;
  uiConfig: WorkflowConfig | undefined;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setIngestResponse: (ingestResponse: string) => void;
  setQueryResponse: (queryResponse: string) => void;
  ingestDocs: string;
  setIngestDocs: (docs: string) => void;
  query: string;
  setQuery: (query: string) => void;
}

enum STEP {
  INGEST = 'Ingestion pipeline',
  SEARCH = 'Search pipeline',
  EXPORT = 'Export',
}

enum INGEST_OPTION {
  CREATE = 'create',
  SKIP = 'skip',
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
  const [selectedStep, setSelectedStep] = useState<STEP>(STEP.INGEST);

  // ingest state
  const [ingestProvisioned, setIngestProvisioned] = useState<boolean>(false);

  // maintain global states
  const onIngest = selectedStep === STEP.INGEST;
  const onSearch = selectedStep === STEP.SEARCH;
  const onExport = selectedStep === STEP.EXPORT;
  const ingestEnabled = values?.ingest?.enabled || false;
  const onIngestAndProvisioned = onIngest && ingestProvisioned;
  const onIngestAndUnprovisioned = onIngest && !ingestProvisioned;
  const onIngestAndDisabled = onIngest && !ingestEnabled;

  useEffect(() => {
    setIngestProvisioned(hasProvisionedIngestResources(props.workflow));
  }, [props.workflow]);

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
                // Kicking off an async task to re-fetch the workflow details
                // after some amount of time. Provisioning will finish in an indeterminate
                // amount of time and may be long and expensive; we add this single
                // auto-fetching to cover the majority of provisioning updates which
                // are inexpensive and will finish within milliseconds.
                new Promise((f) => setTimeout(f, 1000)).then(async () => {
                  dispatch(getWorkflow(updatedWorkflow.id as string));
                });
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
          // TODO: may want to persist more fine-grained form validation (ingest vs. search)
          // For example, running an ingest should be possible, even with some
          // invalid query or search processor config. And vice versa.
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

  async function validateAndRunIngestion(): Promise<boolean> {
    let success = false;
    try {
      let ingestDocsObjs = [] as {}[];
      try {
        // TODO: test with multiple objs, make sure parsing logic works
        const ingestDocObj = JSON.parse(props.ingestDocs);
        ingestDocsObjs = [ingestDocObj];
      } catch (e) {}
      if (ingestDocsObjs.length > 0 && !isEmpty(ingestDocsObjs[0])) {
        success = await validateAndUpdateWorkflow();
        if (success) {
          const indexName = values.ingest.index.name;
          const doc = ingestDocsObjs[0];
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
      } else {
        getCore().notifications.toasts.addDanger('No valid document provided');
      }
    } catch (error) {
      console.error('Error ingesting documents: ', error);
    }
    return success;
  }

  async function validateAndRunQuery(): Promise<boolean> {
    let success = false;
    try {
      let queryObj = {};
      try {
        queryObj = JSON.parse(props.query);
      } catch (e) {}
      if (!isEmpty(queryObj)) {
        success = await validateAndUpdateWorkflow();
        if (success) {
          const indexName = values.ingest.index.name;
          dispatch(searchIndex({ index: indexName, body: props.query }))
            .unwrap()
            .then(async (resp) => {
              const hits = resp.hits.hits;
              props.setQueryResponse(JSON.stringify(hits, undefined, 2));
            })
            .catch((error: any) => {
              getCore().notifications.toasts.addDanger(error);
              props.setQueryResponse('');
              throw error;
            });
        }
      } else {
        getCore().notifications.toasts.addDanger('No valid query provided');
      }
    } catch (error) {
      console.error('Error running query: ', error);
    }
    return success;
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
            <EuiStepsHorizontal
              steps={[
                {
                  title: STEP.INGEST,
                  isComplete: onSearch || onExport,
                  isSelected: onIngest,
                  onClick: () => {},
                },
                {
                  title: STEP.SEARCH,
                  isComplete: onExport,
                  isSelected: onSearch,
                  onClick: () => {},
                },
                {
                  title: STEP.EXPORT,
                  isComplete: false,
                  isSelected: onExport,
                  onClick: () => {},
                },
              ]}
            />
            {onIngest && (
              <>
                <EuiSpacer size="m" />
                <BooleanField
                  fieldPath="ingest.enabled"
                  onFormChange={props.onFormChange}
                  enabledOption={{
                    id: INGEST_OPTION.CREATE,
                    label: (
                      <EuiFlexGroup direction="column" gutterSize="none">
                        <EuiText color="default">
                          Create an ingest pipeline
                        </EuiText>
                        <EuiText size="xs" color="subdued">
                          Configure and ingest data into an index.
                        </EuiText>
                      </EuiFlexGroup>
                    ),
                  }}
                  disabledOption={{
                    id: INGEST_OPTION.SKIP,
                    label: (
                      <EuiFlexGroup direction="column" gutterSize="none">
                        <EuiText color="default">
                          Skip ingestion pipeline
                        </EuiText>
                        <EuiText size="xs" color="subdued">
                          Use an existing index with data ingested.
                        </EuiText>
                      </EuiFlexGroup>
                    ),
                  }}
                />
              </>
            )}
          </EuiFlexItem>
          {!onIngestAndDisabled && (
            <>
              <EuiFlexItem grow={false}>
                <EuiTitle>
                  <h2>
                    {onIngestAndUnprovisioned
                      ? 'Define ingest pipeline'
                      : onIngestAndProvisioned
                      ? 'Edit ingest pipeline'
                      : onSearch
                      ? 'Define search pipeline'
                      : 'Export project as'}
                  </h2>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem
                grow={true}
                style={{
                  overflowY: 'scroll',
                  overflowX: 'hidden',
                }}
              >
                {onIngest ? (
                  <IngestInputs
                    onFormChange={props.onFormChange}
                    setIngestDocs={props.setIngestDocs}
                    uiConfig={props.uiConfig}
                    setUiConfig={props.setUiConfig}
                  />
                ) : onSearch ? (
                  <SearchInputs
                    uiConfig={props.uiConfig}
                    setUiConfig={props.setUiConfig}
                    setQuery={props.setQuery}
                    onFormChange={props.onFormChange}
                  />
                ) : (
                  <ExportOptions workflow={props.workflow} />
                )}
              </EuiFlexItem>
            </>
          )}
          <EuiFlexItem grow={false} style={{ marginBottom: '-10px' }}>
            <EuiFlexGroup direction="column" gutterSize="none">
              <EuiFlexItem>
                <EuiHorizontalRule margin="m" />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFlexGroup direction="row" justifyContent="flexEnd">
                  {onIngest && !ingestEnabled ? (
                    <EuiFlexItem grow={false}>
                      <EuiButton
                        fill={true}
                        onClick={() => setSelectedStep(STEP.SEARCH)}
                      >
                        {`Search pipeline >`}
                      </EuiButton>
                    </EuiFlexItem>
                  ) : onIngestAndUnprovisioned ? (
                    <>
                      <EuiFlexItem grow={false}>
                        <EuiButtonEmpty
                          onClick={() => setSelectedStep(STEP.SEARCH)}
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
                  ) : onIngestAndProvisioned ? (
                    <>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          fill={false}
                          onClick={() => {
                            validateAndRunIngestion();
                          }}
                        >
                          Run ingestion
                        </EuiButton>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          fill={true}
                          onClick={() => setSelectedStep(STEP.SEARCH)}
                        >
                          {`Search pipeline >`}
                        </EuiButton>
                      </EuiFlexItem>
                    </>
                  ) : onSearch ? (
                    <>
                      <EuiFlexItem grow={false}>
                        <EuiButtonEmpty
                          onClick={() => setSelectedStep(STEP.INGEST)}
                        >
                          Back
                        </EuiButtonEmpty>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          disabled={false}
                          fill={false}
                          onClick={() => {
                            validateAndRunQuery();
                          }}
                        >
                          Run query
                        </EuiButton>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          disabled={false}
                          fill={false}
                          onClick={() => {
                            setSelectedStep(STEP.EXPORT);
                          }}
                        >
                          {`Export >`}
                        </EuiButton>
                      </EuiFlexItem>
                    </>
                  ) : (
                    <>
                      <EuiFlexItem grow={false}>
                        <EuiButtonEmpty
                          onClick={() => setSelectedStep(STEP.SEARCH)}
                        >
                          Back
                        </EuiButtonEmpty>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          disabled={false}
                          fill={true}
                          onClick={() => {
                            // TODO: final UX for export flow is TBD.
                          }}
                        >
                          Export
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
