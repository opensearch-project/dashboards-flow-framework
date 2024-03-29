/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Handle, Position, NodeResizeControl } from 'reactflow';
import {
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiText,
  EuiTitle,
} from '@elastic/eui';

interface ResizableComponentProps {
  data: { label: string };
}

/**
 * A resizable component ideal for grouping.
 * For more details on resizing, see https://reactflow.dev/examples/nodes/node-resizer
 */
export function ResizableComponent(props: ResizableComponentProps) {
  return (
    <>
      <EuiTitle size="l">
        <h2 style={{ marginLeft: '8px' }}>{props.data.label}</h2>
      </EuiTitle>
      {
        // TODO: re-enable resizing
      }
      {/* <NodeResizeControl
        className="resizable-control"
        minWidth={300}
        minHeight={250}
      >
        <div
          style={{
            zIndex: 2,
          }}
        >
          <ResizeIcon />
        </div>
      </NodeResizeControl> */}
    </>
  );
}

// // The 'expand' icon provided by EUI is oriented in a way that doesn't make sense.
// // Hence, creating our own
// function ResizeIcon() {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       strokeWidth="2"
//       stroke="#ff0071"
//       fill="none"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       style={{ position: 'absolute', right: 5, bottom: 5 }}
//     >
//       <path stroke="none" d="M0 0h24v24H0z" fill="none" />
//       <polyline points="16 20 20 20 20 16" />
//       <line x1="14" y1="14" x2="20" y2="20" />
//       <polyline points="8 4 4 4 4 8" />
//       <line x1="4" y1="4" x2="10" y2="10" />
//     </svg>
//   );
// }
