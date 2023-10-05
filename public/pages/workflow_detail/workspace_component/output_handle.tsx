/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useContext } from 'react';
import { Connection, Handle, Position } from 'reactflow';
import { EuiText } from '@elastic/eui';
import { IComponent, IComponentOutput } from '../../../component_types';
import { calculateHandlePosition, isValidConnection } from './utils';
import { rfContext } from '../../../store';

interface OutputHandleProps {
  data: IComponent;
  output: IComponentOutput;
}

export function OutputHandle(props: OutputHandleProps) {
  const ref = useRef(null);
  const { reactFlowInstance } = useContext(rfContext);
  const [position, setPosition] = useState<number>(0);
  const outputClasses = props.output.baseClasses.join('|');

  useEffect(() => {
    setPosition(calculateHandlePosition(ref));
  }, [ref]);

  return (
    <div ref={ref}>
      <>
        <EuiText textAlign="right">{props.output.label}</EuiText>
        <Handle
          type="source"
          id={outputClasses}
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
