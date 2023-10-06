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
  EuiEmptyPrompt,
  EuiText,
} from '@elastic/eui';
import { ReactFlowComponent } from '../../../../common';
import { rfContext } from '../../../store';
import { InputFieldList } from '../workspace_component/input_field_list';

// styling
import './workspace-styles.scss';

interface ComponentDetailsProps {
  onToggleChange: () => void;
  isOpen: boolean;
}

export function ComponentDetails(props: ComponentDetailsProps) {
  // TODO: use this instance to update the internal node state. ex: update field data in the selected node based
  // on user input
  const { reactFlowInstance } = useContext(rfContext);

  const [selectedComponent, setSelectedComponent] = useState<
    ReactFlowComponent
  >();

  /**
   * Hook provided by reactflow to listen on when nodes are selected / de-selected.
   * - populate panel content appropriately
   * - open the panel if a node is selected and the panel is closed
   */
  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      if (nodes && nodes.length > 0) {
        setSelectedComponent(nodes[0]);
        if (!props.isOpen) {
          props.onToggleChange();
        }
      } else {
        setSelectedComponent(undefined);
      }
    },
  });

  return (
    <EuiFlexGroup
      direction="column"
      gutterSize="none"
      className="workspace-panel"
    >
      <EuiFlexItem className="resizable-panel-border">
        <EuiPanel paddingSize="m">
          {selectedComponent ? (
            <>
              <EuiTitle size="m">
                <h2>{selectedComponent?.data.label || ''}</h2>
              </EuiTitle>
              <EuiSpacer size="s" />
              <InputFieldList
                inputFields={selectedComponent?.data.fields || []}
              />
            </>
          ) : (
            <EuiEmptyPrompt
              iconType={'cross'}
              title={<h2>No component selected</h2>}
              titleSize="s"
              body={
                <>
                  <EuiText>
                    Add a component, or select a component to view or edit its
                    configuration.
                  </EuiText>
                </>
              }
            />
          )}
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
