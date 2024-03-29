/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import { DraggableComponentItem } from './draggable_component';

interface ComponentLibraryProps {
  onClose: () => void;
}

/**
 * The overall workspace component that maintains state related to the 2 resizable
 * panels - the ReactFlow workspace panel and the selected component details panel.
 */
export function ComponentLibrary(props: ComponentLibraryProps) {
  return (
    <EuiPanel style={{ maxWidth: '40vh' }}>
      <EuiFlexGroup direction="column">
        <EuiFlexGroup direction="row" style={{ marginLeft: '0px' }}>
          <EuiFlexItem>
            <EuiText size="m">Component Library</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="cross"
              onClick={() => props.onClose()}
              style={{
                marginLeft: 'auto',
                marginRight: '0px',
              }}
              aria-label="Close"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexItem>
          <EuiFlexGroup direction="column" gutterSize="s">
            <DraggableComponentItem label="Text Embedding Transformer" />
            <DraggableComponentItem label="K-NN Indexer" />
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
