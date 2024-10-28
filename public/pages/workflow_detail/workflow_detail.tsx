/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ReactFlowProvider } from 'reactflow';
import { escape } from 'lodash';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  EuiSmallButton,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
} from '@elastic/eui';
import {
  APP_PATH,
  BREADCRUMBS,
  SHOW_ACTIONS_IN_HEADER,
  uiConfigToFormik,
  uiConfigToSchema,
} from '../../utils';
import { getCore } from '../../services';
import { WorkflowDetailHeader } from './components';
import {
  AppState,
  catIndices,
  getWorkflow,
  searchConnectors,
  searchModels,
  useAppDispatch,
} from '../../store';
import { ResizableWorkspace } from './resizable_workspace';
import {
  ERROR_GETTING_WORKFLOW_MSG,
  FETCH_ALL_QUERY,
  MAX_WORKFLOW_NAME_TO_DISPLAY,
  NO_TEMPLATES_FOUND_MSG,
  OMIT_SYSTEM_INDEX_PATTERN,
  WorkflowConfig,
  WorkflowFormValues,
  WorkflowSchema,
  getCharacterLimitedString,
} from '../../../common';
import { MountPoint } from '../../../../../src/core/public';
import {
  constructHrefWithDataSourceId,
  getDataSourceId,
  isValidUiWorkflow,
} from '../../utils/utils';
import { getDataSourceEnabled } from '../../services';

// styling
import './workflow-detail-styles.scss';
import '../../global-styles.scss';

export interface WorkflowDetailRouterProps {
  workflowId: string;
}

interface WorkflowDetailProps
  extends RouteComponentProps<WorkflowDetailRouterProps> {
  setActionMenu: (menuMount?: MountPoint) => void;
}

/**
 * The workflow details page. This is where users will configure, create, and
 * test their created workflows. Additionally, can be used to load existing workflows
 * to view details and/or make changes to them.
 */

export function WorkflowDetail(props: WorkflowDetailProps) {
  const dispatch = useAppDispatch();

  // On initial load:
  // - fetch workflow
  // - fetch available models & connectors as their IDs may be used when building flows
  // - fetch all indices
  useEffect(() => {
    dispatch(getWorkflow({ workflowId, dataSourceId }));
    dispatch(searchModels({ apiBody: FETCH_ALL_QUERY, dataSourceId }));
    dispatch(searchConnectors({ apiBody: FETCH_ALL_QUERY, dataSourceId }));
    dispatch(catIndices({ pattern: OMIT_SYSTEM_INDEX_PATTERN, dataSourceId }));
  }, []);

  // data-source-related states
  const dataSourceEnabled = getDataSourceEnabled().enabled;
  const dataSourceId = getDataSourceId();
  const { workflows, errorMessage } = useSelector(
    (state: AppState) => state.workflows
  );

  // selected workflow state
  const workflowId = escape(props.match?.params?.workflowId);
  const workflow = workflows[workflowId];
  const workflowName = getCharacterLimitedString(
    workflow?.name || '',
    MAX_WORKFLOW_NAME_TO_DISPLAY
  );

  // setting breadcrumbs based on data source enabled
  const {
    chrome: { setBreadcrumbs },
  } = getCore();
  useEffect(() => {
    setBreadcrumbs(
      SHOW_ACTIONS_IN_HEADER
        ? [
            BREADCRUMBS.TITLE_WITH_REF(
              dataSourceEnabled ? dataSourceId : undefined
            ),
            BREADCRUMBS.WORKFLOW_NAME(workflowName),
            { text: '' },
          ]
        : [
            BREADCRUMBS.PLUGIN_NAME,
            BREADCRUMBS.WORKFLOWS(dataSourceEnabled ? dataSourceId : undefined),
            { text: workflowName },
          ]
    );
  }, [SHOW_ACTIONS_IN_HEADER, dataSourceEnabled, dataSourceId, workflowName]);

  // form state
  const [formValues, setFormValues] = useState<WorkflowFormValues>({});
  const [formSchema, setFormSchema] = useState<WorkflowSchema>(yup.object({}));

  // ingest docs state. we need to persist here to update the form values.
  const [ingestDocs, setIngestDocs] = useState<string>('');

  // Temp UI config state. For persisting changes to the UI config that may
  // not be saved in the backend (e.g., adding / removing an ingest processor)
  const [uiConfig, setUiConfig] = useState<WorkflowConfig | undefined>(
    undefined
  );

  // Initialize the UI config based on the workflow's config, if applicable.
  useEffect(() => {
    if (workflow?.ui_metadata?.config) {
      setUiConfig(workflow.ui_metadata.config);
    }
  }, [workflow]);

  // Initialize the form state based on the current UI config, if applicable
  useEffect(() => {
    if (uiConfig) {
      const initFormValues = uiConfigToFormik(uiConfig, ingestDocs);
      const initFormSchema = uiConfigToSchema(uiConfig);
      setFormValues(initFormValues);
      setFormSchema(initFormSchema);
    }
  }, [uiConfig]);

  return errorMessage.includes(ERROR_GETTING_WORKFLOW_MSG) ||
    errorMessage.includes(NO_TEMPLATES_FOUND_MSG) ? (
    <EuiFlexGroup direction="column" alignItems="center">
      <EuiFlexItem grow={3}>
        <EuiEmptyPrompt
          iconType={'cross'}
          title={<h2>Oops! We couldn't find that workflow</h2>}
          titleSize="s"
        />
      </EuiFlexItem>
      <EuiFlexItem grow={7}>
        <EuiSmallButton
          style={{ width: '200px' }}
          fill={false}
          href={constructHrefWithDataSourceId(APP_PATH.WORKFLOWS, dataSourceId)}
        >
          Return to home
        </EuiSmallButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  ) : (
    <Formik
      enableReinitialize={true}
      initialValues={formValues}
      validationSchema={formSchema}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      <ReactFlowProvider>
        <EuiPage>
          <EuiPageBody className="workflow-detail stretch-relative">
            <WorkflowDetailHeader
              workflow={workflow}
              setActionMenu={props.setActionMenu}
            />
            <ReactFlowProvider>
              <ResizableWorkspace
                workflow={workflow}
                uiConfig={uiConfig}
                setUiConfig={setUiConfig}
                ingestDocs={ingestDocs}
                setIngestDocs={setIngestDocs}
              />
            </ReactFlowProvider>
          </EuiPageBody>
        </EuiPage>
      </ReactFlowProvider>
    </Formik>
  );
}
