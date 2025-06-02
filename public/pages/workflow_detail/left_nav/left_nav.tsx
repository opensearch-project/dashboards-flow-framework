/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { isEmpty, isEqual } from 'lodash';
import { getIn, useFormikContext } from 'formik';
import {
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSmallButton,
  EuiSmallButtonIcon,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { IngestContent, SearchContent } from './nav_content';
import {
  CachedFormikState,
  COMPONENT_ID,
  CONFIG_STEP,
  customStringify,
  SimulateIngestPipelineResponseVerbose,
  TemplateNode,
  Workflow,
  WORKFLOW_STEP_TYPE,
  WorkflowConfig,
  WorkflowFormValues,
  WorkflowTemplate,
} from '../../../../common';
import {
  bulk,
  deprovisionWorkflow,
  getWorkflow,
  provisionWorkflow,
  setIngestPipelineErrors,
  simulatePipeline,
  updateWorkflow,
  useAppDispatch,
} from '../../../store';
import {
  configToTemplateFlows,
  formikToUiConfig,
  generateId,
  getDataSourceId,
  getIngestPipelineErrors,
  getIsPreV219,
  getObjsFromJSONLines,
  getResourcesToBeForceDeleted,
  hasProvisionedIngestResources,
  hasProvisionedSearchResources,
  prepareDocsForSimulate,
  reduceToTemplate,
  sleep,
  uiConfigToFormik,
  useDataSourceVersion,
  useMissingDataSourceVersion,
} from '../../../utils';
import { getCore } from '../../../services';
import { ResourcesFlyout } from '../tools/resources/resources_flyout';

// styling
import '../workspace/workspace-styles.scss';

interface LeftNavProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig | undefined;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setIngestResponse: (ingestResponse: string) => void;
  ingestDocs: string;
  setIngestDocs: (docs: string) => void;
  setBlockNavigation: (blockNavigation: boolean) => void;
  displaySearchPanel: () => void;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
  setLastIngested: (lastIngested: number) => void;
  setIngestUpdateRequired: (ingestUpdateRequired: boolean) => void;
  selectedComponentId: string;
  setSelectedComponentId: (id: string) => void;
  setIngestReadonly: (readonly: boolean) => void;
  setSearchReadonly: (readonly: boolean) => void;
  setIsProvisioning: (isProvisioning: boolean) => void;
  onClose: () => void;
}

const SUCCESS_TOAST_ID = 'success_toast_id';

/**
 * The base left navigation component. Used as a lightweight preview of the ingest and search
 * flows, as well as a way to click and navigate to the individual components of the flows.
 */
export function LeftNav(props: LeftNavProps) {
  const {
    submitForm,
    validateForm,
    resetForm,
    setTouched,
    setFieldTouched,
    values,
    dirty,
    touched,
  } = useFormikContext<WorkflowFormValues>();
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const dataSourceVersion = useDataSourceVersion(dataSourceId);
  const isPreV219 = getIsPreV219(dataSourceVersion);
  const missingDataSourceVersion = useMissingDataSourceVersion(
    dataSourceId,
    dataSourceVersion
  );

  // transient running states
  const [isProvisioningIngest, setIsProvisioningIngest] = useState<boolean>(
    false
  );
  const [isProvisioningSearch, setIsProvisioningSearch] = useState<boolean>(
    false
  );
  const [unsavedIngestProcessors, setUnsavedIngestProcessors] = useState<
    boolean
  >(false);
  const [unsavedSearchProcessors, setUnsavedSearchProcessors] = useState<
    boolean
  >(false);
  const isProvisioning = isProvisioningIngest || isProvisioningSearch;

  // provisioned resources states
  const [ingestProvisioned, setIngestProvisioned] = useState<boolean>(false);
  const [searchProvisioned, setSearchProvisioned] = useState<boolean>(false);

  // resource details state
  const [resourcesFlyoutOpen, setResourcesFlyoutOpen] = useState<boolean>(
    false
  );
  const [resourcesFlyoutContext, setResourcesFlyoutContext] = useState<
    CONFIG_STEP
  >(CONFIG_STEP.INGEST);

  // maintain global states
  const onIngest = props.selectedComponentId.startsWith('ingest');
  const onSearch =
    props.selectedComponentId.startsWith('search') ||
    props.selectedComponentId === COMPONENT_ID.RUN_QUERY ||
    props.selectedComponentId === COMPONENT_ID.SEARCH_RESULTS;
  const isProposingNoSearchResources =
    isEmpty(getIn(values, 'search.enrichRequest')) &&
    isEmpty(getIn(values, 'search.enrichResponse'));
  const ingestEnabled = values?.ingest?.enabled || false;
  const onIngestAndUnprovisioned = onIngest && !ingestProvisioned;
  const onSearchAndUnprovisioned =
    onSearch && !searchProvisioned && !isProposingNoSearchResources;
  // there is an edge case where search resources based on the form should be ignored:
  // that is, when users first create a workflow and are setting up ingest for the first time,
  // where there may be preset form values for search, but should be ignored during the initial ingestion provisioning steps.
  const includeSearchDuringProvision =
    onSearch || (onIngest && searchProvisioned);

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

  // default to the top of the search flow if ingest is switched to disabled
  useEffect(() => {
    if (getIn(values, 'ingest.enabled', undefined) === false) {
      props.setSelectedComponentId('search.request');
    }
  }, [getIn(values, 'ingest.enabled')]);

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
          formikToUiConfig(values, props.uiConfig as WorkflowConfig),
          // always generate the end-to-end flows including ingest & search, in order
          // to generate the proper state across ingest & search in the left nav.
          true,
          true,
          searchProvisioned
        )?.provision?.nodes) ||
        []
    );
  }, [values, props.uiConfig, props.workflow, includeSearchDuringProvision]);

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

  // listener when ingest processors have been added/deleted.
  // compare to the indexed/persisted workflow config
  useEffect(() => {
    setIngestProvisioned(hasProvisionedIngestResources(props.workflow));
  }, [props.workflow]);
  useEffect(() => {
    setSearchProvisioned(hasProvisionedSearchResources(props.workflow));
  }, [props.workflow]);

  useEffect(() => {
    setUnsavedIngestProcessors(
      !isEqual(
        props.uiConfig?.ingest?.enrich?.processors,
        props.workflow?.ui_metadata?.config?.ingest?.enrich?.processors
      )
    );
  }, [props.uiConfig?.ingest?.enrich?.processors?.length]);

  // listener when search processors have been added/deleted.
  // compare to the indexed/persisted workflow config
  useEffect(() => {
    setUnsavedSearchProcessors(
      !isEqual(
        props.uiConfig?.search?.enrichRequest?.processors,
        props.workflow?.ui_metadata?.config?.search?.enrichRequest?.processors
      ) ||
        !isEqual(
          props.uiConfig?.search?.enrichResponse?.processors,
          props.workflow?.ui_metadata?.config?.search?.enrichResponse
            ?.processors
        )
    );
  }, [
    props.uiConfig?.search?.enrichRequest?.processors?.length,
    props.uiConfig?.search?.enrichResponse?.processors?.length,
  ]);

  // populated ingest docs state
  const [docsPopulated, setDocsPopulated] = useState<boolean>(false);
  useEffect(() => {
    const parsedDocsObjs = getObjsFromJSONLines(props.ingestDocs);
    setDocsPopulated(parsedDocsObjs.length > 0 && !isEmpty(parsedDocsObjs[0]));
  }, [props.ingestDocs]);

  // update buttons eligibility
  const ingestUpdateRequired =
    ingestEnabled && ingestProvisioned && ingestTemplatesDifferent;
  props.setIngestUpdateRequired(ingestUpdateRequired);
  const onIngestAndUpdateRequired = onIngest && ingestUpdateRequired;

  const searchRequestUpdated =
    props.uiConfig !== undefined
      ? !isEqual(
          getIn(uiConfigToFormik(props.uiConfig, ''), 'search.request', ''),
          getIn(values, 'search.request')
        )
      : false;
  const searchUpdateRequired =
    (searchProvisioned && searchTemplatesDifferent) || searchRequestUpdated;
  const onSearchAndUpdateRequired = onSearch && searchUpdateRequired;

  // Only block ingest updates if search has been provisioned and ALSO requires update.
  // Preset use cases may have prefilled search configs, but that shouldn't block creating ingest first.
  const onIngestAndSearchUpdateRequired = onIngest && searchUpdateRequired;
  // Block search update if ingest hasn't been created, OR it has been created, but requires updates.
  const onSearchAndIngestUpdateRequired =
    onSearch && ingestEnabled && (!ingestProvisioned || ingestUpdateRequired);
  props.setIngestReadonly(onIngestAndSearchUpdateRequired);
  props.setSearchReadonly(onSearchAndIngestUpdateRequired);

  useEffect(() => {
    props.setIsProvisioning(isProvisioning);
  }, [isProvisioning]);

  // Utility fn to revert any unsaved changes, reset the form
  function revertUnsavedChanges(): void {
    resetForm();
    if (props.workflow?.ui_metadata?.config !== undefined) {
      props.setUiConfig(props.workflow?.ui_metadata?.config);
    }
  }

  // Utility fn to perform bulk ingest
  function bulkIngest(ingestDocsObjs: {}[]) {
    const bulkBody = prepareBulkBody(values.ingest.index.name, ingestDocsObjs);
    dispatch(bulk({ apiBody: { body: bulkBody }, dataSourceId }))
      .unwrap()
      .then(async (resp: any) => {
        props.setIngestResponse(customStringify(resp));
        setIsProvisioningIngest(false);
        props.setLastIngested(Date.now());
        getCore().notifications.toasts.add({
          id: SUCCESS_TOAST_ID,
          iconType: 'check',
          color: 'success',
          title: 'Ingest flow updated',
          // @ts-ignore
          text: (
            <EuiFlexGroup direction="column">
              <EuiFlexItem grow={false}>
                <EuiText size="s">
                  Validate your ingest flow using Test flow
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFlexGroup direction="row" justifyContent="flexEnd">
                  <EuiFlexItem grow={false}>
                    <EuiSmallButton
                      fill={false}
                      onClick={() => {
                        props.displaySearchPanel();
                        getCore().notifications.toasts.remove(SUCCESS_TOAST_ID);
                      }}
                    >
                      Test flow
                    </EuiSmallButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          ),
        });
      })
      .catch((error: any) => {
        props.setIngestResponse('');
        throw error;
      });
  }

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
        setUnsavedIngestProcessors(false);
        setUnsavedSearchProcessors(false);
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
          dataSourceVersion,
        })
      )
        .unwrap()
        .then(async (result) => {
          // if the datasource < 2.19, only async provisioning/reprovisioning is supported.
          // so, we manually wait some time before trying to fetch the updated workflow
          if (isPreV219) {
            await sleep(1000);
          }
          setUnsavedIngestProcessors(false);
          setUnsavedSearchProcessors(false);
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
          await sleep(100);
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
              await sleep(100);
              setUnsavedIngestProcessors(false);
              setUnsavedSearchProcessors(false);
              await dispatch(
                provisionWorkflow({
                  workflowId: updatedWorkflow.id as string,
                  dataSourceId,
                  dataSourceVersion,
                })
              )
                .unwrap()
                .then(async (result) => {
                  await sleep(100);
                  // if the datasource < 2.19, only async provisioning/reprovisioning is supported.
                  // so, we manually wait some time before trying to fetch the updated workflow
                  if (isPreV219) {
                    await sleep(1000);
                  }
                  await dispatch(
                    getWorkflow({
                      workflowId: updatedWorkflow.id as string,
                      dataSourceId,
                    })
                  )
                    .unwrap()
                    .then(async (result: any) => {
                      const resultWorkflow = result.workflow as Workflow;
                      if (isEmpty(resultWorkflow.error)) {
                        success = true;
                      } else {
                        success = false;
                        getCore().notifications.toasts.addDanger(
                          `Error creating all resources, rolling back: ${resultWorkflow.error}`
                        );
                        await dispatch(
                          deprovisionWorkflow({
                            apiBody: {
                              workflowId: resultWorkflow?.id as string,
                              resourceIds: getResourcesToBeForceDeleted(
                                resultWorkflow
                              ),
                            },
                            dataSourceId,
                          })
                        )
                          .unwrap()
                          .then(async (result) => {
                            setTimeout(async () => {
                              await dispatch(
                                getWorkflow({
                                  workflowId: updatedWorkflow.id as string,
                                  dataSourceId,
                                })
                              );
                            }, 1000);
                          });
                      }
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
    await submitForm();
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
            // for updating the actual template to be provisioned, we need to handle few scenarios:
            // for ingest, always set to "true", as we will always take into account any ingest config
            // into the provisioning steps
            // for search, we generally want to include, except for the edge case of initial workflow creation.
            // see description where "includeSearchDuringProvision" is defined.
            workflows: configToTemplateFlows(
              updatedConfig,
              true,
              includeSearchDuringProvision,
              searchProvisioned
            ),
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
    setFieldTouched('ingest.docs', true);
    setIsProvisioningIngest(true);
    let success = false;
    try {
      const ingestDocsObjs = getObjsFromJSONLines(props.ingestDocs);
      if (ingestDocsObjs.length > 0 && !isEmpty(ingestDocsObjs[0])) {
        success = await validateAndUpdateWorkflow(false, true, false);
        if (success) {
          if (
            !isEmpty(values?.ingest?.enrich) &&
            values?.ingest?.pipelineName !== undefined &&
            values?.ingest?.pipelineName !== '' &&
            // if the data source version is missing/undefined, we cannot
            // guarantee that the simulate API will be available
            !missingDataSourceVersion
          ) {
            const curDocs = prepareDocsForSimulate(
              values?.ingest?.docs,
              values?.ingest?.index?.name
            );
            await dispatch(
              simulatePipeline({
                apiBody: {
                  docs: curDocs,
                },
                pipelineId: values.ingest.pipelineName,
                dataSourceId,
                verbose: true,
              })
            )
              .unwrap()
              .then((resp: SimulateIngestPipelineResponseVerbose) => {
                const ingestPipelineErrors = getIngestPipelineErrors(resp);
                // The errors map may be empty; in which case, this dispatch will clear
                // any older errors.
                dispatch(
                  setIngestPipelineErrors({ errors: ingestPipelineErrors })
                );
                if (isEmpty(ingestPipelineErrors)) {
                  bulkIngest(ingestDocsObjs);
                  props.setSelectedComponentId(COMPONENT_ID.SEARCH_REQUEST);
                }
              })
              .catch((error: any) => {
                getCore().notifications.toasts.addDanger(
                  `Failed to simulate ingest pipeline: ${error}`
                );
              });
          } else {
            bulkIngest(ingestDocsObjs);
            dispatch(setIngestPipelineErrors({ errors: {} }));
            props.setSelectedComponentId(COMPONENT_ID.SEARCH_REQUEST);
          }
        }
      } else {
        getCore().notifications.toasts.addDanger(
          'No valid document(s) provided in sample data.'
        );
        setFieldTouched('ingest.docs', true);
      }
    } catch (error) {
      console.error('Error ingesting documents: ', error);
    }
    setIsProvisioningIngest(false);
    return success;
  }

  // Updating search-related resources. If existing ingest resources, run fine-grained provisioning to persist that
  // created index and any indexed data, and only update/re-create the search pipeline.
  // If no ingest resources (using user's existing index), run full
  // deprovision/update/provision, since we're just re-creating the search pipeline.
  // This logic is propagated by passing `reprovision=true/false` in the
  // validateAndUpdateWorkflow() fn calls below.
  async function validateAndUpdateSearchResources(): Promise<boolean> {
    setIsProvisioningSearch(true);
    let success = false;
    try {
      if (hasProvisionedIngestResources(props.workflow)) {
        success = await validateAndUpdateWorkflow(true, false, true);
      } else {
        success = await validateAndUpdateWorkflow(false, false, true);
      }
    } catch (error) {
      console.error('Error updating search pipeline: ', error);
    }
    setIsProvisioningSearch(false);
    return success;
  }

  // global saved state. block navigation away if there are unsaved changes
  const ingestSaved =
    isProvisioningSearch || isProvisioningIngest
      ? true
      : unsavedIngestProcessors
      ? false
      : !dirty;
  const searchSaved =
    isProvisioningIngest || isProvisioningSearch
      ? true
      : unsavedSearchProcessors
      ? false
      : isEmpty(touched?.search) || !dirty;
  const allChangesSaved = ingestSaved && searchSaved;
  useEffect(() => {
    props.setBlockNavigation(!allChangesSaved);
  }, [allChangesSaved]);

  return (
    <>
      {resourcesFlyoutOpen && (
        <ResourcesFlyout
          resources={props.workflow?.resourcesCreated || []}
          selectedStep={resourcesFlyoutContext}
          onClose={() => setResourcesFlyoutOpen(false)}
          indexName={getIn(values, 'ingest.index.name')}
          ingestPipelineName={getIn(values, 'ingest.pipelineName')}
          searchPipelineName={getIn(values, 'search.pipelineName')}
          searchQuery={getIn(values, 'search.request')}
        />
      )}
      <EuiPanel
        data-testid="leftNavPanel"
        paddingSize="s"
        grow={false}
        className="workspace-panel left-nav-static-width"
        borderRadius="l"
        style={{ paddingBottom: '48px' }}
      >
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="row" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiTitle>
                <h3>Flow overview</h3>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButtonIcon
                data-testid="hideLeftNavButton"
                aria-label="hideLeftNavButton"
                iconType={'menuLeft'}
                onClick={() => {
                  props.onClose();
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexGroup
          direction="column"
          justifyContent="spaceBetween"
          gutterSize="none"
          style={{
            height: '100%',
            gap: '16px',
            //marginLeft: '12px', TODO: change this value to adjust global margin of left nav.
          }}
        >
          <EuiFlexItem
            grow={false}
            style={{
              overflowY: 'scroll',
              scrollbarGutter: 'stable',
              scrollbarWidth: 'thin',
              overflowX: 'hidden',
            }}
          >
            <>
              {props.uiConfig === undefined ? (
                <EuiLoadingSpinner size="xl" />
              ) : (
                <EuiFlexGroup
                  direction="column"
                  justifyContent="spaceBetween"
                  gutterSize="none"
                  style={{
                    height: '100%',
                    gap: '4px',
                  }}
                >
                  <IngestContent
                    workflow={props.workflow}
                    uiConfig={props.uiConfig}
                    setUiConfig={props.setUiConfig}
                    setCachedFormikState={props.setCachedFormikState}
                    selectedComponentId={props.selectedComponentId}
                    setSelectedComponentId={props.setSelectedComponentId}
                    setResourcesFlyoutOpen={setResourcesFlyoutOpen}
                    setResourcesFlyoutContext={setResourcesFlyoutContext}
                    docsPopulated={docsPopulated}
                    ingestProvisioned={ingestProvisioned}
                    isProvisioningIngest={isProvisioningIngest}
                    isUnsaved={ingestUpdateRequired}
                    readonly={searchUpdateRequired || isProvisioning}
                  />
                  <EuiHorizontalRule margin="xs" />
                  <SearchContent
                    uiConfig={props.uiConfig}
                    setUiConfig={props.setUiConfig}
                    setCachedFormikState={props.setCachedFormikState}
                    selectedComponentId={props.selectedComponentId}
                    setSelectedComponentId={props.setSelectedComponentId}
                    setResourcesFlyoutOpen={setResourcesFlyoutOpen}
                    setResourcesFlyoutContext={setResourcesFlyoutContext}
                    displaySearchPanel={props.displaySearchPanel}
                    ingestProvisioned={ingestProvisioned}
                    searchProvisioned={searchProvisioned}
                    isProvisioningSearch={isProvisioningSearch}
                    isUnsaved={searchUpdateRequired}
                    readonly={
                      ingestUpdateRequired ||
                      (ingestEnabled && !ingestProvisioned) ||
                      isProvisioning
                    }
                  />
                </EuiFlexGroup>
              )}
            </>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="column" gutterSize="none">
              <EuiFlexItem>
                <EuiHorizontalRule margin="m" />
              </EuiFlexItem>
              {onIngestAndSearchUpdateRequired && (
                <>
                  <EuiFlexItem grow={false} style={{ marginTop: '-8px' }}>
                    <EuiCallOut
                      color="warning"
                      iconType={'help'}
                      title="Create/update your search flow before updating an ingest flow"
                    />
                  </EuiFlexItem>
                  <EuiSpacer size="s" />
                </>
              )}
              {onSearchAndIngestUpdateRequired && (
                <>
                  <EuiFlexItem grow={false} style={{ marginTop: '-8px' }}>
                    <EuiCallOut
                      color="warning"
                      iconType={'help'}
                      title={
                        'Create/update your ingest flow before updating a search flow.'
                      }
                    />
                  </EuiFlexItem>
                  <EuiSpacer size="s" />
                </>
              )}
              <EuiFlexItem grow={false}>
                <EuiFlexGroup
                  direction="row"
                  gutterSize="s"
                  style={{ padding: '0px', marginBottom: '48px' }}
                >
                  {onIngestAndUnprovisioned &&
                    ingestEnabled &&
                    !searchUpdateRequired && (
                      <EuiFlexItem grow={true}>
                        <EuiSmallButton
                          fill={true}
                          isLoading={isProvisioningIngest}
                          onClick={() => validateAndRunIngestion()}
                        >
                          Create ingest flow
                        </EuiSmallButton>
                      </EuiFlexItem>
                    )}
                  {onIngestAndUpdateRequired &&
                    ingestEnabled &&
                    !searchUpdateRequired && (
                      <>
                        <EuiFlexItem grow={false}>
                          <EuiSmallButtonIcon
                            iconType={'editorUndo'}
                            aria-label="undo"
                            display="base"
                            iconSize="s"
                            isDisabled={isProvisioningIngest}
                            onClick={() => revertUnsavedChanges()}
                          />
                        </EuiFlexItem>
                        <EuiFlexItem grow={true}>
                          <EuiSmallButton
                            fill={true}
                            isLoading={isProvisioningIngest}
                            onClick={() => validateAndRunIngestion()}
                          >
                            Update ingest flow
                          </EuiSmallButton>
                        </EuiFlexItem>
                      </>
                    )}
                  {onSearchAndUnprovisioned &&
                    !ingestUpdateRequired &&
                    !(ingestEnabled && !ingestProvisioned) && (
                      <EuiFlexItem grow={true}>
                        <EuiSmallButton
                          fill={true}
                          disabled={isProvisioningSearch}
                          isLoading={isProvisioningSearch}
                          onClick={async () => {
                            if (await validateAndUpdateSearchResources()) {
                              getCore().notifications.toasts.add({
                                id: SUCCESS_TOAST_ID,
                                iconType: 'check',
                                color: 'success',
                                title: 'Search flow created',
                                // @ts-ignore
                                text: (
                                  <EuiFlexGroup direction="column">
                                    <EuiFlexItem grow={false}>
                                      <EuiText size="s">
                                        Validate your search flow using Test
                                        flow
                                      </EuiText>
                                    </EuiFlexItem>
                                    <EuiFlexItem>
                                      <EuiFlexGroup
                                        direction="row"
                                        justifyContent="flexEnd"
                                      >
                                        <EuiFlexItem grow={false}>
                                          <EuiSmallButton
                                            fill={false}
                                            onClick={() => {
                                              props.displaySearchPanel();
                                              getCore().notifications.toasts.remove(
                                                SUCCESS_TOAST_ID
                                              );
                                            }}
                                          >
                                            Test flow
                                          </EuiSmallButton>
                                        </EuiFlexItem>
                                      </EuiFlexGroup>
                                    </EuiFlexItem>
                                  </EuiFlexGroup>
                                ),
                              });
                              setSearchProvisioned(true);
                            }
                          }}
                        >
                          Create search flow
                        </EuiSmallButton>
                      </EuiFlexItem>
                    )}
                  {onSearchAndUpdateRequired && !ingestUpdateRequired && (
                    <>
                      <EuiFlexItem grow={false}>
                        <EuiSmallButtonIcon
                          iconType={'editorUndo'}
                          aria-label="undo"
                          display="base"
                          iconSize="s"
                          isDisabled={isProvisioningIngest}
                          onClick={() => revertUnsavedChanges()}
                        />
                      </EuiFlexItem>
                      <EuiFlexItem grow={true}>
                        <EuiSmallButton
                          fill={true}
                          disabled={isProvisioningSearch}
                          isLoading={isProvisioningSearch}
                          onClick={async () => {
                            if (await validateAndUpdateSearchResources()) {
                              getCore().notifications.toasts.add({
                                id: SUCCESS_TOAST_ID,
                                iconType: 'check',
                                color: 'success',
                                title: 'Search flow updated',
                                // @ts-ignore
                                text: (
                                  <EuiFlexGroup direction="column">
                                    <EuiFlexItem grow={false}>
                                      <EuiText size="s">
                                        Validate your search flow using Test
                                        flow
                                      </EuiText>
                                    </EuiFlexItem>
                                    <EuiFlexItem>
                                      <EuiFlexGroup
                                        direction="row"
                                        justifyContent="flexEnd"
                                      >
                                        <EuiFlexItem grow={false}>
                                          <EuiSmallButton
                                            fill={false}
                                            onClick={() => {
                                              props.displaySearchPanel();
                                              getCore().notifications.toasts.remove(
                                                SUCCESS_TOAST_ID
                                              );
                                            }}
                                          >
                                            Test flow
                                          </EuiSmallButton>
                                        </EuiFlexItem>
                                      </EuiFlexGroup>
                                    </EuiFlexItem>
                                  </EuiFlexGroup>
                                ),
                              });
                              setSearchProvisioned(true);
                            }
                          }}
                        >
                          Update search flow
                        </EuiSmallButton>
                      </EuiFlexItem>
                    </>
                  )}
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </>
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
