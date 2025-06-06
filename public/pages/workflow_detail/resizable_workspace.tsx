/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { isEmpty } from 'lodash';
import {
  EuiCodeBlock,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiResizableContainer,
  EuiSmallButtonIcon,
  EuiText,
} from '@elastic/eui';
import {
  COMPONENT_ID,
  CachedFormikState,
  INSPECTOR_TAB_ID,
  Workflow,
  WorkflowConfig,
  customStringify,
} from '../../../common';
import {
  aggregateConsoleErrors,
  formatProcessorError,
  isValidUiWorkflow,
  reduceToTemplate,
} from '../../utils';
import { ComponentInput } from './component_input';
import { Tools } from './tools';
import { LeftNav } from './left_nav';
import { AppState } from '../../store';
import { Console } from './tools/console';

// styling
import './workspace/workspace-styles.scss';
import '../../global-styles.scss';
import { useSelector } from 'react-redux';

interface ResizableWorkspaceProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig | undefined;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  ingestDocs: string;
  setIngestDocs: (docs: string) => void;
  setBlockNavigation: (blockNavigation: boolean) => void;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
}

const WORKFLOW_INPUTS_PANEL_ID = 'workflow_inputs_panel_id';
const TOOLS_PANEL_ID = 'tools_panel_id';

/**
 * The overall workspace component that maintains state related to the 2 resizable
 * panels - the ReactFlow workspace panel and the selected component details panel.
 */
export function ResizableWorkspace(props: ResizableWorkspaceProps) {
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState<boolean>(true);
  // The global state for selected component ID. Default to the source data (if ingest enabled)
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
  useEffect(() => {
    if (
      props.uiConfig?.ingest?.enabled?.value === true &&
      isEmpty(selectedComponentId)
    ) {
      setSelectedComponentId(COMPONENT_ID.SOURCE_DATA);
    }
  }, [props.uiConfig?.ingest?.enabled]);

  // const [currentWorkflowId, setCurrentWorkflowId] = useState<
  //   string | undefined
  // >(props.workflow?.id);

  // Always start with console closed when workflow changes
  const [isConsolePanelOpen, setIsConsolePanelOpen] = useState<boolean>(false);

  // Reset console state when workflow changes - ensure it's always closed initially
  // useEffect(() => {
  //   if (props.workflow?.id !== currentWorkflowId) {
  //     setCurrentWorkflowId(props.workflow?.id);
  //     setIsConsolePanelOpen(false); // Always close on workflow change
  //   }
  // }, [props.workflow?.id, currentWorkflowId]);

  useEffect(() => {
    setIsConsolePanelOpen(false);
  }, [props.workflow?.id]);

  const [leftNavOpen, setLeftNavOpen] = useState<boolean>(true);

  // misc ingest-related state required to be shared across the left nav
  // and ingest-related components
  const [lastIngested, setLastIngested] = useState<number | undefined>(
    undefined
  );
  const [ingestUpdateRequired, setIngestUpdateRequired] = useState<boolean>(
    false
  );

  // Readonly states for ingest and search. If there are unsaved changes in one context, block editing in the other.
  const [ingestReadonly, setIngestReadonly] = useState<boolean>(false);
  const [searchReadonly, setSearchReadonly] = useState<boolean>(false);
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const onIngest = selectedComponentId.startsWith('ingest');
  const onSearch = selectedComponentId.startsWith('search');

  // Panel refs
  const toolsPanelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const collapseFnHorizontal = useRef<
    (id: string, options: { direction: 'left' | 'right' }) => void
  >(() => {});

  const onToggleToolsChange = useCallback(() => {
    if (typeof collapseFnHorizontal.current === 'function') {
      collapseFnHorizontal.current(TOOLS_PANEL_ID, { direction: 'right' });
    }
    setIsToolsPanelOpen(!isToolsPanelOpen);
  }, [isToolsPanelOpen]);

  const onToggleConsoleChange = useCallback(() => {
    setIsConsolePanelOpen(!isConsolePanelOpen);
  }, [isConsolePanelOpen]);

  // Inspector panel state vars. Actions taken in the form can update the Inspector panel,
  // hence we keep top-level vars here to pass to both form and inspector components.
  const [ingestResponse, setIngestResponse] = useState<string>('');
  const [selectedInspectorTabId, setSelectedInspectorTabId] = useState<
    INSPECTOR_TAB_ID
  >(INSPECTOR_TAB_ID.TEST);

  const { opensearch, workflows } = useSelector((state: AppState) => state);
  const opensearchError = opensearch.errorMessage;
  const workflowsError = workflows.errorMessage;
  const {
    ingestPipeline: ingestPipelineErrors,
    searchPipeline: searchPipelineErrors,
  } = useSelector((state: AppState) => state.errors);
  // Error display messages and actual error count
  const [consoleErrorMessages, setConsoleErrorMessages] = useState<
    (string | ReactNode)[]
  >([]);
  const [actualErrorCount, setActualErrorCount] = useState<number>(0);

  useEffect(() => {
    const { errorMessages, errorCount } = aggregateConsoleErrors(
      opensearchError,
      workflowsError,
      ingestPipelineErrors,
      searchPipelineErrors,
      props.workflow?.error
    );

    setConsoleErrorMessages(errorMessages);
    setActualErrorCount(errorCount);
  }, [
    opensearchError,
    workflowsError,
    ingestPipelineErrors,
    searchPipelineErrors,
    props.workflow?.error,
  ]);

  // is valid workflow state, + associated hook to set it as such
  const [isValidWorkflow, setIsValidWorkflow] = useState<boolean>(true);
  useEffect(() => {
    const missingUiFlow = props.workflow && !isValidUiWorkflow(props.workflow);
    if (missingUiFlow) {
      setIsValidWorkflow(false);
    }
  }, [props.workflow]);

  function displaySearchPanel(): void {
    if (!isToolsPanelOpen) {
      onToggleToolsChange();
    }
    setSelectedInspectorTabId(INSPECTOR_TAB_ID.TEST);
  }

  // Force no page overflow
  useEffect(() => {
    // Store original styles
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Force no scrollbars
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Also fix any EUI containers that might be causing overflow
    const euiPage = document.querySelector('.euiPage') as HTMLElement;
    const euiPageBody = document.querySelector('.euiPageBody') as HTMLElement;

    let originalEuiPageOverflow = '';
    let originalEuiPageBodyOverflow = '';

    if (euiPage) {
      originalEuiPageOverflow = euiPage.style.overflow;
      euiPage.style.overflow = 'hidden';
      euiPage.style.maxHeight = '100vh';
    }

    if (euiPageBody) {
      originalEuiPageBodyOverflow = euiPageBody.style.overflow;
      euiPageBody.style.overflow = 'hidden';
      euiPageBody.style.maxHeight = '100%';
    }

    return () => {
      // Restore original styles on cleanup
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;

      if (euiPage) {
        euiPage.style.overflow = originalEuiPageOverflow;
        euiPage.style.maxHeight = '';
      }

      if (euiPageBody) {
        euiPageBody.style.overflow = originalEuiPageBodyOverflow;
        euiPageBody.style.maxHeight = '';
      }
    };
  }, []);

  return isValidWorkflow ? (
    <div
      data-test-subj="resizable-workspace"
      style={{
        // Keep our component properly sized
        // do not change this value since the header cost 148px
        height: 'calc(100vh - 148px)',
        maxHeight: 'calc(100vh - 148px)',
        width: 'calc(100vw - 16px)',
        maxWidth: 'calc(100vw - 16px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        //avoid console panel scroll bar when first render
        overflowX: 'hidden',
        overflowY: 'hidden',
      }}
    >
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <EuiResizableContainer
          key="debug-static-key"
          direction="horizontal"
          style={{
            width: '100%',
            flex: 1,
            gap: '2px',
            maxWidth: '100vw',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {(EuiResizablePanel, EuiResizableButton, { togglePanel }) => {
            if (togglePanel) {
              collapseFnHorizontal.current = togglePanel;
            }

            return (
              <>
                <div
                  className={leftNavOpen ? 'left-nav-static-width' : undefined}
                >
                  {leftNavOpen ? (
                    <LeftNav
                      workflow={props.workflow}
                      uiConfig={props.uiConfig}
                      setUiConfig={props.setUiConfig}
                      setIngestResponse={setIngestResponse}
                      ingestDocs={props.ingestDocs}
                      setIngestDocs={props.setIngestDocs}
                      setIngestUpdateRequired={setIngestUpdateRequired}
                      setBlockNavigation={props.setBlockNavigation}
                      displaySearchPanel={displaySearchPanel}
                      setCachedFormikState={props.setCachedFormikState}
                      setLastIngested={setLastIngested}
                      selectedComponentId={selectedComponentId}
                      setSelectedComponentId={setSelectedComponentId}
                      setIngestReadonly={setIngestReadonly}
                      setSearchReadonly={setSearchReadonly}
                      setIsProvisioning={setIsProvisioning}
                      onClose={() => setLeftNavOpen(false)}
                      isConsolePanelOpen={isConsolePanelOpen}
                    />
                  ) : undefined}
                </div>

                <EuiResizablePanel
                  id={WORKFLOW_INPUTS_PANEL_ID}
                  mode="main"
                  initialSize={60}
                  minSize="30%"
                  paddingSize="none"
                  scrollable={false}
                  style={{
                    maxWidth: 'calc(100vw - 350px)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: '100%',
                      overflow: 'auto',
                      maxWidth: '100%',
                    }}
                  >
                    <ComponentInput
                      selectedComponentId={selectedComponentId}
                      workflow={props.workflow}
                      uiConfig={props.uiConfig as WorkflowConfig}
                      setUiConfig={props.setUiConfig}
                      setIngestDocs={props.setIngestDocs}
                      lastIngested={lastIngested}
                      ingestUpdateRequired={ingestUpdateRequired}
                      readonly={
                        (onIngest && ingestReadonly) ||
                        (onSearch && searchReadonly) ||
                        isProvisioning
                      }
                      leftNavOpen={leftNavOpen}
                      openLeftNav={() => setLeftNavOpen(true)}
                      displaySearchPanel={displaySearchPanel}
                    />
                  </div>
                </EuiResizablePanel>

                <EuiResizableButton />

                <EuiResizablePanel
                  id={TOOLS_PANEL_ID}
                  mode="collapsible"
                  initialSize={40}
                  minSize="300px"
                  paddingSize="none"
                  borderRadius="l"
                  onToggleCollapsedInternal={() => {
                    onToggleToolsChange();
                  }}
                  style={{
                    minWidth: '300px',
                    flexShrink: 0,
                    flexGrow: 0,
                    flexBasis: 'auto',
                  }}
                >
                  <div
                    ref={toolsPanelRef}
                    style={{
                      height: '100%',
                      overflow: 'auto',
                      minWidth: '300px',
                    }}
                  >
                    <Tools
                      workflow={props.workflow}
                      selectedTabId={selectedInspectorTabId}
                      setSelectedTabId={setSelectedInspectorTabId}
                      uiConfig={props.uiConfig}
                    />
                  </div>
                </EuiResizablePanel>
              </>
            );
          }}
        </EuiResizableContainer>
      </div>

      <div
        style={{
          height: isConsolePanelOpen ? '30vh' : '35px',
          minHeight: isConsolePanelOpen ? '200px' : '35px',
          maxHeight: isConsolePanelOpen ? '30vh' : '35px',
          flexShrink: 0,
          borderTop: '1px solid #D3DAE6',
          transition: 'height 0.2s ease',
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          marginBottom: '8px',
          paddingBottom: '0px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <EuiPanel
          paddingSize="s"
          style={{
            height: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            borderTop: 'none',
            overflowX: 'hidden',
            overflowY:
              consoleErrorMessages.length > 0 || !isEmpty(ingestResponse)
                ? 'auto'
                : 'hidden',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="console-panel-no-scroll"
        >
          <EuiFlexGroup
            alignItems="center"
            justifyContent="spaceBetween"
            gutterSize="s"
            responsive={false}
            style={{
              marginBottom: isConsolePanelOpen ? '8px' : '0px',
              maxHeight: '28px',
              flexShrink: 0,
            }}
          >
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                <strong>Console</strong>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButtonIcon
                aria-label="Toggle console"
                iconType={isConsolePanelOpen ? 'fold' : 'unfold'}
                onClick={onToggleConsoleChange}
              />
            </EuiFlexItem>
          </EuiFlexGroup>

          {isConsolePanelOpen && (
            <EuiFlexItem grow={true} style={{ overflow: 'hidden' }}>
              <div style={{ height: '100%', overflow: 'hidden' }}>
                <Console
                  errorMessages={consoleErrorMessages}
                  errorCount={actualErrorCount}
                  ingestResponse={ingestResponse}
                />
              </div>
            </EuiFlexItem>
          )}
        </EuiPanel>
      </div>
    </div>
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
