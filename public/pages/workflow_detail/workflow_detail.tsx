/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { EuiSpacer } from '@elastic/eui';
import { BREADCRUMBS } from '../../utils';
import { getCore } from '../../services';
import { WorkflowDetailHeader } from './components';
import { Workspace } from './workspace';
import { AppState } from '../../store';

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
    <div>
      <WorkflowDetailHeader workflow={workflow} />
      <EuiSpacer size="l" />
      <Workspace workflow={workflow} />
    </div>
  );
}
