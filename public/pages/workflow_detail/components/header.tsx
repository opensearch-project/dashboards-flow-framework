/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiPageHeader, EuiButton, EuiLoadingSpinner } from '@elastic/eui';
import { DEFAULT_NEW_WORKFLOW_NAME, Workflow } from '../../../../common';

interface WorkflowDetailHeaderProps {
  tabs: any[];
  isNewWorkflow: boolean;
  workflow?: Workflow;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
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
        // TODO: finalize if this is needed
        <EuiButton fill={false} color="danger" onClick={() => {}}>
          Delete
        </EuiButton>,
      ]}
      tabs={props.tabs}
      bottomBorder={true}
    />
  );
}
