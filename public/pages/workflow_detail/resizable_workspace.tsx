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
  CachedFormikState,
  INSPECTOR_TAB_ID,
  Workflow,
  WorkflowConfig,
  customStringify,
} from '../../../common';
import { isValidUiWorkflow, reduceToTemplate } from '../../utils';
import { ComponentInput } from './component_input';
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
  setBlockNavigation: (blockNavigation: boolean) => void;
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

  // Readonly states for ingest and search. If there are unsaved changes in one context, block editing in the other.
  const [ingestReadonly, setIngestReadonly] = useState<boolean>(false);
  const [searchReadonly, setSearchReadonly] = useState<boolean>(false);
  const onIngest = selectedComponentId.startsWith('ingest');
  const onSearch = selectedComponentId.startsWith('search');

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
                setBlockNavigation={props.setBlockNavigation}
                displaySearchPanel={() => {
                  if (!isToolsPanelOpen) {
                    onToggleToolsChange();
                  }
                  setSelectedInspectorTabId(INSPECTOR_TAB_ID.TEST);
                }}
                setCachedFormikState={props.setCachedFormikState}
                selectedComponentId={selectedComponentId}
                setSelectedComponentId={setSelectedComponentId}
                setIngestReadonly={setIngestReadonly}
                setSearchReadonly={setSearchReadonly}
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
              <ComponentInput
                selectedComponentId={selectedComponentId}
                workflow={props.workflow}
                uiConfig={props.uiConfig as WorkflowConfig}
                setUiConfig={props.setUiConfig}
                setIngestDocs={props.setIngestDocs}
                lastIngested={props.lastIngested}
                readonly={
                  (onIngest && ingestReadonly) || (onSearch && searchReadonly)
                }
              />
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
