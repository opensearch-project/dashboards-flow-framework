/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiText,
  EuiTitle,
  EuiButtonIcon,
} from '@elastic/eui';
import { rfContext } from '../../../store';
import { IComponentData } from '../../../component_types';
import { InputHandle } from './input_handle';
import { OutputHandle } from './output_handle';

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
  const { deleteNode } = useContext(rfContext);

  return (
    <EuiCard
      textAlign="left"
      title={
        <EuiFlexGroup direction="row" justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h3>{component.label}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="trash"
              onClick={() => {
                deleteNode(component.id);
              }}
              aria-label="Delete"
            />
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
