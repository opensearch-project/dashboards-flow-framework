/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, ReactElement } from 'react';
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
import { MountPoint } from '../../../../../src/core/public';

// styling
import './workflow-detail-styles.scss';
import '../../global-styles.scss';

import { getDataSourceId } from '../../utils/utils';

import {
  getDataSourceManagementPlugin,
  getDataSourceEnabled,
  getNotifications,
  getSavedObjectsClient,
} from '../../services';
import { DataSourceViewConfig } from '../../../../../src/plugins/data_source_management/public';

export interface WorkflowDetailRouterProps {
  workflowId: string;
}

interface WorkflowDetailProps
  extends RouteComponentProps<WorkflowDetailRouterProps> {
  setActionMenu: (menuMount?: MountPoint) => void;
  landingDataSourceId?: string;
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

  useEffect(() => {
    if (dataSourceEnabled) {
      getCore().chrome.setBreadcrumbs([
        BREADCRUMBS.FLOW_FRAMEWORK,
        BREADCRUMBS.WORKFLOWS(dataSourceId),
        { text: workflowName },
      ]);
    } else {
      getCore().chrome.setBreadcrumbs([
        BREADCRUMBS.FLOW_FRAMEWORK,
        BREADCRUMBS.WORKFLOWS(),
        { text: workflowName },
      ]);
    }
  }, []);

  // On initial load:
  // - fetch workflow
  // - fetch available models as their IDs may be used when building flows
  useEffect(() => {
    dispatch(getWorkflow({ workflowId, dataSourceId }));
    dispatch(searchModels({ apiBody: FETCH_ALL_QUERY_BODY, dataSourceId }));
  }, []);

  let renderDataSourceComponent: ReactElement | null = null;
  if (dataSourceEnabled && getDataSourceManagementPlugin()) {
    const DataSourceMenu = getDataSourceManagementPlugin().ui.getDataSourceMenu<
      DataSourceViewConfig
    >();
    renderDataSourceComponent = (
      <DataSourceMenu
        setMenuMountPoint={props.setActionMenu}
        componentType={'DataSourceView'}
        componentConfig={{
          activeOption: [{ id: dataSourceId }],
          fullWidth: false,
          savedObjects: getSavedObjectsClient(),
          notifications: getNotifications(),
        }}
      />
    );
  }

  return (
    <ReactFlowProvider>
      {dataSourceEnabled && renderDataSourceComponent}
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
