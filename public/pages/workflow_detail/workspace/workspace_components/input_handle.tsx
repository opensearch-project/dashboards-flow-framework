/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Connection, Handle, Position, useReactFlow } from 'reactflow';
import { EuiText } from '@elastic/eui';
import { IComponent, IComponentInput } from '../../../../../common';
import { calculateHandlePosition, isValidConnection } from './utils';

interface InputHandleProps {
  data: IComponent;
  input: IComponentInput;
}

export function InputHandle(props: InputHandleProps) {
  const ref = useRef(null);
  const reactFlowInstance = useReactFlow();
  const [position, setPosition] = useState<number>(0);

  useEffect(() => {
    setPosition(calculateHandlePosition(ref));
  }, [ref]);

  return (
    <div ref={ref}>
      <>
        <EuiText textAlign="left">{props.input.label}</EuiText>
        <Handle
          type="target"
          id={props.input.id}
          position={Position.Left}
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
