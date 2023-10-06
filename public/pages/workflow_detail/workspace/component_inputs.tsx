/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useContext } from 'react';
import { useOnSelectionChange } from 'reactflow';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiPanel,
  EuiTitle,
} from '@elastic/eui';
import { ReactFlowComponent, ReactFlowEdge } from '../../../../common';
import { rfContext } from '../../../store';
import { InputFieldList } from '../workspace_component/input_field_list';

// styling
import './workspace-styles.scss';

interface ComponentInputsProps {}

export function ComponentInputs(props: ComponentInputsProps) {
  // TODO: use this instance to update the internal node state. ex: update field data in the selected node based
  // on user input
  const { reactFlowInstance } = useContext(rfContext);

  const [selectedComponent, setSelectedComponent] = useState<
    ReactFlowComponent
  >();

  // using custom hook provided by ReactFlow to populate the selected
  // workspace component
  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      if (nodes && nodes.length > 0) {
        setSelectedComponent(nodes[0]);
      } else {
        setSelectedComponent(undefined);
      }
    },
  });

  return (
    <EuiFlexGroup direction="column" gutterSize="m" className="workspace-panel">
      <EuiFlexItem className="resizable-panel-border">
        <EuiPanel paddingSize="s">
          <>
            <EuiTitle size="m">
              <h2>{selectedComponent?.data.label || ''}</h2>
            </EuiTitle>
            <EuiSpacer size="s" />
            <InputFieldList
              inputFields={selectedComponent?.data.fields || []}
            />
          </>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
