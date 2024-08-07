/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
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
  SearchHit,
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
  const isProposingNoSearchResources =
    isEmpty(getIn(values, 'search.enrichRequest')) &&
    isEmpty(getIn(values, 'search.enrichResponse'));

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
    }, 1000),
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
              reprovision: false,
            },
            dataSourceId,
          })
        )
          .unwrap()
          .then(async (result) => {
            // TODO: figure out clean way to update the "last updated"
            // section. The problem with re-fetching this every time, is it
            // triggers lots of component rebuilds due to the base workflow prop
            // changing.
            // get any updates after autosave
            // new Promise((f) => setTimeout(f, 1000)).then(async () => {
            //   dispatch(getWorkflow(props.workflow?.id as string));
            // });
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

  // Utility fn to update the workflow, including any updated/new resources.
  // The reprovision param is used to determine whether we are doing full
  // deprovision/update/provision, vs. update w/ reprovision (fine-grained provisioning).
  // Details on the reprovision API is here: https://github.com/opensearch-project/flow-framework/pull/804
  async function updateWorkflowAndResources(
    updatedWorkflow: Workflow,
    reprovision: boolean
  ): Promise<boolean> {
    let success = false;
    if (reprovision) {
      await dispatch(
        updateWorkflow({
          apiBody: {
            workflowId: updatedWorkflow.id as string,
            workflowTemplate: reduceToTemplate(updatedWorkflow),
            reprovision: true,
          },
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
          setTimeout(async () => {
            dispatch(
              getWorkflow({
                workflowId: updatedWorkflow.id as string,
                dataSourceId,
              })
            );
          }, 1000);
        })
        .catch((error: any) => {
          console.error('Error reprovisioning workflow: ', error);
        });
    } else {
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
                reprovision: false,
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
                  setTimeout(async () => {
                    dispatch(
                      getWorkflow({
                        workflowId: updatedWorkflow.id as string,
                        dataSourceId,
                      })
                    );
                  }, 1000);
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
    }
    return success;
  }

  // Utility fn to validate the form and update the workflow if valid
  // Support fine-grained validation if we only need to validate a subset
  // of the entire form.
  async function validateAndUpdateWorkflow(
    reprovision: boolean,
    includeIngest: boolean = true,
    includeSearch: boolean = true
  ): Promise<boolean> {
    let success = false;
    // Submit the form to bubble up any errors.
    // Ideally we handle Promise accept/rejects with submitForm(), but there is
    // open issues for that - see https://github.com/jaredpalmer/formik/issues/2057
    // The workaround is to additionally execute validateForm() which will return any errors found.
    submitForm();
    await validateForm()
      .then(async (validationResults: { ingest?: {}; search?: {} }) => {
        const { ingest, search } = validationResults;
        const relevantValidationResults = {
          ...(includeIngest && ingest !== undefined ? { ingest } : {}),
          ...(includeSearch && search !== undefined ? { search } : {}),
        };
        if (Object.keys(relevantValidationResults).length > 0) {
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
          success = await updateWorkflowAndResources(
            updatedWorkflow,
            reprovision
          );
        }
      })
      .catch((error) => {
        console.error('Error validating form: ', error);
      });

    return success;
  }

  // Updating ingest. In this case, do full deprovision/update/provision, since we want
  // to clean up any created resources and not have leftover / stale data in some index.
  // This is propagated by passing `reprovision=false` to validateAndUpdateWorkflow()
  async function validateAndRunIngestion(): Promise<boolean> {
    let success = false;
    try {
      let ingestDocsObjs = [] as {}[];
      try {
        ingestDocsObjs = JSON.parse(props.ingestDocs);
      } catch (e) {}
      if (ingestDocsObjs.length > 0 && !isEmpty(ingestDocsObjs[0])) {
        success = await validateAndUpdateWorkflow(false, true, false);
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

  // Updating search. If existing ingest resources, run fine-grained provisioning to persist that
  // created index and any indexed data, and only update/re-create the search
  // pipeline, as well as adding that pipeline as the default pipeline for the existing index.
  // If no ingest resources (using user's existing index), run full
  // deprovision/update/provision, since we're just re-creating the search pipeline.
  // This logic is propagated by passing `reprovision=true/false` in the
  // validateAndUpdateWorkflow() fn calls below.
  async function validateAndRunQuery(): Promise<boolean> {
    let success = false;
    try {
      let queryObj = {};
      try {
        queryObj = JSON.parse(props.query);
      } catch (e) {}
      if (!isEmpty(queryObj)) {
        if (hasProvisionedIngestResources(props.workflow)) {
          success = await validateAndUpdateWorkflow(true, false, true);
        } else {
          success = await validateAndUpdateWorkflow(false, false, true);
        }

        if (success) {
          const indexName = values.search.index.name;
          dispatch(
            searchIndex({
              apiBody: { index: indexName, body: props.query },
              dataSourceId,
            })
          )
            .unwrap()
            .then(async (resp) => {
              props.setQueryResponse(
                JSON.stringify(
                  resp.hits.hits.map((hit: SearchHit) => hit._source),
                  undefined,
                  2
                )
              );
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
                          await dispatch(
                            getWorkflow({
                              workflowId: props.workflow.id,
                              dataSourceId,
                            })
                          );
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
                  showLabel={false}
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
                          // TODO: only enable if ingest is dirty
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
                          // TODO: only disable if ingest is dirty
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
                          disabled={false}
                          onClick={() => setSelectedStep(STEP.INGEST)}
                        >
                          Back
                        </EuiButtonEmpty>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          disabled={isProposingNoSearchResources}
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
