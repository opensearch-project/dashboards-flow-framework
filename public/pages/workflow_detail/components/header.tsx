/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiPageHeader,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from '@elastic/eui';
import {
  DEFAULT_NEW_WORKFLOW_STATE,
  WORKFLOW_STATE,
  Workflow,
} from '../../../../common';

interface WorkflowDetailHeaderProps {
  workflow?: Workflow;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
  // workflow state
  const [workflowName, setWorkflowName] = useState<string>('');
  const [workflowState, setWorkflowState] = useState<WORKFLOW_STATE>('');

  useEffect(() => {
    if (props.workflow) {
      setWorkflowName(props.workflow.name);
      setWorkflowState(props.workflow.state || DEFAULT_NEW_WORKFLOW_STATE);
    }
  }, [props.workflow]);

  return (
    <EuiPageHeader
      style={{ marginTop: '-8px' }}
      pageTitle={
        <EuiFlexGroup direction="row" alignItems="flexEnd" gutterSize="m">
          <EuiFlexItem grow={false}>{workflowName}</EuiFlexItem>
          <EuiFlexItem grow={false} style={{ marginBottom: '10px' }}>
            <EuiText size="m">{workflowState}</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      }
      rightSideItems={[
        // TODO: implement export functionality
        <EuiButton fill={false} style={{ marginTop: '8px' }} onClick={() => {}}>
          Export
        </EuiButton>,
      ]}
      bottomBorder={false}
    />
  );
}
