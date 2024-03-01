/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EuiPageHeader, EuiButton } from '@elastic/eui';
import { Workflow } from '../../../../common';
import { saveWorkflow } from '../utils';
import { rfContext, AppState, removeDirty } from '../../../store';

interface WorkflowDetailHeaderProps {
  tabs: any[];
  formattedWorkflowName: string;
  workflow?: Workflow;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
  const dispatch = useDispatch();
  const { reactFlowInstance } = useContext(rfContext);
  const isDirty = useSelector((state: AppState) => state.workspace.isDirty);

  return (
    <EuiPageHeader
      pageTitle={props.formattedWorkflowName}
      rightSideItems={[
        <EuiButton fill={false} onClick={() => {}}>
          Prototype
        </EuiButton>,
        <EuiButton
          fill={false}
          disabled={!props.workflow || !isDirty}
          onClick={() => {
            // @ts-ignore
            saveWorkflow(props.workflow, reactFlowInstance);
            dispatch(removeDirty());
          }}
        >
          Save
        </EuiButton>,
      ]}
      tabs={props.tabs}
      bottomBorder={true}
    />
  );
}
