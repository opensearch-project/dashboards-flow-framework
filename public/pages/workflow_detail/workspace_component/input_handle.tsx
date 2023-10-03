/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useContext } from 'react';
import { Connection, Handle, Position } from 'reactflow';
import { EuiText } from '@elastic/eui';
import { IComponent, IComponentInput } from '../../../component_types';
import { calculateHandlePosition, isValidConnection } from './utils';
import { rfContext } from '../../../store';

interface InputHandleProps {
  data: IComponent;
  input: IComponentInput;
}

export function InputHandle(props: InputHandleProps) {
  const ref = useRef(null);
  const { reactFlowInstance } = useContext(rfContext);
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
          id={props.input.baseClass}
          position={Position.Left}
          isValidConnection={(connection: Connection) =>
            // @ts-ignore
            isValidConnection(connection, reactFlowInstance)
          }
          style={{
            height: 10,
            width: 10,
            backgroundColor: 'black',
            top: position,
          }}
        />
      </>
    </div>
  );
}
