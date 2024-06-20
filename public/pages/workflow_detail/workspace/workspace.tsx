/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiTitle,
  EuiFilterGroup,
  EuiFilterButton,
  EuiCodeEditor,
} from '@elastic/eui';
import { setDirty, useAppDispatch } from '../../../store';
import { IComponentData, Workflow, WorkflowConfig } from '../../../../common';
import {
  IngestGroupComponent,
  SearchGroupComponent,
  WorkspaceComponent,
} from './workspace_components';
import { DeletableEdge } from './workspace_edge';
import { uiConfigToWorkspaceFlow } from '../../../utils';

// styling
import 'reactflow/dist/style.css';
import './reactflow-styles.scss';
import './workspace-styles.scss';
import './workspace_edge/deletable-edge-styles.scss';

interface WorkspaceProps {
  workflow?: Workflow;
  uiConfig?: WorkflowConfig;
}

const nodeTypes = {
  custom: WorkspaceComponent,
  ingestGroup: IngestGroupComponent,
  searchGroup: SearchGroupComponent,
};
const edgeTypes = { customEdge: DeletableEdge };

export function Workspace(props: WorkspaceProps) {
  const dispatch = useAppDispatch();

  // Visual/JSON toggle states
  const [visualSelected, setVisualSelected] = useState<boolean>(true);
  function toggleSelection(): void {
    setVisualSelected(!visualSelected);
  }

  // JSON state
  const [provisionTemplate, setProvisionTemplate] = useState<string>('');
  useEffect(() => {
    if (props.workflow?.workflows.provision) {
      const templateAsObj = props.workflow?.workflows.provision as {};
      const templateAsStr = JSON.stringify(templateAsObj, undefined, 2);
      setProvisionTemplate(templateAsStr);
    }
  }, [props.workflow]);

  // ReactFlow state
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<IComponentData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

  // Initialization. Generate the nodes and edges based on the workflow config.
  useEffect(() => {
    if (props.uiConfig) {
      const proposedWorkspaceFlow = uiConfigToWorkspaceFlow(props.uiConfig);
      setNodes(proposedWorkspaceFlow.nodes);
      setEdges(proposedWorkspaceFlow.edges);
    }
  }, [props.uiConfig]);

  return (
    <EuiFlexGroup
      direction="column"
      gutterSize="none"
      justifyContent="spaceBetween"
    >
      <EuiFlexItem
        className="euiPanel euiPanel--hasShadow euiPanel--borderRadiusMedium"
        style={{ overflowX: 'hidden' }}
      >
        {/**
         * We have these wrapper divs & reactFlowWrapper ref to control and calculate the
         * ReactFlow bounds when calculating node positioning.
         */}
        <div>
          <EuiFlexGroup direction="row" style={{ padding: '12px' }}>
            <EuiFlexItem grow={false}>
              <EuiTitle>
                <h2>Preview</h2>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFilterGroup>
                <EuiFilterButton
                  size="l"
                  hasActiveFilters={visualSelected}
                  onClick={() => toggleSelection()}
                >
                  Visual
                </EuiFilterButton>
                <EuiFilterButton
                  size="l"
                  hasActiveFilters={!visualSelected}
                  onClick={() => toggleSelection()}
                >
                  JSON
                </EuiFilterButton>
              </EuiFilterGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
        <div className="reactflow-parent-wrapper">
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            {visualSelected ? (
              <ReactFlow
                id="workspace"
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
                minZoom={0.2}
                edgesUpdatable={false}
                edgesFocusable={false}
                nodesDraggable={false}
                nodesConnectable={false}
                nodesFocusable={false}
                draggable={true}
                panOnDrag={true}
                elementsSelectable={false}
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
            ) : (
              <EuiCodeEditor
                mode="json"
                theme="textmate"
                width="100%"
                height="100%"
                value={provisionTemplate}
                readOnly={true}
                setOptions={{
                  fontSize: '12px',
                  autoScrollEditorIntoView: true,
                }}
                tabSize={2}
              />
            )}
          </div>
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
