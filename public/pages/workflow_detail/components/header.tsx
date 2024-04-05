/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiPageHeader,
  EuiButton,
  EuiLoadingSpinner,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from '@elastic/eui';
import {
  DEFAULT_NEW_WORKFLOW_NAME,
  DEFAULT_NEW_WORKFLOW_STATE,
  Workflow,
} from '../../../../common';

interface WorkflowDetailHeaderProps {
  tabs: any[];
  isNewWorkflow: boolean;
  workflow?: Workflow;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
  function getTitle() {
    return props.workflow ? (
      props.workflow.name
    ) : props.isNewWorkflow && !props.workflow ? (
      DEFAULT_NEW_WORKFLOW_NAME
    ) : (
      <EuiLoadingSpinner size="xl" />
    );
  }

  function getState() {
    return props.workflow?.state
      ? props.workflow.state
      : props.isNewWorkflow
      ? DEFAULT_NEW_WORKFLOW_STATE
      : null;
  }

  return (
    <EuiPageHeader
      pageTitle={
        <EuiFlexGroup direction="row" alignItems="flexEnd" gutterSize="m">
          <EuiFlexItem grow={false}>{getTitle()}</EuiFlexItem>
          <EuiFlexItem grow={false} style={{ marginBottom: '10px' }}>
            <EuiText size="m">{getState()}</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      }
      rightSideItems={[
        // TODO: finalize if this is needed
        <EuiButton
          fill={false}
          color="danger"
          style={{ marginTop: '8px' }}
          onClick={() => {}}
        >
          Delete
        </EuiButton>,
      ]}
      tabs={props.tabs}
      bottomBorder={true}
    />
  );
}
