/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
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
  Panel,
  getRectOfNodes,
  Node,
} from 'reactflow';
import { EuiFlexItem, EuiFlexGroup, EuiIcon, EuiButton } from '@elastic/eui';
import { setDirty } from '../../../store';
import {
  IComponent,
  IComponentData,
  ReactFlowComponent,
  Workflow,
} from '../../../../common';
import { generateId, initComponentData } from '../../../utils';
import {
  PlaceholderComponent,
  WorkspaceComponent,
} from '../workspace_component';
import { DeletableEdge } from '../workspace_edge';

// styling
import 'reactflow/dist/style.css';
import './reactflow-styles.scss';
import './workspace-styles.scss';
import '../workspace_edge/deletable-edge-styles.scss';
import { ComponentLibrary } from './component_library';

interface WorkspaceProps {
  workflow?: Workflow;
  onNodesChange: (nodes: ReactFlowComponent[]) => void;
  id: string;
  // TODO: make more typesafe
  onSelectionChange: ({ nodes, edges }) => void;
}

const nodeTypes = {
  customComponent: WorkspaceComponent,
  new: PlaceholderComponent,
};
const edgeTypes = { customEdge: DeletableEdge };

export function Workspace(props: WorkspaceProps) {
  const dispatch = useDispatch();

  // ReactFlow state
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<IComponentData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Component library state
  const [componentLibraryOpen, setComponentLibraryOpen] = useState<boolean>(
    false
  );

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
      const serializedComponent = event.dataTransfer.getData(
        'application/reactflow'
      ) as string;
      const component = JSON.parse(serializedComponent) as IComponent;
      // TODO: expand to make dynamic instead of hardcoding ingest for now
      const ingest = true;
      let ingestGroupNode = {} as Node<IComponentData>;
      if (ingest) {
        ingestGroupNode = reactFlowInstance
          .getNodes()
          .find((node: Node) => node.type === 'group') as Node<IComponentData>;
      }

      // check if the dropped element is valid
      if (typeof component === 'undefined' || !component) {
        return;
      }

      // Fetch bounds based on the ref'd div component, adjust as needed.
      // TODO: remove hardcoded bounds and fetch from a constant somewhere
      // @ts-ignore
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      // @ts-ignore
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // TODO: remove hardcoded values when more component info is passed in the event.
      // Only keep the calculated 'position' field.
      const id = generateId(component.type);
      const newNode = {
        id,
        type: 'new',
        position,
        positionAbsolute: position,
        data: initComponentData(component, id),
      };

      setNodes((nds) => nds.concat(newNode));
      dispatch(setDirty());
    },
    [reactFlowInstance]
  );

  useEffect(() => {
    if (nodes !== undefined) {
      const ingestGroupNode = nodes.find(
        (node: Node) => node.type === 'group'
      ) as Node<IComponentData>;

      const newNode = nodes.find((node: Node) => node.type == 'new') as Node<
        IComponentData
      >;

      if (
        ingestGroupNode !== undefined &&
        newNode !== undefined &&
        ingestGroupNode.height !== undefined &&
        ingestGroupNode.width !== undefined &&
        newNode.height !== undefined &&
        newNode.width !== undefined
      ) {
        // We limit the intersecting space to the single pixel. This is to prevent
        // dropping a component outside, but near, the group component from being considered
        // overlapping and included.
        const rect = { ...getRectOfNodes([newNode]), width: 1, height: 1 };
        const isNodeIntersecting = reactFlowInstance.isNodeIntersecting(
          ingestGroupNode,
          rect,
          true
        );
        // If user drops a component inside the group/parent flow, re-format it and expand the parent
        // component's height/width if needed.
        if (isNodeIntersecting) {
          const updatedNewNode = {
            ...newNode,
            type: 'customComponent',
            parentNode: ingestGroupNode.id,
            extent: 'parent',
            position: {
              x: newNode.positionAbsolute.x - ingestGroupNode.position.x,
              y: newNode.positionAbsolute.y - ingestGroupNode.position.y,
            },
            // Multiple workarounds needed to get to function properly.
            // Width/height as fields used to correctly determine the combined rect / bounding box.
            // Width/height as nested 'style' fields needed to render correctly in ReactFlow workspace.
            width: 300,
            height: 250,
            style: {
              width: 300,
              height: 250,
            },
          };

          const combinedRect = getRectOfNodes([
            updatedNewNode,
            ingestGroupNode,
          ]);

          const updatedIngestGroupNode = {
            ...ingestGroupNode,
            // Width/height as nested 'style' fields needed to render correctly in ReactFlow workspace.
            style: {
              height: combinedRect.height,
              width: combinedRect.width,
            },
          };

          // Update the placeholder node with the final implementation
          // Update the parent node dimensions if height/width has expanded
          setNodes((nodes) =>
            nodes.map((node) => {
              // update the new node
              if (node.id === newNode.id) {
                node = updatedNewNode;
              }
              // update the group node bounds
              else if (node.id === ingestGroupNode.id) {
                console.log('ingest node found');
                node = updatedIngestGroupNode;
              }
              return node;
            })
          );
        } else {
          setNodes((nodes) => nodes.filter((node) => node.id !== newNode.id));
        }
      }
    }
  }, [nodes]);

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
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              className="reactflow-workspace"
              fitView
            >
              {componentLibraryOpen && (
                <Panel
                  position="top-left"
                  style={{ marginTop: '64px', width: '25vh' }}
                >
                  <ComponentLibrary
                    onClose={() => setComponentLibraryOpen(false)}
                  />
                </Panel>
              )}
              <Controls
                showFitView={false}
                showZoom={false}
                showInteractive={false}
                position="top-left"
              >
                <EuiButton
                  onClick={() => {
                    console.log('add component triggered');
                    setComponentLibraryOpen(true);
                  }}
                >
                  <EuiIcon type="plusInCircleFilled" /> Add component
                </EuiButton>
              </Controls>
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
