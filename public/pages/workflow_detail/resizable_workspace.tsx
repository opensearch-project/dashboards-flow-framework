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
  CachedFormikState,
  INSPECTOR_TAB_ID,
  Workflow,
  WorkflowConfig,
  customStringify,
} from '../../../common';
import {
  isValidUiWorkflow,
  reduceToTemplate,
  USE_NEW_HOME_PAGE,
} from '../../utils';
import { ComponentInput } from './workflow_inputs';
import { Tools } from './tools';
import { LeftNav } from './left_nav';

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
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
  lastIngested: number | undefined;
}

const WORKFLOW_INPUTS_PANEL_ID = 'workflow_inputs_panel_id';
const TOOLS_PANEL_ID = 'tools_panel_id';

/**
 * The overall workspace component that maintains state related to the 2 resizable
 * panels - the ReactFlow workspace panel and the selected component details panel.
 */
export function ResizableWorkspace(props: ResizableWorkspaceProps) {
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState<boolean>(true);
  // The global state for selected component ID.
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');

  // Preview side panel state. This panel encapsulates the tools panel as a child resizable panel.
  const [isPreviewPanelOpen, setIsPreviewPanelOpen] = useState<boolean>(true);
  const collapseFnHorizontal = useRef(
    (id: string, options: { direction: 'left' | 'right' }) => {}
  );
  const onToggleToolsChange = () => {
    collapseFnHorizontal.current(TOOLS_PANEL_ID, { direction: 'right' });
    setIsToolsPanelOpen(!isToolsPanelOpen);
  };

  // Inspector panel state vars. Actions taken in the form can update the Inspector panel,
  // hence we keep top-level vars here to pass to both form and inspector components.
  const [ingestResponse, setIngestResponse] = useState<string>('');
  const [selectedInspectorTabId, setSelectedInspectorTabId] = useState<
    INSPECTOR_TAB_ID
  >(INSPECTOR_TAB_ID.TEST);

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
        marginTop: USE_NEW_HOME_PAGE ? '0' : '58px',
        height: USE_NEW_HOME_PAGE ? '100%' : 'calc(100% - 58px)',
        width: '100%',
        gap: '4px',
      }}
    >
      {(EuiResizablePanel, EuiResizableButton, { togglePanel }) => {
        if (togglePanel) {
          collapseFnHorizontal.current = (panelId: string, { direction }) =>
            togglePanel(panelId, { direction });
        }
        return (
          <>
            <div className="left-nav-static-width">
              <LeftNav
                workflow={props.workflow}
                uiConfig={props.uiConfig}
                setUiConfig={props.setUiConfig}
                setIngestResponse={setIngestResponse}
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
                displaySearchPanel={() => {
                  if (!isToolsPanelOpen) {
                    onToggleToolsChange();
                  }
                  setSelectedInspectorTabId(INSPECTOR_TAB_ID.TEST);
                }}
                setCachedFormikState={props.setCachedFormikState}
                setSelectedComponentId={setSelectedComponentId}
              />
            </div>
            <EuiResizablePanel
              id={WORKFLOW_INPUTS_PANEL_ID}
              mode="main"
              initialSize={50}
              minSize="25%"
              paddingSize="none"
              scrollable={false}
            >
              {/**
               * TODO: most of the global state / API
               * execution will be moved from WorkflowInputs => LeftNav. Over time, the props can be
               * shifted to that component, and WorkflowInputs can eventually be entirely removed.
               */}
              <ComponentInput
                selectedComponentId={selectedComponentId}
                workflow={props.workflow}
                uiConfig={props.uiConfig as WorkflowConfig}
                setUiConfig={props.setUiConfig}
                setIngestDocs={props.setIngestDocs}
                lastIngested={props.lastIngested}
              />
              {/* <WorkflowInputs
                workflow={props.workflow}
                uiConfig={props.uiConfig}
                setUiConfig={props.setUiConfig}
                setIngestResponse={setIngestResponse}
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
                displaySearchPanel={() => {
                  if (!isToolsPanelOpen) {
                    onToggleToolsChange();
                  }
                  setSelectedInspectorTabId(INSPECTOR_TAB_ID.TEST);
                }}
                setCachedFormikState={props.setCachedFormikState}
              /> */}
            </EuiResizablePanel>
            <EuiResizableButton />
            <EuiResizablePanel
              id={TOOLS_PANEL_ID}
              mode="collapsible"
              initialSize={50}
              minSize="25%"
              paddingSize="none"
              borderRadius="l"
              onToggleCollapsedInternal={() => onToggleToolsChange()}
            >
              <Tools
                workflow={props.workflow}
                ingestResponse={ingestResponse}
                selectedTabId={selectedInspectorTabId}
                setSelectedTabId={setSelectedInspectorTabId}
                selectedStep={props.selectedStep}
                uiConfig={props.uiConfig}
              />
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
