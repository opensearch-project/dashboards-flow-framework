/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, ReactElement } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ReactFlowProvider } from 'reactflow';
import { escape } from 'lodash';
import {
  EuiButton,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
} from '@elastic/eui';
import { APP_PATH, BREADCRUMBS } from '../../utils';
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
  ERROR_GETTING_WORKFLOW_MSG,
  FETCH_ALL_QUERY_BODY,
  MAX_WORKFLOW_NAME_TO_DISPLAY,
  getCharacterLimitedString,
} from '../../../common';
import { MountPoint } from '../../../../../src/core/public';

// styling
import './workflow-detail-styles.scss';
import '../../global-styles.scss';

import {
  constructHrefWithDataSourceId,
  getDataSourceId,
} from '../../utils/utils';

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
  }, [workflowName]);

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

  return errorMessage.includes(ERROR_GETTING_WORKFLOW_MSG) ? (
    <EuiFlexGroup direction="column" alignItems="center">
      <EuiFlexItem grow={3}>
        <EuiEmptyPrompt
          iconType={'cross'}
          title={<h2>Oops! We couldn't find that workflow</h2>}
          titleSize="s"
        />
      </EuiFlexItem>
      <EuiFlexItem grow={7}>
        <EuiButton
          style={{ width: '200px' }}
          fill={false}
          href={constructHrefWithDataSourceId(APP_PATH.WORKFLOWS, dataSourceId)}
        >
          Return to home
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  ) : (
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
