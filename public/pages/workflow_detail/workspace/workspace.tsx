/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useContext, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  useStore,
} from 'reactflow';
import { EuiFlexItem, EuiFlexGroup } from '@elastic/eui';
import { rfContext, setDirty } from '../../../store';
import {
  IComponent,
  IComponentData,
  ReactFlowComponent,
  Workflow,
} from '../../../../common';
import { generateId, initComponentData } from '../../../utils';
import { getCore } from '../../../services';
import { WorkspaceComponent } from '../workspace_component';
import { DeletableEdge } from '../workspace_edge';

// styling
import 'reactflow/dist/style.css';
import './reactflow-styles.scss';
import './workspace-styles.scss';
import '../workspace_edge/deletable-edge-styles.scss';

interface WorkspaceProps {
  workflow?: Workflow;
  onNodesChange: (nodes: ReactFlowComponent[]) => void;
}

const nodeTypes = { customComponent: WorkspaceComponent };
const edgeTypes = { customEdge: DeletableEdge };

export function Workspace(props: WorkspaceProps) {
  const dispatch = useDispatch();
  const reactFlowWrapper = useRef(null);
  const { reactFlowInstance, setReactFlowInstance } = useContext(rfContext);

  const [nodes, setNodes, onNodesChange] = useNodesState<IComponentData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Listener for node additions or deletions to propagate to parent component
  const nodesLength = useStore(
    (state) => Array.from(state.nodeInternals.values()).length || 0
  );
  useEffect(() => {
    props.onNodesChange(nodes);
  }, [nodesLength]);

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: 'customEdge',
      };
      setEdges((eds) => addEdge(edge, eds));
      dispatch(setDirty());
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      // Get the node info from the event metadata
      const nodeData = event.dataTransfer.getData(
        'application/reactflow'
      ) as IComponent;

      // check if the dropped element is valid
      if (typeof nodeData === 'undefined' || !nodeData) {
        return;
      }

      // Fetch bounds based on the ref'd div component, adjust as needed.
      // TODO: remove hardcoded bounds and fetch from a constant somewhere
      // @ts-ignore
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      // @ts-ignore
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left - 80,
        y: event.clientY - reactFlowBounds.top - 90,
      });

      // TODO: remove hardcoded values when more component info is passed in the event.
      // Only keep the calculated 'position' field.
      const id = generateId(nodeData.type);
      const newNode = {
        id,
        type: nodeData.type,
        position,
        data: initComponentData(nodeData, id),
        style: {
          background: 'white',
        },
      };

      setNodes((nds) => nds.concat(newNode));
      dispatch(setDirty());
    },
    [reactFlowInstance]
  );

  // Initialization. Set the nodes and edges to an existing workflow,
  // if applicable.
  useEffect(() => {
    const workflow = props.workflow;
    if (workflow) {
      if (workflow.workspaceFlowState) {
        setNodes(workflow.workspaceFlowState.nodes);
        setEdges(workflow.workspaceFlowState.edges);
      } else {
        getCore().notifications.toasts.addWarning(
          `There is no configured UI flow for workflow: ${workflow.name}`
        );
      }
    }
  }, [props.workflow]);

  return (
    <EuiFlexGroup
      direction="column"
      gutterSize="none"
      justifyContent="spaceBetween"
      className="workspace-panel"
    >
      <EuiFlexItem className="euiPanel euiPanel--hasShadow euiPanel--borderRadiusMedium">
        {/**
         * We have these wrapper divs & reactFlowWrapper ref to control and calculate the
         * ReactFlow bounds when calculating node positioning.
         */}
        <div className="reactflow-parent-wrapper">
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              className="reactflow-workspace"
              fitView
            >
              <Controls />
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
