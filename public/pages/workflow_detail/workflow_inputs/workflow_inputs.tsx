/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFormikContext } from 'formik';
import { debounce, isEmpty } from 'lodash';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiIcon,
  EuiLoadingSpinner,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
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
  WorkflowTemplate,
} from '../../../../common';
import { IngestInputs } from './ingest_inputs';
import { SearchInputs } from './search_inputs';
import {
  AppState,
  bulk,
  deprovisionWorkflow,
  getWorkflow,
  provisionWorkflow,
  removeDirty,
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
  hasProvisionedSearchResources,
  generateId,
  sleep,
  getResourcesToBeForceDeleted,
} from '../../../utils';
import { BooleanField } from './input_fields';
import { ExportOptions } from './export_options';
import { getDataSourceId } from '../../../utils/utils';

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
  const {
    submitForm,
    validateForm,
    setFieldValue,
    values,
    touched,
  } = useFormikContext<WorkflowFormValues>();
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();

  // Overall workspace state
  const { isDirty } = useSelector((state: AppState) => state.form);

  // selected step state
  const [selectedStep, setSelectedStep] = useState<STEP>(STEP.INGEST);

  // provisioned resources states
  const [ingestProvisioned, setIngestProvisioned] = useState<boolean>(false);
  const [searchProvisioned, setSearchProvisioned] = useState<boolean>(false);

  // confirm modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // maintain global states
  const onIngest = selectedStep === STEP.INGEST;
  const onSearch = selectedStep === STEP.SEARCH;
  const onExport = selectedStep === STEP.EXPORT;
  const ingestEnabled = values?.ingest?.enabled || false;
  const onIngestAndProvisioned = onIngest && ingestProvisioned;
  const onIngestAndUnprovisioned = onIngest && !ingestProvisioned;
  const onIngestAndDisabled = onIngest && !ingestEnabled;

  // Auto-save the UI metadata when users update form values.
  // Only update the underlying workflow template (deprovision/provision) when
  // users explicitly run ingest/search and need to have updated resources
  // to test against.
  // We use useCallback() with an autosave flag that is only set within the fn itself.
  // This is so we can fetch the latest values (uiConfig, formik values) inside a memoized fn,
  // but only when we need to.
  const [autosave, setAutosave] = useState<boolean>(false);
  function triggerAutosave(): void {
    setAutosave(!autosave);
  }
  const debounceAutosave = useCallback(
    debounce(async () => {
      triggerAutosave();
    }, 10000),
    [autosave]
  );

  // Hook to execute autosave when triggered. Runs the update API with update_fields set to true,
  // to update the ui_metadata without updating the underlying template for a provisioned workflow.
  useEffect(() => {
    (async () => {
      if (!isEmpty(touched)) {
        const updatedTemplate = {
          name: props.workflow?.name,
          ui_metadata: {
            ...props.workflow?.ui_metadata,
            config: formikToUiConfig(values, props.uiConfig as WorkflowConfig),
          },
        } as WorkflowTemplate;
        await dispatch(
          updateWorkflow({
            apiBody: {
              workflowId: props.workflow?.id as string,
              workflowTemplate: updatedTemplate,
              updateFields: true,
            },
            dataSourceId,
          })
        )
          .unwrap()
          .then(async (result) => {
            // get any updates after autosave
            new Promise((f) => setTimeout(f, 1000)).then(async () => {
              dispatch(
                getWorkflow({
                  workflowId: props.workflow?.id as string,
                  dataSourceId,
                })
              );
            });
          })
          .catch((error: any) => {
            console.error('Error autosaving workflow: ', error);
          });
      }
    })();
  }, [autosave]);

  // Hook to listen for changes to form values and trigger autosave
  useEffect(() => {
    if (!isEmpty(values)) {
      debounceAutosave();
    }
  }, [values]);

  useEffect(() => {
    setIngestProvisioned(hasProvisionedIngestResources(props.workflow));
    setSearchProvisioned(hasProvisionedSearchResources(props.workflow));
  }, [props.workflow]);

  // Utility fn to update the workflow, including any updated/new resources
  // Eventually, should be able to use fine-grained provisioning to do a single API call
  // instead of the currently-implemented deprovision -> update -> provision.
  // To simplify and minimize errors, we set various sleep calls in between the actions
  // to allow time for full deprovisioning / provisioning to occur, such as index deletion
  // & index re-creation.
  // TODO: update to fine-grained provisioning when available.
  async function updateWorkflowAndResources(
    updatedWorkflow: Workflow
  ): Promise<boolean> {
    let success = false;
    await dispatch(
      deprovisionWorkflow({
        apiBody: {
          workflowId: updatedWorkflow.id as string,
          resourceIds: getResourcesToBeForceDeleted(props.workflow),
        },
        dataSourceId,
      })
    )
      .unwrap()
      .then(async (result) => {
        await dispatch(
          updateWorkflow({
            apiBody: {
              workflowId: updatedWorkflow.id as string,
              workflowTemplate: reduceToTemplate(updatedWorkflow),
            },
            dataSourceId,
          })
        )
          .unwrap()
          .then(async (result) => {
            await sleep(1000);
            await dispatch(
              provisionWorkflow({
                workflowId: updatedWorkflow.id as string,
                dataSourceId,
              })
            )
              .unwrap()
              .then(async (result) => {
                await sleep(1000);
                success = true;
                // Kicking off an async task to re-fetch the workflow details
                // after some amount of time. Provisioning will finish in an indeterminate
                // amount of time and may be long and expensive; we add this single
                // auto-fetching to cover the majority of provisioning updates which
                // are inexpensive and will finish within milliseconds.
                new Promise((f) => setTimeout(f, 1000)).then(async () => {
                  dispatch(
                    getWorkflow({
                      workflowId: updatedWorkflow.id as string,
                      dataSourceId,
                    })
                  );
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
        ingestDocsObjs = JSON.parse(props.ingestDocs);
      } catch (e) {}
      if (ingestDocsObjs.length > 0 && !isEmpty(ingestDocsObjs[0])) {
        success = await validateAndUpdateWorkflow();
        if (success) {
          const bulkBody = prepareBulkBody(
            values.ingest.index.name,
            ingestDocsObjs
          );
          dispatch(bulk({ apiBody: { body: bulkBody }, dataSourceId }))
            .unwrap()
            .then(async (resp) => {
              props.setIngestResponse(JSON.stringify(resp, undefined, 2));
              dispatch(removeDirty());
            })
            .catch((error: any) => {
              props.setIngestResponse('');
              throw error;
            });
        }
      } else {
        getCore().notifications.toasts.addDanger(
          'No valid document provided. Ensure it is a valid JSON array.'
        );
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
        // TODO: currently this will execute deprovision in child fns.
        // In the future, we must omit deprovisioning the index, as it contains
        // the data we are executing the query against. Tracking issue:
        // https://github.com/opensearch-project/flow-framework/issues/717
        success = await validateAndUpdateWorkflow();
        if (success) {
          const indexName = values.ingest.index.name;
          dispatch(
            searchIndex({
              apiBody: { index: indexName, body: props.query },
              dataSourceId,
            })
          )
            .unwrap()
            .then(async (resp) => {
              const hits = resp.hits?.hits;
              props.setQueryResponse(JSON.stringify(hits, undefined, 2));
              dispatch(removeDirty());
            })
            .catch((error: any) => {
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
            {isModalOpen && (
              <EuiModal onClose={() => setIsModalOpen(false)}>
                <EuiModalHeader>
                  <EuiModalHeaderTitle>
                    <p>{`Delete resources for workflow ${props.workflow?.name}?`}</p>
                  </EuiModalHeaderTitle>
                </EuiModalHeader>
                <EuiModalBody>
                  <EuiText>
                    The resources for this workflow will be permanently deleted.
                    This action cannot be undone.
                  </EuiText>
                </EuiModalBody>
                <EuiModalFooter>
                  <EuiButtonEmpty onClick={() => setIsModalOpen(false)}>
                    {' '}
                    Cancel
                  </EuiButtonEmpty>
                  <EuiButton
                    onClick={async () => {
                      await dispatch(
                        deprovisionWorkflow({
                          apiBody: {
                            workflowId: props.workflow?.id as string,
                            resourceIds: getResourcesToBeForceDeleted(
                              props.workflow
                            ),
                          },
                          dataSourceId,
                        })
                      )
                        .unwrap()
                        .then(async (result) => {
                          setFieldValue('ingest.enabled', false);
                          // @ts-ignore
                          await dispatch(getWorkflow({workflowId:props.workflow.id, dataSourceId}));
                        })
                        .catch((error: any) => {})
                        .finally(() => {
                          setIsModalOpen(false);
                        });
                    }}
                    fill={true}
                    color="danger"
                  >
                    Delete resources
                  </EuiButton>
                </EuiModalFooter>
              </EuiModal>
            )}
            {onIngest &&
              isDirty &&
              hasProvisionedSearchResources(props.workflow) && (
                <EuiCallOut
                  title="Making changes to ingest may affect your configured search flow"
                  iconType={'alert'}
                  color="warning"
                />
              )}
            {onIngestAndUnprovisioned && (
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
                    {onIngestAndUnprovisioned ? (
                      'Define ingest pipeline'
                    ) : onIngestAndProvisioned ? (
                      <EuiFlexGroup
                        direction="row"
                        justifyContent="spaceBetween"
                      >
                        <EuiFlexItem grow={false}>
                          Edit ingest pipeline
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                          <EuiButtonEmpty
                            color="danger"
                            onClick={() => setIsModalOpen(true)}
                          >
                            <EuiIcon type="trash" />
                            {`    `}Delete resources
                          </EuiButtonEmpty>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    ) : onSearch ? (
                      'Define search pipeline'
                    ) : (
                      'Export project as'
                    )}
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
                    setQueryResponse={props.setQueryResponse}
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
                        onClick={() => {
                          setSelectedStep(STEP.SEARCH);
                          dispatch(removeDirty());
                        }}
                      >
                        {`Search pipeline >`}
                      </EuiButton>
                    </EuiFlexItem>
                  ) : onIngest ? (
                    <>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          fill={false}
                          onClick={() => {
                            validateAndRunIngestion();
                          }}
                          disabled={ingestProvisioned && !isDirty}
                        >
                          Run ingestion
                        </EuiButton>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          fill={true}
                          onClick={() => {
                            setSelectedStep(STEP.SEARCH);
                          }}
                          disabled={!ingestProvisioned || isDirty}
                        >
                          {`Search pipeline >`}
                        </EuiButton>
                      </EuiFlexItem>
                    </>
                  ) : onSearch ? (
                    <>
                      <EuiFlexItem grow={false}>
                        <EuiButtonEmpty
                          disabled={isDirty}
                          onClick={() => setSelectedStep(STEP.INGEST)}
                        >
                          Back
                        </EuiButtonEmpty>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          disabled={searchProvisioned && !isDirty}
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
                          disabled={!searchProvisioned || isDirty}
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

// ingesting multiple documents must follow the proper format for the bulk API.
// see https://opensearch.org/docs/latest/api-reference/document-apis/bulk/#request-body
function prepareBulkBody(indexName: string, docObjs: {}[]): {} {
  const bulkBody = [] as any[];
  docObjs.forEach((doc) => {
    bulkBody.push({
      index: {
        _index: indexName,
        _id: generateId(),
      },
    });
    bulkBody.push(doc);
  });
  return bulkBody;
}
