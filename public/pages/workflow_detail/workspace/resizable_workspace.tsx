/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { EuiResizableContainer } from '@elastic/eui';
import { Workflow } from '../../../../common';
import { Workspace } from './workspace';
import { ComponentInputs } from './component_inputs';

interface ResizableWorkspaceProps {
  workflow?: Workflow;
}

export function ResizableWorkspace(props: ResizableWorkspaceProps) {
  return (
    <EuiResizableContainer
      direction="horizontal"
      style={{ marginLeft: '-14px' }}
    >
      {(EuiResizablePanel, EuiResizableButton) => (
        <ReactFlowProvider>
          <EuiResizablePanel
            mode="main"
            initialSize={60}
            minSize="50%"
            style={{ margin: 0, padding: 0 }}
          >
            <Workspace workflow={props.workflow} />
          </EuiResizablePanel>
          <EuiResizableButton />
          <EuiResizablePanel mode="collapsible" initialSize={40} minSize="10%">
            <ComponentInputs />
          </EuiResizablePanel>
        </ReactFlowProvider>
      )}
    </EuiResizableContainer>
  );
}
