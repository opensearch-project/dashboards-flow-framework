/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { cloneDeep, isEmpty } from 'lodash';
import { getIn, useFormikContext } from 'formik';
import {
  AppState,
  getMappings,
  searchIndex,
  updateWorkflow,
  useAppDispatch,
} from '../../../store';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSmallButton,
  EuiSpacer,
  EuiCallOut,
  EuiToolTip,
  EuiButtonEmpty,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import {
  customStringify,
  IndexMappings,
  Workflow,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../common';
import {
  formikToUiConfig,
  reduceToTemplate,
  getDataSourceId,
} from '../../../utils';
import { getCore } from '../../../services';
import {
  AgentInfoModal,
  AgentConfiguration,
  IndexSelector,
  SearchQuery,
  SearchResults,
} from './components';

interface AgenticSearchWorkspaceProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig | undefined;
  setBlockNavigation: (blockNavigation: boolean) => void; // TODO: block if unsaved changes.
}

/**
 * Basic UI for configuring and testing agentic search workflows.
 */
export function AgenticSearchWorkspace(props: AgenticSearchWorkspaceProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const {
    values,
    setFieldValue,
    dirty,
    touched,
    submitForm,
    validateForm,
    resetForm,
    setTouched,
  } = useFormikContext<WorkflowFormValues>();
  const [fieldMappings, setFieldMappings] = useState<any>(null);
  const selectedIndexId = getIn(values, 'search.index.name', '') as string;
  const selectedAgentId = getIn(values, 'search.agentId', '') as string;
  const finalQuery = (() => {
    try {
      return JSON.parse(getIn(values, 'search.request', '{}'));
    } catch (e) {
      return {};
    }
  })();

  // the runtime-specific pipeline to be ran inline with the search query
  const [runtimeSearchPipeline, setRuntimeSearchPipeline] = useState<{}>({});

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResponse, setSearchResponse] = useState<any | undefined>(
    undefined
  );
  const [error, setError] = useState<string | undefined>(undefined);

  const { errorMessage: opensearchError } = useSelector(
    (state: AppState) => state.opensearch
  );

  const { loading: workflowsLoading } = useSelector(
    (state: AppState) => state.workflows
  );

  useEffect(() => {
    if (opensearchError) {
      setError(opensearchError);
    }
  }, [opensearchError]);

  // fetch field mappings on init and for any selected index changes
  useEffect(() => {
    if (!isEmpty(selectedIndexId)) {
      dispatch(getMappings({ index: selectedIndexId, dataSourceId }))
        .unwrap()
        .then((response: IndexMappings) => {
          setFieldMappings(response);
        })
        .catch((error) => {});
    } else {
      setFieldMappings(null);
    }
  }, [selectedIndexId]);

  // Update finalQuery when agent changes (and if the agent_id key exists)
  useEffect(() => {
    if (!isEmpty(selectedAgentId) && touched?.search?.agentId === true) {
      try {
        let updatedQuery = cloneDeep(finalQuery);
        if (updatedQuery?.query?.agentic?.agent_id !== undefined) {
          updatedQuery.query.agentic.agent_id = selectedAgentId || '';
          setFieldValue('search.request', customStringify(updatedQuery));
        }
      } catch {}
    }
  }, [selectedAgentId]);

  // Clear out any query_fields on index change (if the arr exists)
  useEffect(() => {
    if (!isEmpty(fieldMappings) && touched?.search?.index?.name === true) {
      try {
        let updatedQuery = cloneDeep(finalQuery);
        if (updatedQuery?.query?.agentic?.query_fields !== undefined) {
          updatedQuery.query.agentic.query_fields = [];
          setFieldValue('search.request', customStringify(updatedQuery));
        }
      } catch {}
    }
  }, [fieldMappings]);

  // Utility fn to validate the form and update the workflow if valid
  async function validateAndUpdateWorkflow(): Promise<boolean> {
    let success = false;
    await submitForm();
    await validateForm()
      .then(async (validationResults) => {
        // @ts-ignore
        const { search } = validationResults;
        // TODO: currently don't do any validation, as no resources are created. Just save whatever the users have filled out in the form.
        //if (search !== undefined && Object.keys(search)?.length > 0) {
        if (false) {
          getCore().notifications.toasts.addDanger('Missing or invalid fields');
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
            // TODO: for now, omit any "workflows" field as we are not provisioning anything in this view
            // workflows: configToTemplateFlows(updatedConfig, false, false),
          } as Workflow;
          await dispatch(
            updateWorkflow({
              apiBody: {
                workflowId: updatedWorkflow.id as string,
                workflowTemplate: reduceToTemplate(updatedWorkflow),
                reprovision: false,
              },
              dataSourceId,
            })
          );
        }
      })
      .catch((error) => {
        console.error('Error validating form: ', error);
      });

    return success;
  }

  // Utility fn to revert any unsaved changes, reset the form
  function revertUnsavedChanges(): void {
    resetForm();
  }

  const handleClear = () => {
    setSearchResponse(undefined);
    setError(undefined);
  };

  const handleSearch = () => {
    // "Autosave" by updating the workflow after every search is run.
    validateAndUpdateWorkflow();

    // Validate that all required fields are selected
    if (!finalQuery?.query?.agentic?.query_text) {
      setError('Please enter a search query');
      return;
    }

    if (!selectedIndexId) {
      setError('Please select an index');
      return;
    }

    if (!selectedAgentId) {
      setError('Please select an agent');
      return;
    }

    // All validations passed, proceed with search
    setIsSearching(true);
    setError(undefined);

    dispatch(
      searchIndex({
        apiBody: {
          index: selectedIndexId,
          body: injectPipelineIntoQuery(finalQuery),
        },
        dataSourceId,
        verbose: true,
      })
    )
      .unwrap()
      .then((response) => {
        setIsSearching(false);
        setSearchResponse(response);
      })
      .catch((error) => {
        setIsSearching(false);
        setError(`Search failed: ${error}`);
      });
  };

  function injectPipelineIntoQuery(finalQuery: any): {} {
    return {
      ...finalQuery,
      search_pipeline: runtimeSearchPipeline,
    };
  }

  return (
    <EuiPanel
      paddingSize="l"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <EuiFlexGroup direction="column" gutterSize="m">
        <EuiFlexItem grow={false}>
          <EuiFlexGroup
            gutterSize="m"
            alignItems="center"
            justifyContent="spaceBetween"
          >
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="xs" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiText size="m">
                    <h2>Agentic Search</h2>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty
                    size="s"
                    iconType="questionInCircle"
                    onClick={() => setIsModalVisible(true)}
                  >
                    Learn more
                  </EuiButtonEmpty>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup direction="row" gutterSize="s">
                <EuiFlexItem grow={false}>
                  <EuiSmallButtonEmpty
                    disabled={!dirty}
                    isLoading={workflowsLoading}
                    onClick={async () => {
                      await validateAndUpdateWorkflow();
                    }}
                  >
                    {workflowsLoading
                      ? 'Saving'
                      : !dirty
                      ? 'All changes saved'
                      : 'Save'}
                  </EuiSmallButtonEmpty>
                </EuiFlexItem>
                {dirty && (
                  <EuiFlexItem grow={false}>
                    <EuiSmallButtonEmpty
                      disabled={workflowsLoading}
                      onClick={() => revertUnsavedChanges()}
                      iconSide="right"
                      iconType="editorUndo"
                    >
                      {'Undo'}
                    </EuiSmallButtonEmpty>
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="m" />
        </EuiFlexItem>
        {isModalVisible && (
          <AgentInfoModal onClose={() => setIsModalVisible(false)} />
        )}
        <EuiFlexItem grow={false}>
          <EuiPanel color="subdued" hasShadow={false} paddingSize="s">
            <IndexSelector />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <AgentConfiguration />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiPanel color="subdued" hasShadow={false} paddingSize="s">
            <SearchQuery
              setSearchPipeline={setRuntimeSearchPipeline}
              uiConfig={props.uiConfig}
              fieldMappings={fieldMappings}
            />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="row" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiFlexGroup direction="row" gutterSize="s">
                <EuiFlexItem grow={false}>
                  <EuiToolTip
                    content={
                      !finalQuery?.query?.agentic?.query_text ||
                      !selectedIndexId ||
                      !selectedAgentId
                        ? 'Select an index and agent, and enter a search query'
                        : 'Search using AI agent'
                    }
                  >
                    <EuiSmallButton
                      onClick={handleSearch}
                      fill
                      iconType="search"
                      isLoading={isSearching}
                      isDisabled={
                        !finalQuery?.query?.agentic?.query_text ||
                        !selectedIndexId ||
                        !selectedAgentId
                      }
                    >
                      Search
                    </EuiSmallButton>
                  </EuiToolTip>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup direction="row" gutterSize="s">
                {searchResponse && (
                  <EuiFlexItem grow={false}>
                    <EuiToolTip content="Clear search results and form">
                      <EuiSmallButton onClick={handleClear} iconType="eraser">
                        Clear results
                      </EuiSmallButton>
                    </EuiToolTip>
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        {error !== undefined && (
          <EuiFlexItem grow={false}>
            <EuiCallOut title="Error" color="danger" iconType="alert">
              <p>{error}</p>
            </EuiCallOut>
            <EuiSpacer size="m" />
          </EuiFlexItem>
        )}
        {searchResponse !== undefined && (
          <EuiFlexItem grow={false}>
            <SearchResults searchResponse={searchResponse} />
          </EuiFlexItem>
        )}
        <EuiFlexItem />
      </EuiFlexGroup>
    </EuiPanel>
  );
}
