/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiCard } from '@elastic/eui';
import { IComponent } from '../../../component_types';
import { InputFieldList } from './input_field_list';
import { NewOrExistingTabs } from './new_or_existing_tabs';
import { InputHandle } from './input_handle';
import { OutputHandle } from './output_handle';

interface WorkspaceComponentProps {
  data: IComponent;
}

/**
 * The React component in the drag-and-drop workspace. It will take in the component data passed
 * to it from the workspace and render it appropriately (inputs / params / outputs / etc.).
 * As users interact with it (input data, add connections), the stored IComponent data will update.
 */
export function WorkspaceComponent(props: WorkspaceComponentProps) {
  const component = props.data;

  const [selectedTabId, setSelectedTabId] = useState<string>('existing');

  const isCreatingNew = component.allowsCreation && selectedTabId === 'new';
  const fieldsToDisplay = isCreatingNew
    ? component.createFields
    : component.fields;

  return (
    <EuiCard title={component.label}>
      <EuiFlexGroup direction="column">
        {/* <EuiFlexItem>
          {component.allowsCreation ? (
            <NewOrExistingTabs
              setSelectedTabId={setSelectedTabId}
              selectedTabId={selectedTabId}
            />
          ) : undefined}
        </EuiFlexItem> */}
        {component.inputs?.map((input, index) => {
          return (
            <EuiFlexItem key={index}>
              <InputHandle input={input} data={component} />
            </EuiFlexItem>
          );
        })}
        <InputFieldList inputFields={fieldsToDisplay} />
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
