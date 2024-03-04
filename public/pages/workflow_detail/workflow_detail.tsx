/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ReactFlowProvider } from 'reactflow';
import queryString from 'query-string';
import { EuiPage, EuiPageBody } from '@elastic/eui';
import { BREADCRUMBS } from '../../utils';
import { getCore } from '../../services';
import { WorkflowDetailHeader } from './components';
import { AppState, searchWorkflows } from '../../store';
import { ResizableWorkspace } from './workspace';
import { Launches } from './launches';
import { Prototype } from './prototype';
import {
  DEFAULT_NEW_WORKFLOW_NAME,
  NEW_WORKFLOW_ID_URL,
} from '../../../common';

export interface WorkflowDetailRouterProps {
  workflowId: string;
}

interface WorkflowDetailProps
  extends RouteComponentProps<WorkflowDetailRouterProps> {}

enum WORKFLOW_DETAILS_TAB {
  EDITOR = 'editor',
  LAUNCHES = 'launches',
  PROTOTYPE = 'prototype',
}

const ACTIVE_TAB_PARAM = 'tab';

function replaceActiveTab(activeTab: string, props: WorkflowDetailProps) {
  props.history.replace({
    ...history,
    search: queryString.stringify({
      [ACTIVE_TAB_PARAM]: activeTab,
    }),
  });
}

/**
 * The workflow details page. This is where users will configure, create, and
 * test their created workflows. Additionally, can be used to load existing workflows
 * to view details and/or make changes to them.
 * New, unsaved workflows are cached in the redux store and displayed here.
 */

export function WorkflowDetail(props: WorkflowDetailProps) {
  const dispatch = useDispatch();
  const { workflows, cachedWorkflow } = useSelector(
    (state: AppState) => state.workflows
  );
  const { isDirty } = useSelector((state: AppState) => state.workspace);

  // selected workflow state
  const workflowId = props.match?.params?.workflowId;
  const isNewWorkflow = workflowId === NEW_WORKFLOW_ID_URL;
  const workflow = isNewWorkflow ? cachedWorkflow : workflows[workflowId];
  const workflowName = workflow
    ? workflow.name
    : isNewWorkflow && !workflow
    ? DEFAULT_NEW_WORKFLOW_NAME
    : '';

  // tab state
  const tabFromUrl = queryString.parse(useLocation().search)[
    ACTIVE_TAB_PARAM
  ] as WORKFLOW_DETAILS_TAB;
  const [selectedTabId, setSelectedTabId] = useState<WORKFLOW_DETAILS_TAB>(
    tabFromUrl
  );

  // Default to editor tab if there is none or invalid tab ID specified via url.
  useEffect(() => {
    if (
      !selectedTabId ||
      !Object.values(WORKFLOW_DETAILS_TAB).includes(selectedTabId)
    ) {
      setSelectedTabId(WORKFLOW_DETAILS_TAB.EDITOR);
      replaceActiveTab(WORKFLOW_DETAILS_TAB.EDITOR, props);
    }
  }, []);

  useEffect(() => {
    getCore().chrome.setBreadcrumbs([
      BREADCRUMBS.FLOW_FRAMEWORK,
      BREADCRUMBS.WORKFLOWS,
      { text: workflowName },
    ]);
  });

  // On initial load:
  // - fetch workflow, if there is an existing workflow ID
  // - add a window listener to warn users if they exit/refresh
  //   without saving latest changes
  useEffect(() => {
    if (!isNewWorkflow) {
      // TODO: can optimize to only fetch a single workflow
      dispatch(searchWorkflows({ query: { match_all: {} } }));
    }
    window.onbeforeunload = (e) =>
      isDirty || isNewWorkflow ? true : undefined;
  }, []);

  const tabs = [
    {
      id: WORKFLOW_DETAILS_TAB.EDITOR,
      label: 'Editor',
      isSelected: selectedTabId === WORKFLOW_DETAILS_TAB.EDITOR,
      onClick: () => {
        setSelectedTabId(WORKFLOW_DETAILS_TAB.EDITOR);
        replaceActiveTab(WORKFLOW_DETAILS_TAB.EDITOR, props);
      },
    },
    {
      id: WORKFLOW_DETAILS_TAB.LAUNCHES,
      label: 'Launches',
      isSelected: selectedTabId === WORKFLOW_DETAILS_TAB.LAUNCHES,
      onClick: () => {
        setSelectedTabId(WORKFLOW_DETAILS_TAB.LAUNCHES);
        replaceActiveTab(WORKFLOW_DETAILS_TAB.LAUNCHES, props);
      },
    },
    {
      id: WORKFLOW_DETAILS_TAB.PROTOTYPE,
      label: 'Prototype',
      isSelected: selectedTabId === WORKFLOW_DETAILS_TAB.PROTOTYPE,
      onClick: () => {
        setSelectedTabId(WORKFLOW_DETAILS_TAB.PROTOTYPE);
        replaceActiveTab(WORKFLOW_DETAILS_TAB.PROTOTYPE, props);
      },
    },
  ];

  return (
    <ReactFlowProvider>
      <EuiPage>
        <EuiPageBody>
          <WorkflowDetailHeader
            workflow={workflow}
            isNewWorkflow={isNewWorkflow}
            tabs={tabs}
          />
          {selectedTabId === WORKFLOW_DETAILS_TAB.EDITOR && (
            <ResizableWorkspace workflow={workflow} />
          )}
          {selectedTabId === WORKFLOW_DETAILS_TAB.LAUNCHES && <Launches />}
          {selectedTabId === WORKFLOW_DETAILS_TAB.PROTOTYPE && (
            <Prototype workflow={workflow} />
          )}
        </EuiPageBody>
      </EuiPage>
    </ReactFlowProvider>
  );
}
