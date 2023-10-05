/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useContext, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import { EuiFlexItem, EuiFlexGroup } from '@elastic/eui';
import { rfContext } from '../../../store';
import { IComponent, Workflow } from '../../../../common';
import { generateId } from '../../../utils';
import { getCore } from '../../../services';
import { WorkspaceComponent } from '../workspace_component';
import { DeletableEdge } from '../workspace_edge';

// styling
import 'reactflow/dist/style.css';
import './reactflow-styles.scss';
import '../workspace_edge/deletable-edge-styles.scss';

interface WorkspaceProps {
  workflow?: Workflow;
}

const nodeTypes = { customComponent: WorkspaceComponent };
const edgeTypes = { customEdge: DeletableEdge };

export function Workspace(props: WorkspaceProps) {
  const reactFlowWrapper = useRef(null);
  const { reactFlowInstance, setReactFlowInstance } = useContext(rfContext);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: 'customEdge',
      };
      setEdges((eds) => addEdge(edge, eds));
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
      const newNode = {
        id: generateId(nodeData.type),
        type: nodeData.type,
        position,
        data: nodeData,
        style: {
          background: 'white',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  // Initialization. Set the nodes and edges to an existing workflow,
  // if applicable.
  useEffect(() => {
    const workflow = props.workflow;
    if (workflow) {
      if (workflow.reactFlowState) {
        setNodes(workflow.reactFlowState.nodes);
        setEdges(workflow.reactFlowState.edges);
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
      gutterSize="m"
      justifyContent="spaceBetween"
      className="workspace"
    >
      <EuiFlexItem
        style={{
          borderStyle: 'groove',
          borderColor: 'gray',
          borderWidth: '1px',
        }}
      >
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
              <Background />
            </ReactFlow>
          </div>
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
