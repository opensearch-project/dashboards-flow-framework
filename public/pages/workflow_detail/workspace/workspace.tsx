/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  useStore,
  useReactFlow,
  useOnSelectionChange,
  MarkerType,
} from 'reactflow';
import { EuiFlexItem, EuiFlexGroup } from '@elastic/eui';
import { setDirty } from '../../../store';
import {
  IComponentData,
  ReactFlowComponent,
  Workflow,
} from '../../../../common';
import {
  IngestGroupComponent,
  SearchGroupComponent,
  WorkspaceComponent,
} from './workspace_components';
import { DeletableEdge } from './workspace_edge';

// styling
import 'reactflow/dist/style.css';
import './reactflow-styles.scss';
import './workspace-styles.scss';
import './workspace_edge/deletable-edge-styles.scss';

interface WorkspaceProps {
  workflow?: Workflow;
  onNodesChange: (nodes: ReactFlowComponent[]) => void;
  id: string;
  // TODO: make more typesafe
  onSelectionChange: ({ nodes, edges }) => void;
}

const nodeTypes = {
  custom: WorkspaceComponent,
  ingestGroup: IngestGroupComponent,
  searchGroup: SearchGroupComponent,
};
const edgeTypes = { customEdge: DeletableEdge };

export function Workspace(props: WorkspaceProps) {
  const dispatch = useDispatch();

  // ReactFlow state
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<IComponentData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Listener for node additions or deletions to propagate to parent component
  const nodesLength = useStore(
    (state) => Array.from(state.nodeInternals.values()).length || 0
  );
  useEffect(() => {
    props.onNodesChange(nodes);
  }, [nodesLength]);

  /**
   * Hook provided by reactflow to listen on when nodes are selected / de-selected.
   * Trigger the callback fn to propagate changes to parent components.
   */
  useOnSelectionChange({
    onChange: props.onSelectionChange,
  });

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: 'customEdge',
      };
      setEdges((eds) =>
        addEdge(
          {
            ...edge,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            },
          },
          eds
        )
      );
      dispatch(setDirty());
    },
    [setEdges]
  );

  // Initialization. Set the nodes and edges to an existing workflow state,
  useEffect(() => {
    const workflow = { ...props.workflow };
    if (workflow && workflow.workspaceFlowState) {
      setNodes(workflow.workspaceFlowState.nodes);
      setEdges(workflow.workspaceFlowState.edges);
    }
  }, [props.workflow]);

  return (
    <EuiFlexGroup
      direction="column"
      gutterSize="none"
      justifyContent="spaceBetween"
    >
      <EuiFlexItem className="euiPanel euiPanel--hasShadow euiPanel--borderRadiusMedium">
        {/**
         * We have these wrapper divs & reactFlowWrapper ref to control and calculate the
         * ReactFlow bounds when calculating node positioning.
         */}
        <div className="reactflow-parent-wrapper">
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              id={props.id}
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              // TODO: add custom edge types back if we want to support custom deletable buttons
              // edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              className="reactflow-workspace"
              fitView
            >
              <Controls
                showFitView={false}
                showZoom={false}
                showInteractive={false}
                position="top-left"
              ></Controls>
              <Background
                color="#343741"
                variant={'dots' as BackgroundVariant}
              />
            </ReactFlow>
          </div>
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
