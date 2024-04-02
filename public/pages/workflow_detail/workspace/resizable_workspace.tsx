/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useReactFlow } from 'reactflow';
import { Form, Formik } from 'formik';
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
import {
  Workflow,
  WorkspaceFormValues,
  WorkspaceSchema,
  ReactFlowComponent,
  WorkspaceSchemaObj,
  componentDataToFormik,
  getComponentSchema,
  toWorkspaceFlow,
  validateWorkspaceFlow,
  WorkspaceFlowState,
  toTemplateFlows,
  DEFAULT_NEW_WORKFLOW_NAME,
  DEFAULT_NEW_WORKFLOW_DESCRIPTION,
  USE_CASE,
} from '../../../../common';
import {
  AppState,
  createWorkflow,
  removeDirty,
  setDirty,
} from '../../../store';
import { Workspace } from './workspace';
import { ComponentDetails } from '../component_details';
import { processNodes } from '../utils';

// styling
import './workspace-styles.scss';

interface ResizableWorkspaceProps {
  isNewWorkflow: boolean;
  workflow?: Workflow;
}

const COMPONENT_DETAILS_PANEL_ID = 'component_details_panel_id';

/**
 * The overall workspace component that maintains state related to the 2 resizable
 * panels - the ReactFlow workspace panel and the selected component details panel.
 */
export function ResizableWorkspace(props: ResizableWorkspaceProps) {
  const dispatch = useDispatch();

  // Overall workspace state
  const isDirty = useSelector((state: AppState) => state.workspace.isDirty);
  const [isFirstSave, setIsFirstSave] = useState<boolean>(props.isNewWorkflow);
  const isSaveable = isFirstSave ? true : isDirty;

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

  /**
   * Custom listener on when nodes are selected / de-selected. Passed to
   * downstream ReactFlow components you can listen using
   * the out-of-the-box useOnSelectionChange hook.
   * - populate panel content appropriately
   * - open the panel if a node is selected and the panel is closed
   * - it is assumed that only one node can be selected at once
   */
  // TODO: make more typesafe
  function onSelectionChange({ nodes, edges }) {
    if (nodes && nodes.length > 0) {
      setSelectedComponent(nodes[0]);
      if (!isDetailsPanelOpen) {
        onToggleChange();
      }
    } else {
      setSelectedComponent(undefined);
    }
  }

  // Hook to update some default values for the workflow, if applicable. Flow state
  // may not exist if it is a backend-only-created workflow, or a new, unsaved workflow.
  // Metadata fields (name/description/use_case/etc.) may not exist if the user
  // cold reloads the page on a new, unsaved workflow.
  useEffect(() => {
    let workflowCopy = { ...props.workflow } as Workflow;
    if (!workflowCopy.uiMetadata || !workflowCopy.uiMetadata.workspaceFlow) {
      workflowCopy.uiMetadata = {
        ...(workflowCopy.uiMetadata || {}),
        workspaceFlow: toWorkspaceFlow(workflowCopy.workflows),
      };
      console.debug(
        `There is no saved UI flow for workflow: ${workflowCopy.name}. Generating a default one.`
      );
    }

    // TODO: tune some of the defaults, like use_case and version as these will change
    workflowCopy = {
      ...workflowCopy,
      name: workflowCopy.name || DEFAULT_NEW_WORKFLOW_NAME,
      description: workflowCopy.description || DEFAULT_NEW_WORKFLOW_DESCRIPTION,
      use_case: workflowCopy.use_case || USE_CASE.PROVISION,
      version: workflowCopy.version || {
        template: '1.0.0',
        compatibility: ['2.12.0', '3.0.0'],
      },
    };

    setWorkflow(workflowCopy);
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
    if (workflow?.uiMetadata?.workspaceFlow) {
      const initFormValues = {} as WorkspaceFormValues;
      const initSchemaObj = {} as WorkspaceSchemaObj;
      workflow.uiMetadata.workspaceFlow.nodes.forEach((node) => {
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
          <EuiPageHeader
            style={{ marginBottom: '8px' }}
            rightSideItems={[
              // TODO: add launch logic
              <EuiButton fill={false} onClick={() => {}}>
                Launch
              </EuiButton>,
              <EuiButton
                fill={false}
                disabled={!isSaveable}
                // TODO: if props.isNewWorkflow is true, clear the workflow cache if saving is successful.
                onClick={() => {
                  dispatch(removeDirty());
                  if (isFirstSave) {
                    setIsFirstSave(false);
                  }
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
                      let curFlowState = reactFlowInstance.toObject() as WorkspaceFlowState;
                      curFlowState = {
                        ...curFlowState,
                        nodes: processNodes(curFlowState.nodes),
                      };
                      if (validateWorkspaceFlow(curFlowState)) {
                        setFlowValidOnSubmit(true);
                        const updatedWorkflow = {
                          ...workflow,
                          uiMetadata: {
                            ...workflow?.uiMetadata,
                            workspaceFlow: curFlowState,
                          },
                          workflows: toTemplateFlows(
                            curFlowState,
                            formikProps.values
                          ),
                        } as Workflow;
                        if (updatedWorkflow.id) {
                          // TODO: add update workflow API
                        } else {
                          console.log('creating workflow: ', workflow);
                          dispatch(createWorkflow(updatedWorkflow));
                        }
                      } else {
                        setFlowValidOnSubmit(false);
                      }
                    }
                  });
                }}
              >
                Save
              </EuiButton>,
            ]}
            bottomBorder={false}
          />
          <EuiResizableContainer
            direction="horizontal"
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
                          onNodesChange={onNodesChange}
                          onSelectionChange={onSelectionChange}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiResizablePanel>
                  <EuiResizableButton />
                  <EuiResizablePanel
                    className="workspace-panel"
                    style={{ marginRight: '-16px' }}
                    id={COMPONENT_DETAILS_PANEL_ID}
                    mode="collapsible"
                    initialSize={25}
                    minSize="10%"
                    paddingSize="s"
                    onToggleCollapsedInternal={() => onToggleChange()}
                  >
                    <ComponentDetails
                      selectedComponent={selectedComponent}
                      onFormChange={onFormChange}
                    />
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
