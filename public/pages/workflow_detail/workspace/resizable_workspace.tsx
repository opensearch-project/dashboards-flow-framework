/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { EuiResizableContainer } from '@elastic/eui';
import { Workflow } from '../../../../common';
import { Workspace } from './workspace';
import { ComponentDetails } from './component_details';

interface ResizableWorkspaceProps {
  workflow?: Workflow;
}

const COMPONENT_DETAILS_PANEL_ID = 'component_details_panel_id';

/**
 * The overall workspace component that maintains state related to the 2 resizable
 * panels - the ReactFlow workspace panel and the selected component details panel.
 */
export function ResizableWorkspace(props: ResizableWorkspaceProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const collapseFn = useRef(
    (id: string, options: { direction: 'left' | 'right' }) => {}
  );

  const onToggleChange = () => {
    collapseFn.current(COMPONENT_DETAILS_PANEL_ID, { direction: 'left' });
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
              id={COMPONENT_DETAILS_PANEL_ID}
              mode="collapsible"
              initialSize={25}
              minSize="10%"
              onToggleCollapsedInternal={() => onToggleChange()}
            >
              <ComponentDetails
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
