/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexItem, EuiPanel, EuiText } from '@elastic/eui';
import { TextEmbeddingTransformer, BaseComponent } from '../../../../../common';

interface DraggableComponentItemProps {
  label: string;
}

/**
 * A draggable component used in the component library
 */
export function DraggableComponentItem(props: DraggableComponentItemProps) {
  const onDragStart = (event: any, component: BaseComponent) => {
    const serializedComponent = JSON.stringify(component.toObj());
    event.dataTransfer.setData('application/reactflow', serializedComponent);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <EuiFlexItem>
      <div
        onDragStart={(event) =>
          onDragStart(event, new TextEmbeddingTransformer())
        }
        draggable
      >
        <EuiPanel>
          <EuiText>{props.label}</EuiText>
        </EuiPanel>
      </div>
    </EuiFlexItem>
  );
}
