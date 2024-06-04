/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Form, Formik, FormikProps } from 'formik';
import * as yup from 'yup';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiResizableContainer,
} from '@elastic/eui';
import { getCore } from '../../services';

import {
  Workflow,
  WorkflowFormValues,
  WorkflowSchema,
  WorkflowConfig,
} from '../../../common';
import {
  APP_PATH,
  uiConfigToFormik,
  uiConfigToSchema,
  formikToUiConfig,
  reduceToTemplate,
} from '../../utils';
import {
  AppState,
  createWorkflow,
  setDirty,
  updateWorkflow,
  useAppDispatch,
} from '../../store';
import { WorkflowInputs } from './workflow_inputs';
import { configToTemplateFlows } from './utils';
import { Workspace } from './workspace';

// styling
import './workspace/workspace-styles.scss';
import '../../global-styles.scss';
import { Tools } from './tools';

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
  const dispatch = useAppDispatch();
  const history = useHistory();

  // Overall workspace state
  const { isDirty } = useSelector((state: AppState) => state.workspace);
  const { loading } = useSelector((state: AppState) => state.workflows);

  // Workflow state
  const [workflow, setWorkflow] = useState<Workflow | undefined>(
    props.workflow
  );

  // Formik form state
  const [formValues, setFormValues] = useState<WorkflowFormValues>({});
  const [formSchema, setFormSchema] = useState<WorkflowSchema>(yup.object({}));

  // Validation states
  const [formValidOnSubmit, setFormValidOnSubmit] = useState<boolean>(true);

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

  // Tools side panel state
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState<boolean>(true);
  const collapseFnVertical = useRef(
    (id: string, options: { direction: 'top' | 'bottom' }) => {}
  );
  const onToggleToolsChange = () => {
    collapseFnVertical.current(TOOLS_PANEL_ID, { direction: 'bottom' });
    setIsToolsPanelOpen(!isToolsPanelOpen);
  };

  // Hook to update some default values for the workflow, if applicable.
  // We need to handle different scenarios:
  // 1. Rendering backend-only-created workflow / an existing workflow with no ui_metadata.
  //    In this case, we revert to the home page with a warn toast that we don't support it, for now.
  // 2. Rendering a created workflow with ui_metadata.
  //    In these cases, just render what is persisted, no action needed.
  useEffect(() => {
    const missingUiFlow =
      props.workflow && !props.workflow?.ui_metadata?.config;
    if (missingUiFlow) {
      history.replace(APP_PATH.WORKFLOWS);
      getCore().notifications.toasts.addWarning(
        `There is no ui_metadata for workflow: ${props.workflow?.name}`
      );
    } else {
      setWorkflow(props.workflow);
    }
  }, [props.workflow]);

  // Initialize the form state to an existing workflow, if applicable.
  useEffect(() => {
    if (workflow?.ui_metadata?.config) {
      const initFormValues = uiConfigToFormik(workflow.ui_metadata.config);
      const initFormSchema = uiConfigToSchema(workflow.ui_metadata.config);
      setFormValues(initFormValues);
      setFormSchema(initFormSchema);
    }
  }, [workflow]);

  /**
   * Function to pass down to the Formik <Form> components as a listener to propagate
   * form changes to this parent component to re-enable save button, etc.
   */
  function onFormChange() {
    if (!isDirty) {
      dispatch(setDirty());
    }
  }

  // Utility validation fn used before executing any API calls (save, provision)
  function validateAndSubmit(
    formikProps: FormikProps<WorkflowFormValues>
  ): void {
    // Submit the form to bubble up any errors.
    // Ideally we handle Promise accept/rejects with submitForm(), but there is
    // open issues for that - see https://github.com/jaredpalmer/formik/issues/2057
    // The workaround is to additionally execute validateForm() which will return any errors found.
    formikProps.submitForm();
    formikProps.validateForm().then((validationResults: {}) => {
      if (Object.keys(validationResults).length > 0) {
        setFormValidOnSubmit(false);
      } else {
        setFormValidOnSubmit(true);
        const updatedConfig = formikToUiConfig(
          formikProps.values,
          workflow?.ui_metadata?.config as WorkflowConfig
        );
        const updatedWorkflow = {
          ...workflow,
          ui_metadata: {
            ...workflow?.ui_metadata,
            config: updatedConfig,
          },
          workflows: configToTemplateFlows(updatedConfig),
        } as Workflow;
        if (updatedWorkflow.id) {
          dispatch(
            updateWorkflow({
              workflowId: updatedWorkflow.id,
              workflowTemplate: reduceToTemplate(updatedWorkflow),
            })
          )
            .unwrap()
            .then((result) => {})
            .catch((error: any) => {});
        } else {
          dispatch(createWorkflow(updatedWorkflow))
            .unwrap()
            .then((result) => {
              const { workflow } = result;
              history.replace(`${APP_PATH.WORKFLOWS}/${workflow.id}`);
              history.go(0);
            })
            .catch((error: any) => {});
        }
      }
    });
  }

  return (
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
                      formikProps={formikProps}
                      onFormChange={onFormChange}
                      validateAndSubmit={validateAndSubmit}
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
                                    id="ingest"
                                    workflow={workflow}
                                    readonly={false}
                                  />
                                </EuiFlexItem>
                              </EuiFlexGroup>
                            </EuiResizablePanel>
                            <EuiResizableButton />
                            <EuiResizablePanel
                              id={TOOLS_PANEL_ID}
                              mode="collapsible"
                              initialSize={50}
                              minSize="25%"
                              paddingSize="s"
                              onToggleCollapsedInternal={() =>
                                onToggleToolsChange()
                              }
                              style={{ marginBottom: '-24px' }}
                            >
                              <EuiFlexGroup
                                direction="column"
                                gutterSize="s"
                                style={{
                                  height: '100%',
                                }}
                              >
                                <EuiFlexItem>
                                  <EuiPanel paddingSize="m">
                                    <Tools workflow={workflow} />
                                  </EuiPanel>
                                </EuiFlexItem>
                              </EuiFlexGroup>
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
  );
}
