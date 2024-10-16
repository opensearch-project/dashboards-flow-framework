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
  EuiSpacer,
} from '@elastic/eui';
import { IComponentData } from '../../../../../common';
import { InputHandle } from './input_handle';
import { OutputHandle } from './output_handle';

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
  const component = props.data;

  return (
    <EuiCard
      className="react-flow__node"
      textAlign="left"
      title={
        <EuiFlexGroup direction="row" justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiText size="s">
              <h3>{component.label}</h3>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}></EuiFlexItem>
        </EuiFlexGroup>
      }
    >
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem>
          <EuiText size="s" color="subdued">
            {component.description}
          </EuiText>
          <EuiSpacer size="s" />
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
