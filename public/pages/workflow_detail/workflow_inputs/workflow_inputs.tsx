/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { getIn, useFormikContext } from 'formik';
import { isEmpty, isEqual } from 'lodash';
import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
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
  EuiStepsHorizontal,
  EuiText,
} from '@elastic/eui';
import {
  CONFIG_STEP,
  MAX_WORKFLOW_NAME_TO_DISPLAY,
  SearchHit,
  TemplateNode,
  WORKFLOW_STEP_TYPE,
  Workflow,
  WorkflowConfig,
  WorkflowFormValues,
  WorkflowTemplate,
  customStringify,
  getCharacterLimitedString,
} from '../../../../common';
import { IngestInputs } from './ingest_inputs';
import { SearchInputs } from './search_inputs';
import {
  bulk,
  deprovisionWorkflow,
  getWorkflow,
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
  hasProvisionedSearchResources,
  generateId,
  sleep,
  getResourcesToBeForceDeleted,
} from '../../../utils';
import { BooleanField } from './input_fields';
import { getDataSourceId } from '../../../utils/utils';

// styling
import '../workspace/workspace-styles.scss';

interface WorkflowInputsProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig | undefined;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setIngestResponse: (ingestResponse: string) => void;
  setQueryResponse: (queryResponse: string) => void;
  ingestDocs: string;
  setIngestDocs: (docs: string) => void;
  isRunningIngest: boolean;
  setIsRunningIngest: (isRunningIngest: boolean) => void;
  isRunningSearch: boolean;
  setIsRunningSearch: (isRunningSearch: boolean) => void;
  selectedStep: CONFIG_STEP;
  setSelectedStep: (step: CONFIG_STEP) => void;
  setUnsavedIngestProcessors: (unsavedIngestProcessors: boolean) => void;
  setUnsavedSearchProcessors: (unsavedSearchProcessors: boolean) => void;
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
    setTouched,
    values,
  } = useFormikContext<WorkflowFormValues>();
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();

  // query state
  const [query, setQuery] = useState<string>('');

  // transient running states
  const [isRunningDelete, setIsRunningDelete] = useState<boolean>(false);

  // provisioned resources states
  const [ingestProvisioned, setIngestProvisioned] = useState<boolean>(false);

  // confirm modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // last ingested state
  const [lastIngested, setLastIngested] = useState<number | undefined>(
    undefined
  );

  // maintain global states
  const onIngest = props.selectedStep === CONFIG_STEP.INGEST;
  const onSearch = props.selectedStep === CONFIG_STEP.SEARCH;
  const ingestEnabled = values?.ingest?.enabled || false;
  const onIngestAndProvisioned = onIngest && ingestProvisioned;
  const onIngestAndUnprovisioned = onIngest && !ingestProvisioned;
  const onIngestAndDisabled = onIngest && !ingestEnabled;
  const isProposingNoSearchResources =
    isEmpty(getIn(values, 'search.enrichRequest')) &&
    isEmpty(getIn(values, 'search.enrichResponse'));

  // maintaining any fine-grained differences between the generated templates produced by the form,
  // produced by the current UI config, and the one persisted in the workflow itself. We enable/disable buttons
  // based on any discrepancies found.
  const [persistedTemplateNodes, setPersistedTemplateNodes] = useState<
    TemplateNode[]
  >([]);
  const [
    persistedIngestTemplateNodes,
    setPersistedIngestTemplateNodes,
  ] = useState<TemplateNode[]>([]);
  const [
    persistedSearchTemplateNodes,
    setPersistedSearchTemplateNodes,
  ] = useState<TemplateNode[]>([]);
  const [formGeneratedTemplateNodes, setFormGeneratedTemplateNodes] = useState<
    TemplateNode[]
  >([]);
  const [
    formGeneratedIngestTemplateNodes,
    setFormGeneratedIngestTemplateNodes,
  ] = useState<TemplateNode[]>([]);
  const [
    formGeneratedSearchTemplateNodes,
    setFormGeneratedSearchTemplateNodes,
  ] = useState<TemplateNode[]>([]);
  const [ingestTemplatesDifferent, setIngestTemplatesDifferent] = useState<
    boolean
  >(false);
  const [searchTemplatesDifferent, setSearchTemplatesDifferent] = useState<
    boolean
  >(false);

  // fetch the total template nodes
  useEffect(() => {
    setPersistedTemplateNodes(
      props.workflow?.workflows?.provision?.nodes || []
    );
    setFormGeneratedTemplateNodes(
      (values?.ingest &&
        values?.search &&
        props.uiConfig &&
        props.workflow &&
        configToTemplateFlows(
          formikToUiConfig(values, props.uiConfig as WorkflowConfig)
        ).provision.nodes) ||
        []
    );
  }, [values, props.uiConfig, props.workflow]);

  // fetch the persisted template nodes for ingest & search
  useEffect(() => {
    const tmpIngestNodes = [] as TemplateNode[];
    const tmpSearchNodes = [] as TemplateNode[];
    persistedTemplateNodes.forEach((templateNode) => {
      if (
        templateNode.type ===
        WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE
      ) {
        tmpSearchNodes.push(templateNode);
      } else {
        tmpIngestNodes.push(templateNode);
      }
    });
    setPersistedIngestTemplateNodes(tmpIngestNodes);
    setPersistedSearchTemplateNodes(tmpSearchNodes);
  }, [persistedTemplateNodes]);

  // fetch the form-generated template nodes for ingest & search
  useEffect(() => {
    const tmpIngestNodes = [] as TemplateNode[];
    const tmpSearchNodes = [] as TemplateNode[];
    formGeneratedTemplateNodes.forEach((templateNode) => {
      if (
        templateNode.type ===
        WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE
      ) {
        tmpSearchNodes.push(templateNode);
      } else {
        tmpIngestNodes.push(templateNode);
      }
    });
    setFormGeneratedIngestTemplateNodes(tmpIngestNodes);
    setFormGeneratedSearchTemplateNodes(tmpSearchNodes);
  }, [formGeneratedTemplateNodes]);

  // determine any discrepancies between the form-generated and persisted templates
  useEffect(() => {
    setIngestTemplatesDifferent(
      !isEqual(
        persistedIngestTemplateNodes,
        formGeneratedIngestTemplateNodes
      ) || false
    );
    setSearchTemplatesDifferent(
      !isEqual(
        persistedSearchTemplateNodes,
        formGeneratedSearchTemplateNodes
      ) || false
    );
  }, [
    persistedIngestTemplateNodes,
    persistedSearchTemplateNodes,
    formGeneratedIngestTemplateNodes,
    formGeneratedSearchTemplateNodes,
  ]);

  useEffect(() => {
    setIngestProvisioned(hasProvisionedIngestResources(props.workflow));
  }, [props.workflow]);

  // maintain global states (button eligibility)
  const ingestRunButtonDisabled = !ingestTemplatesDifferent;
  const ingestToSearchButtonDisabled =
    ingestTemplatesDifferent || props.isRunningIngest;
  const searchBackButtonDisabled =
    props.isRunningSearch ||
    (isProposingNoSearchResources || !ingestProvisioned
      ? false
      : searchTemplatesDifferent);
  const searchRunButtonDisabled =
    props.isRunningSearch ||
    (isProposingNoSearchResources &&
      hasProvisionedSearchResources(props.workflow));

  // Utility fn to update the workflow UI config only, based on the current form values.
  // A get workflow API call is subsequently run to fetch the updated state.
  async function updateWorkflowUiConfig() {
    let success = false;
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
        success = true;
        props.setUnsavedIngestProcessors(false);
        props.setUnsavedSearchProcessors(false);
        setTouched({});
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
        console.error('Error saving workflow: ', error);
      });
    return success;
  }

  // Utility fn to update the workflow, including any updated/new resources.
  // The reprovision param is used to determine whether we are doing full
  // deprovision/update/provision, vs. update w/ reprovision (fine-grained provisioning).
  // Details on the reprovision API is here: https://github.com/opensearch-project/flow-framework/pull/804
  async function updateWorkflowAndResources(
    updatedWorkflow: Workflow,
    reprovision: boolean
  ): Promise<boolean> {
    let success = false;
    if (!ingestTemplatesDifferent && !searchTemplatesDifferent) {
      success = await updateWorkflowUiConfig();
    } else if (reprovision) {
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
          props.setUnsavedIngestProcessors(false);
          props.setUnsavedSearchProcessors(false);
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
              props.setUnsavedIngestProcessors(false);
              props.setUnsavedSearchProcessors(false);
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
          getCore().notifications.toasts.addDanger('Missing or invalid fields');
          console.error('Form invalid');
        } else {
          setTouched({});
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
    props.setIsRunningIngest(true);
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
              props.setIngestResponse(customStringify(resp));
              setLastIngested(Date.now());
            })
            .catch((error: any) => {
              props.setIngestResponse('');
              throw error;
            });
        }
      } else {
        getCore().notifications.toasts.addDanger(
          'No valid document(s) provided. Ensure it is a valid JSON array.'
        );
      }
    } catch (error) {
      console.error('Error ingesting documents: ', error);
    }
    props.setIsRunningIngest(false);
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
    props.setIsRunningSearch(true);
    let success = false;
    try {
      let queryObj = {};
      try {
        queryObj = JSON.parse(query);
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
              apiBody: { index: indexName, body: query },
              dataSourceId,
            })
          )
            .unwrap()
            .then(async (resp) => {
              props.setQueryResponse(
                customStringify(
                  resp.hits.hits.map((hit: SearchHit) => hit._source)
                )
              );
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
    props.setIsRunningSearch(false);
    return success;
  }

  return (
    <EuiPanel
      paddingSize="m"
      grow={true}
      className="workspace-panel stretch-relative"
    >
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
          <EuiFlexItem grow={false} style={{ marginBottom: '-8px' }}>
            <EuiStepsHorizontal
              steps={[
                {
                  title: CONFIG_STEP.INGEST,
                  isComplete: onSearch,
                  isSelected: onIngest,
                  onClick: () => {},
                },
                {
                  title: CONFIG_STEP.SEARCH,
                  isComplete: false,
                  isSelected: onSearch,
                  onClick: () => {},
                },
              ]}
            />
            {isModalOpen && (
              <EuiModal onClose={() => setIsModalOpen(false)}>
                <EuiModalHeader>
                  <EuiModalHeaderTitle>
                    <p>{`Delete resources for workflow ${getCharacterLimitedString(
                      props.workflow?.name || '',
                      MAX_WORKFLOW_NAME_TO_DISPLAY
                    )}?`}</p>
                  </EuiModalHeaderTitle>
                </EuiModalHeader>
                <EuiModalBody>
                  <EuiText size="s">
                    The resources for this workflow will be permanently deleted.
                    This action cannot be undone.
                  </EuiText>
                </EuiModalBody>
                <EuiModalFooter>
                  <EuiSmallButtonEmpty onClick={() => setIsModalOpen(false)}>
                    {' '}
                    Cancel
                  </EuiSmallButtonEmpty>
                  <EuiSmallButton
                    isLoading={isRunningDelete}
                    disabled={isRunningDelete}
                    onClick={async () => {
                      setIsRunningDelete(true);
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
                              workflowId: props.workflow?.id as string,
                              dataSourceId,
                            })
                          );
                        })
                        .catch((error: any) => {})
                        .finally(() => {
                          setIsModalOpen(false);
                          setIsRunningDelete(false);
                        });
                    }}
                    fill={true}
                    color="danger"
                  >
                    Delete resources
                  </EuiSmallButton>
                </EuiModalFooter>
              </EuiModal>
            )}
          </EuiFlexItem>
          <EuiFlexItem
            grow={true}
            style={{
              overflowY: 'scroll',
              overflowX: 'hidden',
            }}
          >
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                <h2>
                  {onIngestAndUnprovisioned ? (
                    'Define ingest pipeline'
                  ) : onIngestAndProvisioned ? (
                    <EuiFlexGroup direction="row" justifyContent="spaceBetween">
                      <EuiFlexItem grow={false}>
                        Edit ingest pipeline
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiSmallButtonEmpty
                          color="danger"
                          onClick={() => setIsModalOpen(true)}
                        >
                          <EuiIcon type="trash" />
                          {`    `}Delete resources
                        </EuiSmallButtonEmpty>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  ) : (
                    'Define search pipeline'
                  )}
                </h2>
              </EuiText>
            </EuiFlexItem>
            {onIngest ? (
              <>
                {onIngestAndUnprovisioned && (
                  <>
                    <BooleanField
                      fieldPath="ingest.enabled"
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
                {!onIngestAndDisabled && (
                  <IngestInputs
                    setIngestDocs={props.setIngestDocs}
                    uiConfig={props.uiConfig}
                    setUiConfig={props.setUiConfig}
                    workflow={props.workflow}
                    lastIngested={lastIngested}
                  />
                )}
              </>
            ) : (
              <SearchInputs
                uiConfig={props.uiConfig}
                setUiConfig={props.setUiConfig}
                setQuery={setQuery}
                setQueryResponse={props.setQueryResponse}
              />
            )}
          </EuiFlexItem>
          <EuiFlexItem
            grow={false}
            style={{ marginBottom: '-10px', marginTop: '-24px' }}
          >
            <EuiFlexGroup direction="column" gutterSize="none">
              <EuiFlexItem>
                <EuiHorizontalRule margin="m" />
              </EuiFlexItem>
              <EuiFlexItem style={{ marginBottom: '18px' }}>
                <EuiFlexGroup direction="row" justifyContent="flexEnd">
                  {onIngest && !ingestEnabled ? (
                    <EuiFlexItem grow={false}>
                      <EuiSmallButton
                        fill={true}
                        disabled={false}
                        onClick={() => {
                          props.setSelectedStep(CONFIG_STEP.SEARCH);
                        }}
                        data-testid="searchPipelineButton"
                      >
                        {`Search pipeline >`}
                      </EuiSmallButton>
                    </EuiFlexItem>
                  ) : onIngest ? (
                    <>
                      <EuiFlexItem grow={false}>
                        <EuiSmallButton
                          fill={false}
                          onClick={() => {
                            validateAndRunIngestion();
                          }}
                          data-testid="runIngestionButton"
                          disabled={ingestRunButtonDisabled}
                          isLoading={props.isRunningIngest}
                        >
                          Build and run ingestion
                        </EuiSmallButton>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiSmallButton
                          fill={true}
                          onClick={() => {
                            props.setSelectedStep(CONFIG_STEP.SEARCH);
                          }}
                          data-testid="searchPipelineButton"
                          disabled={ingestToSearchButtonDisabled}
                        >
                          {`Search pipeline >`}
                        </EuiSmallButton>
                      </EuiFlexItem>
                    </>
                  ) : (
                    <>
                      <EuiFlexItem grow={false}>
                        <EuiSmallButtonEmpty
                          disabled={searchBackButtonDisabled}
                          onClick={() =>
                            props.setSelectedStep(CONFIG_STEP.INGEST)
                          }
                          data-testid="searchPipelineBackButton"
                        >
                          Back
                        </EuiSmallButtonEmpty>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiSmallButton
                          disabled={searchRunButtonDisabled}
                          isLoading={props.isRunningSearch}
                          fill={false}
                          onClick={() => {
                            validateAndRunQuery();
                          }}
                          data-testid="runQueryButton"
                        >
                          Build and run query
                        </EuiSmallButton>
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
