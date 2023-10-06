/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { EuiResizableContainer } from '@elastic/eui';
import { Workflow } from '../../../../common';
import { Workspace } from './workspace';
import { ComponentInputs } from './component_inputs';

interface ResizableWorkspaceProps {
  workflow?: Workflow;
}

export function ResizableWorkspace(props: ResizableWorkspaceProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const collapseFn = useRef(
    (id: string, options: { direction: 'left' | 'right' }) => {}
  );

  const onToggleChange = () => {
    collapseFn.current('inputsPanel', { direction: 'left' });
    setIsOpen(!isOpen);
  };

  return (
    <EuiResizableContainer
      direction="horizontal"
      style={{ marginLeft: '-14px' }}
    >
      {(EuiResizablePanel, EuiResizableButton, { togglePanel }) => {
        if (togglePanel) {
          collapseFn.current = (panelId: string, { direction }) =>
            togglePanel(panelId, { direction });
        }

        return (
          <ReactFlowProvider>
            <EuiResizablePanel mode="main" initialSize={75} minSize="50%">
              <Workspace workflow={props.workflow} />
            </EuiResizablePanel>
            <EuiResizableButton />
            <EuiResizablePanel
              id="inputsPanel"
              mode="collapsible"
              initialSize={25}
              minSize="10%"
              onToggleCollapsedInternal={() => onToggleChange()}
            >
              <ComponentInputs
                onToggleChange={onToggleChange}
                isOpen={isOpen}
              />
            </EuiResizablePanel>
          </ReactFlowProvider>
        );
      }}
    </EuiResizableContainer>
  );
}
