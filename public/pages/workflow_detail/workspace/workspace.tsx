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
import { useSelector } from 'react-redux';
import { EuiFlexItem, EuiFlexGroup } from '@elastic/eui';
import { AppState, rfContext } from '../../../store';
import { convertToReactFlowData } from '../../../../common';

// styling
import 'reactflow/dist/style.css';
import './reactflow-styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface WorkspaceProps {}

export function Workspace(props: WorkspaceProps) {
  const reactFlowWrapper = useRef(null);
  const { reactFlowInstance, setReactFlowInstance } = useContext(rfContext);

  // Fetching workspace state to populate the initial nodes/edges.
  // Where/how the low-level ReactFlow JSON will be persisted is TBD.
  // TODO: update when that design is finalized
  const storedComponents = useSelector(
    (state: AppState) => state.workspace.components
  );
  const { rfNodes, rfEdges } = convertToReactFlowData(storedComponents);
  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
    },
    // TODO: add customized logic to prevent connections based on the node's
    // allowed inputs. If allowed, update that node state as well with the added
    // connection details.
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
      const nodeData = event.dataTransfer.getData('application/reactflow');

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
      // Only keep the calculated 'positioning' field.
      const newNode = {
        // TODO: generate ID based on the node data maybe
        id: Date.now().toFixed(),
        type: nodeData.type,
        position,
        data: { label: nodeData.label },
        style: {
          background: 'white',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reactFlowInstance]
  );

  // Initialization hook
  useEffect(() => {
    // TODO: fetch the nodes/edges dynamically (loading existing flow,
    // creating fresh from template, creating blank template, etc.)
    // Will involve populating and/or fetching from redux store
  }, []);

  return (
    <EuiFlexItem grow={true}>
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
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                fitView
              >
                <Controls />
                <Background />
              </ReactFlow>
            </div>
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  );
}

// TODO: remove later, leaving for reference

// export function Workspace() {
//   const { components } = useSelector((state: AppState) => state.workspace);

//   return (
//     <EuiFlexGroup direction="row">
//       {components.map((component, idx) => {
//         return (
//           <EuiFlexItem key={idx}>
//             <WorkspaceComponent component={component} />
//           </EuiFlexItem>
//         );
//       })}
//     </EuiFlexGroup>
//   );
// }
