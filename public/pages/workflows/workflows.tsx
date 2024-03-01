/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useLocation } from 'react-router-dom';
import {
  EuiPageHeader,
  EuiTitle,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
} from '@elastic/eui';
import queryString from 'query-string';
import { useDispatch, useSelector } from 'react-redux';
import { BREADCRUMBS } from '../../utils';
import { getCore } from '../../services';
import { WorkflowList } from './workflow_list';
import { NewWorkflow } from './new_workflow';
import { AppState, searchWorkflows } from '../../store';
import { EmptyListMessage } from './empty_list_message';

export interface WorkflowsRouterProps {}

interface WorkflowsProps extends RouteComponentProps<WorkflowsRouterProps> {}

enum WORKFLOWS_TAB {
  MANAGE = 'manage',
  CREATE = 'create',
}

const ACTIVE_TAB_PARAM = 'tab';

function replaceActiveTab(activeTab: string, props: WorkflowsProps) {
  props.history.replace({
    ...history,
    search: queryString.stringify({
      [ACTIVE_TAB_PARAM]: activeTab,
    }),
  });
}

/**
 * The base workflows page. From here, users can toggle between views to access
 * existing created workflows, or explore the library of workflow templates
 * to get started on a new workflow.
 */
export function Workflows(props: WorkflowsProps) {
  const dispatch = useDispatch();
  const { workflows, loading } = useSelector(
    (state: AppState) => state.workflows
  );

  const tabFromUrl = queryString.parse(useLocation().search)[
    ACTIVE_TAB_PARAM
  ] as WORKFLOWS_TAB;
  const [selectedTabId, setSelectedTabId] = useState<WORKFLOWS_TAB>(tabFromUrl);

  // If there is no selected tab or invalid tab, default to a tab depending
  // on if user has existing created workflows or not.
  useEffect(() => {
    if (
      !selectedTabId ||
      !Object.values(WORKFLOWS_TAB).includes(selectedTabId)
    ) {
      if (Object.keys(workflows).length > 0) {
        setSelectedTabId(WORKFLOWS_TAB.MANAGE);
        replaceActiveTab(WORKFLOWS_TAB.MANAGE, props);
      } else {
        setSelectedTabId(WORKFLOWS_TAB.CREATE);
        replaceActiveTab(WORKFLOWS_TAB.CREATE, props);
      }
    }
  }, [selectedTabId, workflows]);

  // If the user navigates back to the manage tab, re-fetch workflows
  useEffect(() => {
    if (selectedTabId === WORKFLOWS_TAB.MANAGE) {
      dispatch(searchWorkflows({ query: { match_all: {} } }));
    }
  }, [selectedTabId]);

  useEffect(() => {
    getCore().chrome.setBreadcrumbs([
      BREADCRUMBS.FLOW_FRAMEWORK,
      BREADCRUMBS.WORKFLOWS,
    ]);
  });

  // On initial render: fetch all workflows
  useEffect(() => {
    dispatch(searchWorkflows({ query: { match_all: {} } }));
  }, []);

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader
          pageTitle="Workflows"
          tabs={[
            {
              id: WORKFLOWS_TAB.MANAGE,
              label: 'Manage workflows',
              isSelected: selectedTabId === WORKFLOWS_TAB.MANAGE,
              onClick: () => {
                setSelectedTabId(WORKFLOWS_TAB.MANAGE);
                replaceActiveTab(WORKFLOWS_TAB.MANAGE, props);
              },
            },
            {
              id: WORKFLOWS_TAB.CREATE,
              label: 'New workflow',
              isSelected: selectedTabId === WORKFLOWS_TAB.CREATE,
              onClick: () => {
                setSelectedTabId(WORKFLOWS_TAB.CREATE);
                replaceActiveTab(WORKFLOWS_TAB.CREATE, props);
              },
            },
          ]}
          bottomBorder={true}
        />

        <EuiPageContent>
          <EuiTitle>
            <h2>
              {selectedTabId === WORKFLOWS_TAB.MANAGE && 'Workflows'}
              {selectedTabId === WORKFLOWS_TAB.CREATE &&
                'Create a new workflow'}
            </h2>
          </EuiTitle>
          <EuiSpacer size="m" />
          {selectedTabId === WORKFLOWS_TAB.MANAGE && <WorkflowList />}
          {selectedTabId === WORKFLOWS_TAB.CREATE && <NewWorkflow />}
          {selectedTabId === WORKFLOWS_TAB.MANAGE &&
            Object.values(workflows).length === 0 &&
            !loading && (
              <EmptyListMessage
                onClickNewWorkflow={() => {
                  setSelectedTabId(WORKFLOWS_TAB.CREATE);
                  replaceActiveTab(WORKFLOWS_TAB.CREATE, props);
                }}
              />
            )}
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
}
