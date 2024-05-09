/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useReactFlow } from 'reactflow';
import { Form, Formik, FormikProps } from 'formik';
import * as yup from 'yup';
import { cloneDeep } from 'lodash';
import {
  EuiButton,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageHeader,
  EuiResizableContainer,
} from '@elastic/eui';
import { getCore } from '../../services';

import {
  Workflow,
  WorkspaceFormValues,
  WorkspaceSchema,
  ReactFlowComponent,
  WorkspaceSchemaObj,
  WorkspaceFlowState,
  WORKFLOW_STATE,
  ReactFlowEdge,
} from '../../../common';
import {
  componentDataToFormik,
  getComponentSchema,
  processNodes,
  reduceToTemplate,
  APP_PATH,
} from '../../utils';
import { validateWorkspaceFlow, toTemplateFlows } from './utils';
import {
  AppState,
  createWorkflow,
  deprovisionWorkflow,
  getWorkflowState,
  provisionWorkflow,
  removeDirty,
  setDirty,
  updateWorkflow,
  useAppDispatch,
} from '../../store';
import { Workspace } from './workspace/workspace';
import { ComponentDetails } from './component_details';

// styling
import './workspace/workspace-styles.scss';
import '../../global-styles.scss';
import { WorkflowInputs } from './workflow_inputs';

interface ResizableWorkspaceProps {
  isNewWorkflow: boolean;
  workflow?: Workflow;
}

const WORKFLOW_INPUTS_PANEL_ID = 'workflow_inputs_panel_id';

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
  const [isFirstSave, setIsFirstSave] = useState<boolean>(props.isNewWorkflow);

  // Workflow state
  const [workflow, setWorkflow] = useState<Workflow | undefined>(
    props.workflow
  );

  // Formik form state
  const [formValues, setFormValues] = useState<WorkspaceFormValues>({});
  const [formSchema, setFormSchema] = useState<WorkspaceSchema>(yup.object({}));

  // Validation states. Maintain separate state for form vs. overall flow so
  // we can have fine-grained errors and action items for users
  const [formValidOnSubmit, setFormValidOnSubmit] = useState<boolean>(true);
  const [flowValidOnSubmit, setFlowValidOnSubmit] = useState<boolean>(true);

  // Component details side panel state
  const [isDetailsPanelOpen, setisDetailsPanelOpen] = useState<boolean>(true);
  const collapseFn = useRef(
    (id: string, options: { direction: 'left' | 'right' }) => {}
  );
  const onToggleChange = () => {
    collapseFn.current(COMPONENT_DETAILS_PANEL_ID, { direction: 'left' });
    setisDetailsPanelOpen(!isDetailsPanelOpen);
  };

  // Selected component state
  const reactFlowInstance = useReactFlow();
  const [selectedComponent, setSelectedComponent] = useState<
    ReactFlowComponent
  >();

  // Save/provision/deprovision button state
  const isSaveable =
    props.workflow !== undefined && (isFirstSave ? true : isDirty);
  const isProvisionable =
    props.workflow !== undefined &&
    !isDirty &&
    !props.isNewWorkflow &&
    formValidOnSubmit &&
    flowValidOnSubmit &&
    props.workflow?.state === WORKFLOW_STATE.NOT_STARTED;
  const isDeprovisionable =
    props.workflow !== undefined &&
    !props.isNewWorkflow &&
    props.workflow?.state !== WORKFLOW_STATE.NOT_STARTED;
  // TODO: maybe remove this field. It depends on final UX if we want the
  // workspace to be readonly once provisioned or not.
  const readonly = props.workflow === undefined || isDeprovisionable;

  // Loading state
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [isDeprovisioning, setIsDeprovisioning] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const isCreating = isSaving && props.isNewWorkflow;
  const isLoadingGlobal =
    loading || isProvisioning || isDeprovisioning || isSaving || isCreating;

  /**
   * Custom listener on when nodes are selected / de-selected. Passed to
   * downstream ReactFlow components you can listen using
   * the out-of-the-box useOnSelectionChange hook.
   * - populate panel content appropriately
   * - open the panel if a node is selected and the panel is closed
   * - it is assumed that only one node can be selected at once
   */
  function onSelectionChange({
    nodes,
    edges,
  }: {
    nodes: ReactFlowComponent[];
    edges: ReactFlowEdge[];
  }) {
    if (nodes && nodes.length > 0) {
      setSelectedComponent(nodes[0]);
      if (!isDetailsPanelOpen) {
        onToggleChange();
      }
    } else {
      setSelectedComponent(undefined);
    }
  }

  // Hook to update some default values for the workflow, if applicable.
  // We need to handle different scenarios:
  // 1. Rendering backend-only-created workflow / an already-created workflow with no ui_metadata.
  //    In this case, we revert to the home page with a warn toast that we don't support it, for now.
  //    This is because we initially have guardrails and a static set of readonly nodes/edges that we handle.
  // 2. Rendering empty/null workflow, if refreshing the editor page where there is no cached workflow and
  //    no workflow ID in the URL.
  //    In this case, revert to home page and a warn toast that we don't support it for now.
  //    This is because we initially don't support building / drag-and-drop components.
  // 3. Rendering a cached workflow via navigation from create workflow tab
  // 4. Rendering a created workflow with ui_metadata.
  //    In these cases, just render what is persisted, no action needed.
  useEffect(() => {
    const missingUiFlow =
      props.workflow && !props.workflow?.ui_metadata?.workspace_flow;
    const missingCachedWorkflow = props.isNewWorkflow && !props.workflow;
    if (missingUiFlow || missingCachedWorkflow) {
      history.replace(APP_PATH.WORKFLOWS);
      if (missingCachedWorkflow) {
        getCore().notifications.toasts.addWarning('No workflow found');
      } else {
        getCore().notifications.toasts.addWarning(
          `There is no ui_metadata for workflow: ${props.workflow?.name}`
        );
      }
    } else {
      setWorkflow(props.workflow);
    }
  }, [props.workflow]);

  // Hook to updated the selected ReactFlow component
  useEffect(() => {
    reactFlowInstance?.setNodes((nodes: ReactFlowComponent[]) =>
      nodes.map((node) => {
        node.data = {
          ...node.data,
          selected: node.id === selectedComponent?.id ? true : false,
        };
        return node;
      })
    );
  }, [selectedComponent]);

  // Initialize the form state to an existing workflow, if applicable.
  useEffect(() => {
    if (workflow?.ui_metadata?.workspace_flow) {
      const initFormValues = {} as WorkspaceFormValues;
      const initSchemaObj = {} as WorkspaceSchemaObj;
      workflow.ui_metadata.workspace_flow.nodes.forEach((node) => {
        initFormValues[node.id] = componentDataToFormik(node.data);
        initSchemaObj[node.id] = getComponentSchema(node.data);
      });
      const initFormSchema = yup.object(initSchemaObj) as WorkspaceSchema;
      setFormValues(initFormValues);
      setFormSchema(initFormSchema);
    }
  }, [workflow]);

  // Update the form values and validation schema when a node is added
  // or removed from the workspace.
  // For the schema, we do a deep clone of the underlying object, and later re-create the schema.
  // For the form values, we update directly to prevent the form from being reinitialized.
  function onNodesChange(nodes: ReactFlowComponent[]): void {
    const updatedComponentIds = nodes.map((node) => node.id);
    const existingComponentIds = Object.keys(formValues);
    const updatedSchemaObj = cloneDeep(formSchema.fields) as WorkspaceSchemaObj;

    if (updatedComponentIds.length > existingComponentIds.length) {
      // TODO: implement for when a node is added
    } else if (updatedComponentIds.length < existingComponentIds.length) {
      existingComponentIds.forEach((existingId) => {
        if (!updatedComponentIds.includes(existingId)) {
          // Remove the mapping for the removed component in the form values
          // and schema.
          delete formValues[`${existingId}`];
          delete updatedSchemaObj[`${existingId}`];
        }
      });
    } else {
      // if it is somehow triggered without node changes, be sure
      // to prevent updating the form or schema
      return;
    }

    const updatedSchema = yup.object(updatedSchemaObj) as WorkspaceSchema;
    setFormSchema(updatedSchema);
  }

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
  function validateFormAndFlow(
    formikProps: FormikProps<WorkspaceFormValues>,
    processWorkflowFn: (workflow: Workflow) => void
  ): void {
    // Submit the form to bubble up any errors.
    // Ideally we handle Promise accept/rejects with submitForm(), but there is
    // open issues for that - see https://github.com/jaredpalmer/formik/issues/2057
    // The workaround is to additionally execute validateForm() which will return any errors found.
    formikProps.submitForm();
    formikProps.validateForm().then((validationResults: {}) => {
      if (Object.keys(validationResults).length > 0) {
        setFormValidOnSubmit(false);
        setIsSaving(false);
      } else {
        setFormValidOnSubmit(true);
        let curFlowState = reactFlowInstance.toObject() as WorkspaceFlowState;
        curFlowState = {
          ...curFlowState,
          nodes: processNodes(curFlowState.nodes, formikProps.values),
        };
        if (validateWorkspaceFlow(curFlowState)) {
          setFlowValidOnSubmit(true);
          const updatedWorkflow = {
            ...workflow,
            ui_metadata: {
              ...workflow?.ui_metadata,
              workspace_flow: curFlowState,
            },
            workflows: toTemplateFlows(curFlowState),
          } as Workflow;
          processWorkflowFn(updatedWorkflow);
        } else {
          setFlowValidOnSubmit(false);
          setIsSaving(false);
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
          {!formValidOnSubmit && (
            <EuiCallOut
              title="There are empty or invalid fields"
              color="danger"
              iconType="alert"
              style={{ marginBottom: '16px' }}
            >
              Please address the highlighted fields and try saving again.
            </EuiCallOut>
          )}
          {!flowValidOnSubmit && (
            <EuiCallOut
              title="The configured flow is invalid"
              color="danger"
              iconType="alert"
              style={{ marginBottom: '16px' }}
            >
              Please ensure there are no open connections between the
              components.
            </EuiCallOut>
          )}
          {isDeprovisionable && isDirty && (
            <EuiCallOut
              title="The configured flow has been provisioned"
              color="warning"
              iconType="alert"
              style={{ marginBottom: '16px' }}
            >
              Changes cannot be saved until the workflow has first been
              deprovisioned.
            </EuiCallOut>
          )}
          <EuiPageHeader
            style={{ marginBottom: '8px' }}
            rightSideItems={[
              <EuiButton
                fill={false}
                disabled={!isDeprovisionable || isLoadingGlobal}
                isLoading={isDeprovisioning}
                onClick={() => {
                  if (workflow?.id) {
                    setIsDeprovisioning(true);
                    dispatch(deprovisionWorkflow(workflow.id))
                      .unwrap()
                      .then(async (result) => {
                        await new Promise((f) => setTimeout(f, 3000));
                        dispatch(getWorkflowState(workflow.id as string));
                        setIsDeprovisioning(false);
                      })
                      .catch((error: any) => {
                        setIsDeprovisioning(false);
                      });
                  } else {
                    // This case should not happen
                    console.debug(
                      'Deprovisioning triggered on an invalid workflow. Ignoring.'
                    );
                  }
                }}
              >
                Deprovision
              </EuiButton>,
              <EuiButton
                fill={false}
                disabled={!isProvisionable || isLoadingGlobal}
                isLoading={isProvisioning}
                onClick={() => {
                  if (workflow?.id) {
                    setIsProvisioning(true);
                    dispatch(provisionWorkflow(workflow.id))
                      .unwrap()
                      .then(async (result) => {
                        await new Promise((f) => setTimeout(f, 3000));
                        dispatch(getWorkflowState(workflow.id as string));
                        setIsProvisioning(false);
                      })
                      .catch((error: any) => {
                        setIsProvisioning(false);
                      });
                  } else {
                    // This case should not happen
                    console.debug(
                      'Provisioning triggered on an invalid workflow. Ignoring.'
                    );
                  }
                }}
              >
                Provision
              </EuiButton>,
              <EuiButton
                fill={false}
                disabled={!isSaveable || isLoadingGlobal || isDeprovisionable}
                isLoading={isSaving}
                onClick={() => {
                  setIsSaving(true);
                  dispatch(removeDirty());
                  if (isFirstSave) {
                    setIsFirstSave(false);
                  }
                  validateFormAndFlow(
                    formikProps,
                    // The callback fn to run if everything is valid.
                    (updatedWorkflow) => {
                      if (updatedWorkflow.id) {
                        dispatch(
                          updateWorkflow({
                            workflowId: updatedWorkflow.id,
                            workflowTemplate: reduceToTemplate(updatedWorkflow),
                          })
                        )
                          .unwrap()
                          .then((result) => {
                            setIsSaving(false);
                          })
                          .catch((error: any) => {
                            setIsSaving(false);
                          });
                      } else {
                        dispatch(createWorkflow(updatedWorkflow))
                          .unwrap()
                          .then((result) => {
                            const { workflow } = result;
                            history.replace(
                              `${APP_PATH.WORKFLOWS}/${workflow.id}`
                            );
                            history.go(0);
                          })
                          .catch((error: any) => {
                            setIsSaving(false);
                          });
                      }
                    }
                  );
                }}
              >
                {props.isNewWorkflow || isCreating ? 'Create' : 'Save'}
              </EuiButton>,
            ]}
            bottomBorder={false}
          />
          <EuiResizableContainer
            direction="horizontal"
            className="stretch-absolute"
            style={{
              marginLeft: '-8px',
            }}
          >
            {(EuiResizablePanel, EuiResizableButton, { togglePanel }) => {
              if (togglePanel) {
                collapseFn.current = (panelId: string, { direction }) =>
                  togglePanel(panelId, { direction });
              }

              return (
                <>
                  <EuiResizablePanel
                    id={WORKFLOW_INPUTS_PANEL_ID}
                    mode="collapsible"
                    initialSize={40}
                    minSize="25%"
                    paddingSize="s"
                    onToggleCollapsedInternal={() => onToggleChange()}
                  >
                    <EuiFlexGroup
                      direction="column"
                      gutterSize="s"
                      className="workspace-panel"
                    >
                      <EuiFlexItem>
                        <WorkflowInputs workflow={props.workflow} />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiResizablePanel>
                  <EuiResizableButton />
                  <EuiResizablePanel
                    style={{ marginRight: '-16px' }}
                    mode="main"
                    initialSize={80}
                    minSize="50%"
                    paddingSize="s"
                  >
                    <EuiFlexGroup
                      direction="column"
                      gutterSize="s"
                      className="workspace-panel"
                    >
                      <EuiFlexItem>
                        <Workspace
                          id="ingest"
                          workflow={workflow}
                          readonly={false}
                          onNodesChange={onNodesChange}
                          onSelectionChange={onSelectionChange}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
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
