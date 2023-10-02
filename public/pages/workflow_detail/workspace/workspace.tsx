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
import { Workflow } from '../../../../common';
import { getCore } from '../../../services';

// styling
import 'reactflow/dist/style.css';
import './reactflow-styles.scss';

interface WorkspaceProps {
  workflow?: Workflow;
}

export function Workspace(props: WorkspaceProps) {
  const reactFlowWrapper = useRef(null);
  const { reactFlowInstance, setReactFlowInstance } = useContext(rfContext);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
