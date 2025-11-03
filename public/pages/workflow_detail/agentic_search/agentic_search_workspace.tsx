/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { isEmpty, isEqual } from 'lodash';
import { getIn, useFormikContext } from 'formik';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import {
  getMappings,
  searchAgents,
  updateWorkflow,
  useAppDispatch,
} from '../../../store';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSmallButtonIcon,
} from '@elastic/eui';
import {
  AGENT_ID_PATH,
  FETCH_ALL_QUERY_LARGE,
  IndexMappings,
  NEW_AGENT_PLACEHOLDER,
  Workflow,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../common';
import {
  formikToUiConfig,
  reduceToTemplate,
  getDataSourceId,
  AGENTIC_SEARCH_WORKSPACE_HEIGHT,
} from '../../../utils';
import { getCore } from '../../../services';
import { ConfigureFlow } from './configure_flow';
import { TestFlow } from './test_flow';

interface AgenticSearchWorkspaceProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig | undefined;
}

const CONFIGURE_AGENT_QUERY_PARAM = 'configureAgent';

/**
 * Resizable workspace for configuring agents and executing agentic search.
 */
export function AgenticSearchWorkspace(props: AgenticSearchWorkspaceProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const history = useHistory();
  const dataSourceId = getDataSourceId();
  const { values, submitForm, validateForm, setTouched } = useFormikContext<
    WorkflowFormValues
  >();
  const [fieldMappings, setFieldMappings] = useState<IndexMappings | undefined>(
    undefined
  );
  const selectedIndexId = getIn(values, 'search.index.name', '') as string;

  // Get configureAgentOpen from URL params, default to true
  const queryParams = queryString.parse(location.search);
  const configureAgentFromUrl = queryParams[CONFIGURE_AGENT_QUERY_PARAM];
  const [configureAgentOpen, setConfigureAgentOpenState] = useState<boolean>(
    configureAgentFromUrl === 'false' ? false : true
  );

  // Update URL when configureAgentOpen changes
  const setConfigureAgentOpen = (open: boolean) => {
    setConfigureAgentOpenState(open);
    const newParams = {
      ...queryParams,
      [CONFIGURE_AGENT_QUERY_PARAM]: open.toString(),
    };
    history.replace({
      ...location,
      search: queryString.stringify(newParams),
    });
  };

  // fetch all existing agents on initial load
  useEffect(() => {
    dispatch(searchAgents({ apiBody: FETCH_ALL_QUERY_LARGE, dataSourceId }));
  }, []);

  // fetch field mappings on init and for any selected index changes
  useEffect(() => {
    if (!isEmpty(selectedIndexId)) {
      dispatch(getMappings({ index: selectedIndexId, dataSourceId }))
        .unwrap()
        .then((response: IndexMappings) => {
          setFieldMappings(response);
        })
        .catch((error) => {
          setFieldMappings(undefined);
        });
    } else {
      setFieldMappings(undefined);
    }
  }, [selectedIndexId]);

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

  // Listen on changes in the form, and compare to what's persisted in the stored config.
  // If there are valid changes made, automatically save the workflow.
  useEffect(() => {
    // index field
    const persistedIndexName = props.uiConfig?.search?.index?.name?.value;
    const formIndexName = getIn(values, 'search.index.name');
    const indexNameChanged =
      formIndexName !== undefined &&
      !isEqual(persistedIndexName, formIndexName);

    // agent field
    const persistedAgentId = props.uiConfig?.search?.requestAgentId?.value;
    const formAgentId = getIn(values, AGENT_ID_PATH);
    const agentIdChanged =
      !isEmpty(formAgentId) &&
      !isEqual(formAgentId, NEW_AGENT_PLACEHOLDER) &&
      !isEqual(persistedAgentId, formAgentId);

    // Only handle for index or agent changes. For search query changes, we "autosave" on search.
    if (indexNameChanged || agentIdChanged) {
      validateAndUpdateWorkflow();
    }
  }, [
    getIn(values, 'search.index.name'),
    getIn(values, AGENT_ID_PATH),
    props.uiConfig,
  ]);

  return (
    <EuiFlexGroup
      direction="row"
      gutterSize="s"
      className="stretch-absolute"
      style={{
        // override height to be dependent on newHomePage setting
        height: AGENTIC_SEARCH_WORKSPACE_HEIGHT,
      }}
    >
      <EuiFlexItem grow={configureAgentOpen}>
        <EuiPanel
          data-testid="agenticSearchInputPanel"
          paddingSize="s"
          grow={true}
          borderRadius="l"
          style={{
            overflowX: 'hidden',
            overflowY: 'scroll',
          }}
        >
          {configureAgentOpen ? (
            <ConfigureFlow
              uiConfig={props.uiConfig}
              closePanel={() => setConfigureAgentOpen(false)}
            />
          ) : (
            <EuiSmallButtonIcon
              iconType="menuRight"
              onClick={() => setConfigureAgentOpen(true)}
              aria-label="openAgentConfig"
            />
          )}
        </EuiPanel>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiPanel
          data-testid="agenticSearchTestPanel"
          paddingSize="s"
          grow={true}
          borderRadius="l"
          style={{
            overflowX: 'hidden',
            overflowY: 'scroll',
          }}
        >
          <TestFlow
            uiConfig={props.uiConfig}
            fieldMappings={fieldMappings}
            saveWorkflow={validateAndUpdateWorkflow}
            configurePanelOpen={configureAgentOpen}
          />
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
