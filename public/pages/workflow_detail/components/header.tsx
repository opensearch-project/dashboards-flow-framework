/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiPageHeader, EuiButton } from '@elastic/eui';
import { Workflow } from '../../../../common';

interface WorkflowDetailHeaderProps {
  workflow?: Workflow;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
  return (
    <div>
      <EuiPageHeader
        pageTitle={props.workflow ? props.workflow.name : ''}
        description={props.workflow ? props.workflow.description : ''}
        rightSideItems={[
          <EuiButton fill={false} onClick={() => {}}>
            Prototype
          </EuiButton>,
          <EuiButton fill={false} onClick={() => {}}>
            Save
          </EuiButton>,
        ]}
      />
    </div>
  );
}
