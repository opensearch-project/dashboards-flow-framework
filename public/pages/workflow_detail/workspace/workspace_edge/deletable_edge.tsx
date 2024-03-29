/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BaseEdge,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from 'reactflow';
import { setDirty } from '../../../../store';

// styling
import './deletable-edge-styles.scss';
import { useDispatch } from 'react-redux';

type DeletableEdgeProps = EdgeProps;

/**
 * A custom deletable edge. Renders a delete button in the center of the edge once connected.
 * Using bezier path by default. For all edge types,
 * see https://reactflow.dev/docs/examples/edges/edge-types/
 */
export function DeletableEdge(props: DeletableEdgeProps) {
  const dispatch = useDispatch();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  const reactFlowInstance = useReactFlow();

  const deleteEdge = (edgeId: string) => {
    reactFlowInstance.setEdges(
      reactFlowInstance.getEdges().filter((edge: Edge) => edge.id !== edgeId)
    );
    dispatch(setDirty());
  };

  const onEdgeClick = (event: any, edgeId: string) => {
    // Prevent this event from bubbling up and putting reactflow into an unexpected state.
    // This implementation follows the doc example: https://reactflow.dev/docs/examples/edges/custom-edge/
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
            zIndex: 1,
          }}
          className="nodrag nopan"
        >
          <button
            // We need to specify type as "button" to prevent formik from reading this as a "submit" type
            // by default, in which case validation is triggered unexpectedly.
            type="button"
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
