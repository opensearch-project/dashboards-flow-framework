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
  showActionsInHeader,
} from '../../../common';
import { MountPoint } from '../../../../../src/core/public';

// styling
import './workflow-detail-styles.scss';
import '../../global-styles.scss';

import { getDataSourceId } from '../../utils/utils';

import { getDataSourceEnabled } from '../../services';

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
  const dataSourceEnabled = getDataSourceEnabled().enabled;
  const dataSourceId = getDataSourceId();
  const { workflows } = useSelector((state: AppState) => state.workflows);

  // selected workflow state
  const workflowId = props.match?.params?.workflowId;
  const workflow = workflows[workflowId];
  const workflowName = workflow ? workflow.name : DEFAULT_NEW_WORKFLOW_NAME;

  const {
    chrome: { setBreadcrumbs },
  } = getCore();
  useEffect(() => {
    setBreadcrumbs(
      showActionsInHeader
        ? [
            BREADCRUMBS.TITLE_WITH_REF(
              dataSourceEnabled ? dataSourceId : undefined
            ),
            BREADCRUMBS.WORKFLOW_NAME(workflowName),
            { text: '' },
          ]
        : [
            BREADCRUMBS.FLOW_FRAMEWORK,
            BREADCRUMBS.WORKFLOWS(dataSourceEnabled ? dataSourceId : undefined),
            { text: workflowName },
          ]
    );
  }, [showActionsInHeader, dataSourceEnabled, dataSourceId, workflowName]);

  // On initial load:
  // - fetch workflow
  // - fetch available models as their IDs may be used when building flows
  useEffect(() => {
    dispatch(getWorkflow({ workflowId, dataSourceId }));
    dispatch(searchModels({ apiBody: FETCH_ALL_QUERY_BODY, dataSourceId }));
  }, []);

  return (
    <ReactFlowProvider>
      <EuiPage>
        <EuiPageBody className="workflow-detail stretch-relative">
          <WorkflowDetailHeader
            workflow={workflow}
            setActionMenu={props.setActionMenu}
          />
          <ReactFlowProvider>
            <ResizableWorkspace workflow={workflow} />
          </ReactFlowProvider>
        </EuiPageBody>
      </EuiPage>
    </ReactFlowProvider>
  );
}
