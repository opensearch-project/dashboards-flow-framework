/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Connection, Handle, Position, useReactFlow } from 'reactflow';
import { isEmpty } from 'lodash';
import { EuiBadge, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
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
  const hasLabel =
    props.output.label !== undefined && !isEmpty(props.output.label);

  useEffect(() => {
    setPosition(calculateHandlePosition(ref));
  }, [ref]);

  return (
    <div ref={ref}>
      <>
        {hasLabel && (
          <EuiFlexGroup direction="row" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiBadge color="hollow">{props.output.label}</EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        <Handle
          type="source"
          id={props.output.id}
          position={Position.Right}
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
