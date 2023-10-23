/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useContext } from 'react';
import { useOnSelectionChange } from 'reactflow';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { cloneDeep } from 'lodash';
import { EuiButton, EuiResizableContainer } from '@elastic/eui';
import {
  Workflow,
  WorkspaceFormValues,
  WorkspaceSchema,
  ReactFlowComponent,
  WorkspaceSchemaObj,
  componentDataToFormik,
  getComponentSchema,
} from '../../../../common';
import { rfContext } from '../../../store';
import { Workspace } from './workspace';
import { ComponentDetails } from '../component_details';

interface ResizableWorkspaceProps {
  workflow?: Workflow;
}

const COMPONENT_DETAILS_PANEL_ID = 'component_details_panel_id';

/**
 * The overall workspace component that maintains state related to the 2 resizable
 * panels - the ReactFlow workspace panel and the selected component details panel.
 */
export function ResizableWorkspace(props: ResizableWorkspaceProps) {
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
  const { reactFlowInstance } = useContext(rfContext);
  const [selectedComponent, setSelectedComponent] = useState<
    ReactFlowComponent
  >();

  /**
   * Hook provided by reactflow to listen on when nodes are selected / de-selected.
   * - populate panel content appropriately
   * - open the panel if a node is selected and the panel is closed
   * - it is assumed that only one node can be selected at once
   */
  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      if (nodes && nodes.length > 0) {
        setSelectedComponent(nodes[0]);
        if (!isDetailsPanelOpen) {
          onToggleChange();
        }
      } else {
        setSelectedComponent(undefined);
      }
    },
  });

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

  // Formik form state
  const [formValues, setFormValues] = useState<WorkspaceFormValues>({});
  const [formSchema, setFormSchema] = useState<WorkspaceSchema>(yup.object({}));

  // Initialize the form state to an existing workflow, if applicable.
  useEffect(() => {
    if (props.workflow?.workspaceFlowState) {
      const initFormValues = {} as WorkspaceFormValues;
      const initSchemaObj = {} as WorkspaceSchemaObj;
      props.workflow.workspaceFlowState.nodes.forEach((node) => {
        initFormValues[node.id] = componentDataToFormik(node.data);
        initSchemaObj[node.id] = getComponentSchema(node.data);
      });
      const initFormSchema = yup.object(initSchemaObj) as WorkspaceSchema;
      setFormValues(initFormValues);
      setFormSchema(initFormSchema);
    }
  }, [props.workflow]);

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
            style={{ marginLeft: '-8px', marginTop: '-8px' }}
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
                    initialSize={75}
                    minSize="50%"
                    paddingSize="s"
                  >
                    <Workspace
                      workflow={props.workflow}
                      onNodesChange={onNodesChange}
                    />
                  </EuiResizablePanel>
                  <EuiResizableButton />
                  <EuiResizablePanel
                    id={COMPONENT_DETAILS_PANEL_ID}
                    mode="collapsible"
                    initialSize={25}
                    minSize="10%"
                    paddingSize="s"
                    onToggleCollapsedInternal={() => onToggleChange()}
                  >
                    <ComponentDetails selectedComponent={selectedComponent} />
                  </EuiResizablePanel>
                </>
              );
            }}
          </EuiResizableContainer>
          <EuiButton onClick={() => formikProps.handleSubmit()}>
            Submit
          </EuiButton>
        </Form>
      )}
    </Formik>
  );
}
