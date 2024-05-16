/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Connection, Handle, Position, useReactFlow } from 'reactflow';
import { EuiText } from '@elastic/eui';
import { IComponent, IComponentOutput } from '../../../../../common';
import { calculateHandlePosition, isValidConnection } from './utils';

interface OutputHandleProps {
  data: IComponent;
  output: IComponentOutput;
}

export function OutputHandle(props: OutputHandleProps) {
  const ref = useRef(null);
  const reactFlowInstance = useReactFlow();
  const [position, setPosition] = useState<number>(0);

  useEffect(() => {
    setPosition(calculateHandlePosition(ref));
  }, [ref]);

  return (
    <div ref={ref}>
      <>
        <EuiText textAlign="right">{props.output.label}</EuiText>
        <Handle
          type="source"
          id={props.output.id}
          position={Position.Right}
          isValidConnection={(connection: Connection) =>
            // @ts-ignore
            isValidConnection(connection, reactFlowInstance)
          }
          style={{
            top: position,
          }}
        />
      </>
    </div>
  );
}
