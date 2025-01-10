/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiText,
  EuiSpacer,
  EuiIcon,
  IconType,
} from '@elastic/eui';
import {
  IComponentData,
  IComponentInput,
  IComponentOutput,
} from '../../../../../common';
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
  // we don't render any component body if no metadata, such as no description, or no defined inputs/outputs.
  const hasDescription =
    component.description !== undefined && !isEmpty(component.description);
  const hasIcon =
    component.iconType !== undefined && !isEmpty(component.iconType);
  const hasMetadata =
    hasDescription ||
    hasLabels(component.inputs) ||
    hasLabels(component.outputs);

  return (
    <EuiCard
      className="react-flow__node"
      textAlign="left"
      title={
        <EuiFlexGroup direction="row" justifyContent="flexStart" gutterSize="s">
          {hasIcon && (
            <EuiFlexItem grow={false} style={{ marginTop: '8px' }}>
              <EuiIcon type={component.iconType as IconType} size="m" />
            </EuiFlexItem>
          )}
          <EuiFlexItem grow={false}>
            <EuiText size="s">
              <h4>{component.label}</h4>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}></EuiFlexItem>
        </EuiFlexGroup>
      }
    >
      <EuiFlexGroup
        direction="column"
        gutterSize="s"
        style={hasMetadata ? {} : { marginBottom: '-18px' }}
      >
        {hasDescription && (
          <EuiFlexItem>
            <EuiText size="s" color="subdued">
              {component.description}
            </EuiText>
            <EuiSpacer size="s" />
          </EuiFlexItem>
        )}
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

// small utility fn to check if inputs or outputs have labels. Component is dynamically
// rendered based on these being populated or not.
function hasLabels(
  inputsOrOutputs: (IComponentInput | IComponentOutput)[] | undefined
): boolean {
  return !isEmpty(
    inputsOrOutputs
      ?.map((inputOrOutput) => inputOrOutput.label)
      .filter((label) => !isEmpty(label))
  );
}
