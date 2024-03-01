/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EuiPageHeader, EuiButton, EuiLoadingSpinner } from '@elastic/eui';
import { DEFAULT_NEW_WORKFLOW_NAME, Workflow } from '../../../../common';
import { saveWorkflow } from '../utils';
import { rfContext, AppState, removeDirty } from '../../../store';

interface WorkflowDetailHeaderProps {
  tabs: any[];
  isNewWorkflow: boolean;
  workflow?: Workflow;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
  const dispatch = useDispatch();
  const { reactFlowInstance } = useContext(rfContext);
  const isDirty = useSelector((state: AppState) => state.workspace.isDirty);

  return (
    <EuiPageHeader
      pageTitle={
        props.workflow ? (
          props.workflow.name
        ) : props.isNewWorkflow && !props.workflow ? (
          DEFAULT_NEW_WORKFLOW_NAME
        ) : (
          <EuiLoadingSpinner size="xl" />
        )
      }
      rightSideItems={[
        // TODO: add launch logic
        <EuiButton fill={false} onClick={() => {}}>
          Launch
        </EuiButton>,
        <EuiButton
          fill={false}
          disabled={!props.workflow || !isDirty}
          // TODO: if isNewWorkflow is true, clear the workflow cache if saving is successful.
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
