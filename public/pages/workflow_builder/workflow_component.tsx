/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSpacer,
  EuiCard,
} from '@elastic/eui';
import { IComponent } from '../../component_types';
import { InputFieldList, NewOrExistingTabs } from './components';

interface WorkflowComponentProps {
  component: IComponent;
}

/**
 * TODO: This will be the ReactFlow node in the drag-and-drop workspace. It will take in a component
 * from the global workflow state and render it appropriately (inputs / params / outputs / etc.)
 * Similar to Flowise's CanvasNode - see
 * https://github.com/FlowiseAI/Flowise/blob/main/packages/ui/src/views/canvas/CanvasNode.js
 */
export function WorkflowComponent(props: WorkflowComponentProps) {
  const { component } = props;

  const [selectedTabId, setSelectedTabId] = useState<string>('existing');

  const isCreatingNew = component.allowsCreation && selectedTabId === 'new';
  const fieldsToDisplay = isCreatingNew
    ? component.createFields
    : component.fields;

  return (
    <EuiCard title={component.label} style={{ maxWidth: '40vh' }}>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          {component.allowsCreation ? (
            <NewOrExistingTabs
              setSelectedTabId={setSelectedTabId}
              selectedTabId={selectedTabId}
            />
          ) : undefined}
        </EuiFlexItem>
        <InputFieldList inputFields={fieldsToDisplay} />
        {/**
         * Hardcoding the interfaced inputs/outputs for readability
         * TODO: remove when moving this into the context of a ReactFlow node with Handles.
         */}
        <EuiFlexItem>
          <>
            <EuiText>
              <b>Inputs:</b>
            </EuiText>
            {component.inputs?.map((input, idx) => {
              return <EuiText key={idx}>{input.label}</EuiText>;
            })}
            <EuiSpacer size="s" />
            <EuiText>
              <b>Outputs:</b>
            </EuiText>
            {component.outputs?.map((output, idx) => {
              return <EuiText key={idx}>{output.label}</EuiText>;
            })}
          </>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiCard>
  );
}
