/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from 'reactflow';
import { rfContext } from '../../../store';

// styling
import './deletable-edge-styles.scss';

type DeletableEdgeProps = EdgeProps;

/**
 * A custom deletable edge. Renders a delete button in the center of the edge once connected.
 * Using bezier path by default. For all edge types,
 * see https://reactflow.dev/docs/examples/edges/edge-types/
 */
export function DeletableEdge(props: DeletableEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  const { deleteEdge } = useContext(rfContext);

  const onEdgeClick = (event: any, edgeId: string) => {
    event.stopPropagation();
    deleteEdge(edgeId);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={props.markerEnd} />
      <EdgeLabelRenderer>
        {/** Using in-line styling since scss can't support dynamic values*/}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            className="delete-edge-button"
            onClick={(event) => onEdgeClick(event, props.id)}
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
