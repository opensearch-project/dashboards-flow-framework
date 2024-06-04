/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ReactFlowProvider } from 'reactflow';
import { EuiPage, EuiPageBody } from '@elastic/eui';
import { BREADCRUMBS } from '../../utils';
import { getCore } from '../../services';
import { WorkflowDetailHeader } from './components';
import {
  AppState,
  getWorkflow,
  searchModels,
  useAppDispatch,
} from '../../store';
import { ResizableWorkspace } from './resizable_workspace';
import {
  DEFAULT_NEW_WORKFLOW_NAME,
  FETCH_ALL_QUERY_BODY,
} from '../../../common';

// styling
import './workflow-detail-styles.scss';
import '../../global-styles.scss';

export interface WorkflowDetailRouterProps {
  workflowId: string;
}

interface WorkflowDetailProps
  extends RouteComponentProps<WorkflowDetailRouterProps> {}

/**
 * The workflow details page. This is where users will configure, create, and
 * test their created workflows. Additionally, can be used to load existing workflows
 * to view details and/or make changes to them.
 */

export function WorkflowDetail(props: WorkflowDetailProps) {
  const dispatch = useAppDispatch();
  const { workflows, errorMessage } = useSelector(
    (state: AppState) => state.workflows
  );

  // selected workflow state
  const workflowId = props.match?.params?.workflowId;
  const workflow = workflows[workflowId];
  const workflowName = workflow ? workflow.name : DEFAULT_NEW_WORKFLOW_NAME;

  useEffect(() => {
    getCore().chrome.setBreadcrumbs([
      BREADCRUMBS.FLOW_FRAMEWORK,
      BREADCRUMBS.WORKFLOWS,
      { text: workflowName },
    ]);
  });

  // On initial load:
  // - fetch workflow
  // - fetch available models as their IDs may be used when building flows
  useEffect(() => {
    dispatch(getWorkflow(workflowId));

    dispatch(searchModels(FETCH_ALL_QUERY_BODY));
  }, []);

  // Show a toast if an error message exists in state
  useEffect(() => {
    if (errorMessage) {
      console.error(errorMessage);
      getCore().notifications.toasts.addDanger(errorMessage);
    }
  }, [errorMessage]);

  return (
    <ReactFlowProvider>
      <EuiPage>
        <EuiPageBody className="workflow-detail stretch-relative">
          <WorkflowDetailHeader workflow={workflow} />
          <ReactFlowProvider>
            <ResizableWorkspace workflow={workflow} />
          </ReactFlowProvider>
        </EuiPageBody>
      </EuiPage>
    </ReactFlowProvider>
  );
}
