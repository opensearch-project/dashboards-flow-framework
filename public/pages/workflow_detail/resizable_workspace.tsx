/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  EuiCodeBlock,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiResizableContainer,
  EuiText,
} from '@elastic/eui';
import {
  CONFIG_STEP,
  Workflow,
  WorkflowConfig,
  customStringify,
} from '../../../common';
import {
  isValidUiWorkflow,
  reduceToTemplate,
  SHOW_ACTIONS_IN_HEADER,
} from '../../utils';
import { WorkflowInputs } from './workflow_inputs';
import { Workspace } from './workspace';
import { Tools } from './tools';

// styling
import './workspace/workspace-styles.scss';
import '../../global-styles.scss';

interface ResizableWorkspaceProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig | undefined;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  ingestDocs: string;
  setIngestDocs: (docs: string) => void;
  isRunningIngest: boolean;
  setIsRunningIngest: (isRunningIngest: boolean) => void;
  isRunningSearch: boolean;
  setIsRunningSearch: (isRunningSearch: boolean) => void;
  selectedStep: CONFIG_STEP;
  setSelectedStep: (step: CONFIG_STEP) => void;
  setUnsavedIngestProcessors: (unsavedIngestProcessors: boolean) => void;
  setUnsavedSearchProcessors: (unsavedSearchProcessors: boolean) => void;
}

const WORKFLOW_INPUTS_PANEL_ID = 'workflow_inputs_panel_id';
const PREVIEW_PANEL_ID = 'preview_panel_id';
const TOOLS_PANEL_ID = 'tools_panel_id';

/**
 * The overall workspace component that maintains state related to the 2 resizable
 * panels - the ReactFlow workspace panel and the selected component details panel.
 */
export function ResizableWorkspace(props: ResizableWorkspaceProps) {
  // Preview side panel state. This panel encapsulates the tools panel as a child resizable panel.
  const [isPreviewPanelOpen, setIsPreviewPanelOpen] = useState<boolean>(true);
  const collapseFnHorizontal = useRef(
    (id: string, options: { direction: 'left' | 'right' }) => {}
  );
  const onTogglePreviewChange = () => {
    collapseFnHorizontal.current(PREVIEW_PANEL_ID, {
      direction: 'right',
    });
    setIsPreviewPanelOpen(!isPreviewPanelOpen);
  };

  // Tools side panel state
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState<boolean>(true);
  const collapseFnVertical = useRef(
    (id: string, options: { direction: 'top' | 'bottom' }) => {}
  );
  const onToggleToolsChange = () => {
    collapseFnVertical.current(TOOLS_PANEL_ID, { direction: 'bottom' });
    setIsToolsPanelOpen(!isToolsPanelOpen);
  };

  // ingest / search response states to be populated in the Tools panel
  const [ingestResponse, setIngestResponse] = useState<string>('');
  const [queryResponse, setQueryResponse] = useState<string>('');

  // is valid workflow state, + associated hook to set it as such
  const [isValidWorkflow, setIsValidWorkflow] = useState<boolean>(true);
  useEffect(() => {
    const missingUiFlow = props.workflow && !isValidUiWorkflow(props.workflow);
    if (missingUiFlow) {
      setIsValidWorkflow(false);
    }
  }, [props.workflow]);

  return isValidWorkflow ? (
    <EuiResizableContainer
      direction="horizontal"
      className="stretch-absolute"
      style={{
        marginLeft: '-8px',
        marginTop: SHOW_ACTIONS_IN_HEADER ? '-8px' : '40px',
      }}
    >
      {(EuiResizablePanel, EuiResizableButton, { togglePanel }) => {
        if (togglePanel) {
          collapseFnHorizontal.current = (panelId: string, { direction }) =>
            togglePanel(panelId, { direction });
        }
        return (
          <>
            <EuiResizablePanel
              id={WORKFLOW_INPUTS_PANEL_ID}
              mode="main"
              initialSize={60}
              minSize="25%"
              paddingSize="s"
              className="stretch-absolute panel-with-radius"
            >
              <WorkflowInputs
                workflow={props.workflow}
                uiConfig={props.uiConfig}
                setUiConfig={props.setUiConfig}
                setIngestResponse={setIngestResponse}
                setQueryResponse={setQueryResponse}
                ingestDocs={props.ingestDocs}
                setIngestDocs={props.setIngestDocs}
                isRunningIngest={props.isRunningIngest}
                setIsRunningIngest={props.setIsRunningIngest}
                isRunningSearch={props.isRunningSearch}
                setIsRunningSearch={props.setIsRunningSearch}
                selectedStep={props.selectedStep}
                setSelectedStep={props.setSelectedStep}
                setUnsavedIngestProcessors={props.setUnsavedIngestProcessors}
                setUnsavedSearchProcessors={props.setUnsavedSearchProcessors}
              />
            </EuiResizablePanel>
            <EuiResizableButton />
            <EuiResizablePanel
              id={PREVIEW_PANEL_ID}
              style={{
                marginRight: isPreviewPanelOpen ? '-32px' : '0px',
                marginBottom: isToolsPanelOpen ? '0px' : '24px',
              }}
              className="stretch-absolute panel-with-radius"
              mode="collapsible"
              initialSize={60}
              minSize="25%"
              paddingSize="s"
              onToggleCollapsedInternal={() => onTogglePreviewChange()}
            >
              <EuiResizableContainer
                className="workspace-panel stretch-absolute"
                direction="vertical"
                style={{
                  marginLeft: '-8px',
                  marginTop: '-8px',
                  padding: 'none',
                }}
              >
                {(EuiResizablePanel, EuiResizableButton, { togglePanel }) => {
                  if (togglePanel) {
                    collapseFnVertical.current = (
                      panelId: string,
                      { direction }
                    ) =>
                      // ignore is added since docs are incorrectly missing "top" and "bottom"
                      // as valid direction options for vertically-configured resizable panels.
                      // @ts-ignore
                      togglePanel(panelId, { direction });
                  }
                  return (
                    <>
                      <EuiResizablePanel
                        mode="main"
                        initialSize={60}
                        minSize="25%"
                        paddingSize="s"
                        style={{ marginBottom: '-8px' }}
                        className="stretch-absolute"
                      >
                        <EuiFlexGroup
                          direction="column"
                          gutterSize="s"
                          style={{ height: '100%' }}
                        >
                          <EuiFlexItem>
                            <Workspace
                              workflow={props.workflow}
                              uiConfig={props.uiConfig}
                            />
                          </EuiFlexItem>
                        </EuiFlexGroup>
                      </EuiResizablePanel>
                      <EuiResizableButton />
                      <EuiResizablePanel
                        id={TOOLS_PANEL_ID}
                        className="stretch-absolute panel-with-radius"
                        mode="collapsible"
                        initialSize={50}
                        minSize="25%"
                        paddingSize="s"
                        onToggleCollapsedInternal={() => onToggleToolsChange()}
                        style={{ marginBottom: '-16px' }}
                      >
                        <Tools
                          workflow={props.workflow}
                          ingestResponse={ingestResponse}
                          queryResponse={queryResponse}
                        />
                      </EuiResizablePanel>
                    </>
                  );
                }}
              </EuiResizableContainer>
            </EuiResizablePanel>
          </>
        );
      }}
    </EuiResizableContainer>
  ) : (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={3}>
        <EuiEmptyPrompt
          iconType={'cross'}
          title={<h2>Unable to view workflow details</h2>}
          titleSize="s"
          body={
            <>
              <EuiText size="s">
                Only valid workflows created from this OpenSearch Dashboards
                application are editable and viewable.
              </EuiText>
            </>
          }
        />
      </EuiFlexItem>
      <EuiFlexItem grow={7}>
        <EuiCodeBlock language="json" fontSize="m" isCopyable={false}>
          {customStringify(reduceToTemplate(props.workflow as Workflow))}
        </EuiCodeBlock>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
