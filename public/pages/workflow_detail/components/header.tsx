/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiPageHeader,
  EuiButton,
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
  workflow?: Workflow;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
  function getTitle() {
    return props.workflow ? props.workflow.name : DEFAULT_NEW_WORKFLOW_NAME;
  }

  function getState() {
    return props.workflow ? props.workflow.state : DEFAULT_NEW_WORKFLOW_STATE;
  }

  return (
    <EuiPageHeader
      style={{ marginTop: '-8px' }}
      pageTitle={
        <EuiFlexGroup direction="row" alignItems="flexEnd" gutterSize="m">
          <EuiFlexItem grow={false}>{getTitle()}</EuiFlexItem>
          <EuiFlexItem grow={false} style={{ marginBottom: '10px' }}>
            <EuiText size="m">{getState()}</EuiText>
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
