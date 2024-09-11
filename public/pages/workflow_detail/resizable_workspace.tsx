/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import {
  EuiCodeBlock,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiResizableContainer,
  EuiText,
} from '@elastic/eui';

import {
  Workflow,
  WorkflowConfig,
  WorkflowFormValues,
  WorkflowSchema,
  customStringify,
} from '../../../common';
import {
  isValidUiWorkflow,
  reduceToTemplate,
  uiConfigToFormik,
  uiConfigToSchema,
} from '../../utils';
import { WorkflowInputs } from './workflow_inputs';
import { Workspace } from './workspace';
import { Tools } from './tools';

// styling
import './workspace/workspace-styles.scss';
import '../../global-styles.scss';

interface ResizableWorkspaceProps {
  workflow?: Workflow;
}

const WORKFLOW_INPUTS_PANEL_ID = 'workflow_inputs_panel_id';
const TOOLS_PANEL_ID = 'tools_panel_id';

/**
 * The overall workspace component that maintains state related to the 2 resizable
 * panels - the ReactFlow workspace panel and the selected component details panel.
 */
export function ResizableWorkspace(props: ResizableWorkspaceProps) {
  // Workflow state
  const [workflow, setWorkflow] = useState<Workflow | undefined>(
    props.workflow
  );

  // Formik form state
  const [formValues, setFormValues] = useState<WorkflowFormValues>({});
  const [formSchema, setFormSchema] = useState<WorkflowSchema>(yup.object({}));

  // ingest state
  const [ingestDocs, setIngestDocs] = useState<string>('');

  // query state
  const [query, setQuery] = useState<string>('');

  // Temp UI config state. For persisting changes to the UI config that may
  // not be saved in the backend (e.g., adding / removing an ingest processor)
  const [uiConfig, setUiConfig] = useState<WorkflowConfig | undefined>(
    undefined
  );

  // Workflow inputs side panel state
  const [isWorkflowInputsPanelOpen, setIsWorkflowInputsPanelOpen] = useState<
    boolean
  >(true);
  const collapseFnHorizontal = useRef(
    (id: string, options: { direction: 'left' | 'right' }) => {}
  );
  const onToggleWorkflowInputsChange = () => {
    collapseFnHorizontal.current(WORKFLOW_INPUTS_PANEL_ID, {
      direction: 'left',
    });
    setIsWorkflowInputsPanelOpen(!isWorkflowInputsPanelOpen);
  };

  // ingest state
  const [ingestResponse, setIngestResponse] = useState<string>('');

  // query state
  const [queryResponse, setQueryResponse] = useState<string>('');

  // Tools side panel state
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState<boolean>(true);
  const collapseFnVertical = useRef(
    (id: string, options: { direction: 'top' | 'bottom' }) => {}
  );
  const onToggleToolsChange = () => {
    collapseFnVertical.current(TOOLS_PANEL_ID, { direction: 'bottom' });
    setIsToolsPanelOpen(!isToolsPanelOpen);
  };

  // workflow state
  const [isValidWorkflow, setIsValidWorkflow] = useState<boolean>(true);

  // Hook to check if the workflow is valid or not
  useEffect(() => {
    const missingUiFlow = props.workflow && !isValidUiWorkflow(props.workflow);
    if (missingUiFlow) {
      setIsValidWorkflow(false);
    } else {
      setWorkflow(props.workflow);
    }
  }, [props.workflow]);

  // Initialize the form state based on the workflow's config, if applicable.
  useEffect(() => {
    if (workflow?.ui_metadata?.config) {
      setUiConfig(workflow.ui_metadata.config);
    }
  }, [workflow]);

  // Initialize the form state based on the current UI config
  useEffect(() => {
    if (uiConfig) {
      const initFormValues = uiConfigToFormik(uiConfig, ingestDocs);
      const initFormSchema = uiConfigToSchema(uiConfig);
      setFormValues(initFormValues);
      setFormSchema(initFormSchema);
    }
  }, [uiConfig]);

  return isValidWorkflow ? (
    <Formik
      enableReinitialize={true}
      initialValues={formValues}
      validationSchema={formSchema}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      {(formikProps) => (
        <Form>
          <EuiResizableContainer
            direction="horizontal"
            className="stretch-absolute"
            style={{
              marginLeft: isWorkflowInputsPanelOpen ? '-8px' : '0px',
              marginTop: '-8px',
            }}
          >
            {(EuiResizablePanel, EuiResizableButton, { togglePanel }) => {
              if (togglePanel) {
                collapseFnHorizontal.current = (
                  panelId: string,
                  { direction }
                ) => togglePanel(panelId, { direction });
              }

              return (
                <>
                  <EuiResizablePanel
                    id={WORKFLOW_INPUTS_PANEL_ID}
                    mode="collapsible"
                    initialSize={50}
                    minSize="25%"
                    paddingSize="s"
                    onToggleCollapsedInternal={() =>
                      onToggleWorkflowInputsChange()
                    }
                  >
                    <WorkflowInputs
                      workflow={props.workflow}
                      uiConfig={uiConfig}
                      setUiConfig={setUiConfig}
                      setIngestResponse={setIngestResponse}
                      setQueryResponse={setQueryResponse}
                      ingestDocs={ingestDocs}
                      setIngestDocs={setIngestDocs}
                      query={query}
                      setQuery={setQuery}
                    />
                  </EuiResizablePanel>
                  <EuiResizableButton />
                  <EuiResizablePanel
                    style={{
                      marginRight: '-32px',
                      marginBottom: isToolsPanelOpen ? '0px' : '24px',
                    }}
                    mode="main"
                    initialSize={60}
                    minSize="25%"
                    paddingSize="s"
                  >
                    <EuiResizableContainer
                      className="workspace-panel"
                      direction="vertical"
                      style={{
                        marginLeft: '-8px',
                        marginTop: '-8px',
                        padding: 'none',
                      }}
                    >
                      {(
                        EuiResizablePanel,
                        EuiResizableButton,
                        { togglePanel }
                      ) => {
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
                            >
                              <EuiFlexGroup
                                direction="column"
                                gutterSize="s"
                                style={{ height: '100%' }}
                              >
                                <EuiFlexItem>
                                  <Workspace
                                    workflow={props.workflow}
                                    uiConfig={uiConfig}
                                  />
                                </EuiFlexItem>
                              </EuiFlexGroup>
                            </EuiResizablePanel>
                            <EuiResizableButton data-testid="toolsPanelCollapseButton" />
                            <EuiResizablePanel
                              id={TOOLS_PANEL_ID}
                              mode="collapsible"
                              initialSize={50}
                              minSize="25%"
                              paddingSize="s"
                              onToggleCollapsedInternal={() =>
                                onToggleToolsChange()
                              }
                              style={{ marginBottom: '-16px' }}
                              data-testid="toolsPanelId"
                            >
                              <Tools
                                workflow={workflow}
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
        </Form>
      )}
    </Formik>
  ) : (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={3}>
        <EuiEmptyPrompt
          iconType={'cross'}
          title={<h2>Unable to view workflow details</h2>}
          titleSize="s"
          body={
            <>
              <EuiText>
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
