/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Connection, Handle, Position, useReactFlow } from 'reactflow';
import { isEmpty } from 'lodash';
import { EuiBadge, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
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
  const hasLabel =
    props.input.label !== undefined && !isEmpty(props.input.label);

  useEffect(() => {
    setPosition(calculateHandlePosition(ref));
  }, [ref]);

  return (
    <div ref={ref}>
      <>
        {hasLabel && (
          <EuiFlexGroup direction="row" justifyContent="flexStart">
            <EuiFlexItem grow={false}>
              <EuiBadge color="hollow">{props.input.label}</EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        <Handle
          type="target"
          id={props.input.id}
          position={Position.Left}
          isValidConnection={(connection: Connection) =>
            // @ts-ignore
            isValidConnection(connection, reactFlowInstance)
          }
          style={
            hasLabel
              ? {
                  top: position,
                }
              : {}
          }
        />
      </>
    </div>
  );
}
