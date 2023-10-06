/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { EuiPage, EuiPageBody } from '@elastic/eui';
import { BREADCRUMBS } from '../../utils';
import { getCore } from '../../services';
import { WorkflowDetailHeader } from './components';
import { AppState } from '../../store';
import { ResizableWorkspace } from './workspace';

export interface WorkflowDetailRouterProps {
  workflowId: string;
}

interface WorkflowDetailProps
  extends RouteComponentProps<WorkflowDetailRouterProps> {}

export function WorkflowDetail(props: WorkflowDetailProps) {
  const { workflows } = useSelector((state: AppState) => state.workflows);

  const workflow = workflows.find(
    (wf) => wf.id === props.match?.params?.workflowId
  );
  const workflowName = workflow ? workflow.name : '';

  useEffect(() => {
    getCore().chrome.setBreadcrumbs([
      BREADCRUMBS.AI_APPLICATION_BUILDER,
      BREADCRUMBS.WORKFLOWS,
      { text: workflowName },
    ]);
  });

  return (
    <EuiPage>
      <EuiPageBody>
        <WorkflowDetailHeader workflow={workflow} />
        <ResizableWorkspace workflow={workflow} />
      </EuiPageBody>
    </EuiPage>
  );
}
