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
  searchIndex,
  updateWorkflow,
  useAppDispatch,
} from '../../store';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSmallButton,
  EuiBetaBadge,
  EuiSpacer,
  EuiCallOut,
  EuiToolTip,
  EuiButtonEmpty,
  EuiSmallButtonIcon,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import {
  customStringify,
  Workflow,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../common';
import { getDataSourceId } from '../../utils/utils';
import { SimplifiedAgentSelector } from './components/simplified_agent_selector';
import { SimplifiedSearchQuery } from './components/simplified_search_query';
import { SimplifiedIndexSelector } from './components/simplified_index_selector';
import { SimplifiedSearchResults } from './components/simplified_search_results';
import { SimplifiedAgenticInfoModal } from './components/simplified_agentic_info_modal';
import { SimplifiedFieldSelector } from './components/simplified_field_selector';
import { formikToUiConfig, reduceToTemplate } from '../../utils';
import { getCore } from '../../services';

// styling
import '../../global-styles.scss';

interface SimplifiedWorkspaceProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig | undefined;
  setBlockNavigation: (blockNavigation: boolean) => void; // TODO: block if unsaved changes.
}

/**
 * Simplified workspace component for the Agentic Search (Simplified) workflow type.
 * This component provides a streamlined UI with just a search bar and two dropdowns.
 */
// Constant for consistent form widths
const FORM_WIDTH = '750px';

export function SimplifiedWorkspace(props: SimplifiedWorkspaceProps) {
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
  const [error, setError] = useState<string | null>(null);

  const {
    loading: opensearchLoading,
    errorMessage: opensearchError,
  } = useSelector((state: AppState) => state.opensearch);

  const { loading: workflowsLoading } = useSelector(
    (state: AppState) => state.workflows
  );

  useEffect(() => {
    if (opensearchError) {
      setError(opensearchError);
    }
  }, [opensearchError]);

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

  // Utility fn to validate the form and update the workflow if valid
  async function validateAndUpdateWorkflow(): Promise<boolean> {
    let success = false;
    await submitForm();
    await validateForm()
      .then(async (validationResults) => {
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
    setError(null);
  };

  const handleSearch = () => {
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
    setError(null);

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
              <EuiBetaBadge
                label="Experimental"
                tooltipContent="This feature is experimental and may change in future releases"
                size="s"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="m" />
        </EuiFlexItem>
        {isModalVisible && (
          <SimplifiedAgenticInfoModal
            onClose={() => setIsModalVisible(false)}
          />
        )}
        {error && (
          <EuiFlexItem grow={false}>
            <EuiCallOut title="Error" color="danger" iconType="alert">
              <p>{error}</p>
            </EuiCallOut>
            <EuiSpacer size="m" />
          </EuiFlexItem>
        )}
        <EuiFlexItem grow={false} style={{ maxWidth: FORM_WIDTH }}>
          <SimplifiedIndexSelector />
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ maxWidth: FORM_WIDTH }}>
          <SimplifiedAgentSelector />
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ maxWidth: FORM_WIDTH }}>
          <SimplifiedFieldSelector uiConfig={props.uiConfig} />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <SimplifiedSearchQuery setSearchPipeline={setRuntimeSearchPipeline} />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="row" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiFlexGroup direction="row">
                <EuiFlexItem grow={false}>
                  <EuiSmallButton
                    fill={true}
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
                      : 'Save configuration'}
                  </EuiSmallButton>
                </EuiFlexItem>
                {dirty && (
                  <EuiFlexItem grow={false} style={{ marginLeft: '0px' }}>
                    <EuiSmallButtonIcon
                      iconType={'editorUndo'}
                      aria-label="undo"
                      display="base"
                      iconSize="l"
                      isDisabled={workflowsLoading}
                      onClick={() => revertUnsavedChanges()}
                    />
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup direction="row" gutterSize="s">
                {searchResponse && (
                  <EuiFlexItem grow={false}>
                    <EuiToolTip content="Clear search results and form">
                      <EuiSmallButton onClick={handleClear} iconType="eraser">
                        Clear
                      </EuiSmallButton>
                    </EuiToolTip>
                  </EuiFlexItem>
                )}
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
                      isLoading={isSearching || opensearchLoading}
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
          </EuiFlexGroup>
        </EuiFlexItem>
        {searchResponse !== undefined && (
          <EuiFlexItem grow={false}>
            <SimplifiedSearchResults searchResponse={searchResponse} />
          </EuiFlexItem>
        )}
        <EuiFlexItem />
      </EuiFlexGroup>
    </EuiPanel>
  );
}
