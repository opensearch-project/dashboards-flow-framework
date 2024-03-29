/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiText,
  EuiTitle,
  EuiButtonIcon,
} from '@elastic/eui';
import { setDirty } from '../../../../store';
import { IComponentData } from '../../../../component_types';
import { InputHandle } from './input_handle';
import { OutputHandle } from './output_handle';
import { Edge, useReactFlow } from 'reactflow';
import { useDispatch } from 'react-redux';

// styling
import '../../workspace/reactflow-styles.scss';

interface WorkspaceComponentProps {
  data: IComponentData;
}

/**
 * The React component in the drag-and-drop workspace. It will take in the component data passed
 * to it from the workspace and render it appropriately (inputs / params / outputs / etc.).
 * As users interact with it (input data, add connections), the stored IComponent data will update.
 */
export function WorkspaceComponent(props: WorkspaceComponentProps) {
  const dispatch = useDispatch();
  const component = props.data;
  const reactFlowInstance = useReactFlow();

  const deleteNode = (nodeId: string) => {
    reactFlowInstance.setNodes(
      reactFlowInstance.getNodes().filter((node: Node) => node.id !== nodeId)
    );
    // Also delete any dangling edges attached to the component
    reactFlowInstance.setEdges(
      reactFlowInstance
        .getEdges()
        .filter(
          (edge: Edge) => edge.source !== nodeId && edge.target !== nodeId
        )
    );
    dispatch(setDirty());
  };

  return (
    <EuiCard
      className="react-flow__node"
      textAlign="left"
      title={
        <EuiFlexGroup direction="row" justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h3>{component.label}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            {
              // TODO: re-enable deletion
            }
            {/* <EuiButtonIcon
              iconType="trash"
              onClick={() => {
                deleteNode(component.id);
              }}
              aria-label="Delete"
            /> */}
          </EuiFlexItem>
        </EuiFlexGroup>
      }
    >
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiText size="s" color="subdued">
            {component.description}
          </EuiText>
        </EuiFlexItem>
        {component.inputs?.map((input, index) => {
          return (
            <EuiFlexItem key={index}>
              <InputHandle input={input} data={component} />
            </EuiFlexItem>
          );
        })}
        {component.outputs?.map((output, index) => {
          return (
            <EuiFlexItem key={index}>
              <OutputHandle output={output} data={component} />
            </EuiFlexItem>
          );
        })}
      </EuiFlexGroup>
    </EuiCard>
  );
}
