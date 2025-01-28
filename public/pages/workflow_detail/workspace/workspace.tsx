/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiCodeEditor,
  EuiText,
  EuiLink,
  EuiSmallButtonGroup,
} from '@elastic/eui';
import {
  IComponentData,
  WORKFLOW_TUTORIAL_LINK,
  Workflow,
  WorkflowConfig,
  customStringify,
} from '../../../../common';
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

const PANEL_TITLE = 'Preview flows';

const nodeTypes = {
  custom: WorkspaceComponent,
  ingestGroup: IngestGroupComponent,
  searchGroup: SearchGroupComponent,
};
const edgeTypes = { customEdge: DeletableEdge };

enum TOGGLE_BUTTON_ID {
  VISUAL = 'workspaceVisualButton',
  JSON = 'workspaceJSONButton',
}

export function Workspace(props: WorkspaceProps) {
  // Visual/JSON toggle states
  const [toggleButtonSelected, setToggleButtonSelected] = useState<
    TOGGLE_BUTTON_ID
  >(TOGGLE_BUTTON_ID.VISUAL);
  const toggleButtons = [
    {
      id: TOGGLE_BUTTON_ID.VISUAL,
      label: 'Visual',
    },
    {
      id: TOGGLE_BUTTON_ID.JSON,
      label: 'JSON',
    },
  ];

  // JSON state
  const [provisionTemplate, setProvisionTemplate] = useState<string>('');
  useEffect(() => {
    if (props.workflow?.workflows?.provision) {
      const templateAsObj = props.workflow?.workflows.provision as {};
      const templateAsStr = customStringify(templateAsObj);
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
        className="euiPanel euiPanel--hasShadow euiPanel--borderRadiusLarge"
        style={{ overflowX: 'hidden' }}
      >
        {/**
         * We have these wrapper divs & reactFlowWrapper ref to control and calculate the
         * ReactFlow bounds when calculating node positioning.
         */}
        <div>
          <EuiFlexGroup direction="row" style={{ padding: '12px' }}>
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                <h3>{PANEL_TITLE}</h3>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButtonGroup
                legend="Toggle between visual and JSON views"
                options={toggleButtons}
                idSelected={toggleButtonSelected}
                onChange={(id) =>
                  setToggleButtonSelected(id as TOGGLE_BUTTON_ID)
                }
                data-testid="visualJSONToggleButtonGroup"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ paddingTop: '8px' }}>
              {toggleButtonSelected === TOGGLE_BUTTON_ID.VISUAL ? (
                <EuiText size="s">
                  {`A basic visual view representing the configured ingest & search flows.`}
                </EuiText>
              ) : (
                <EuiText size="s">
                  {`The Flow Framework provisioning template describing how to build out the configured resources. `}
                  <EuiLink href={WORKFLOW_TUTORIAL_LINK} target="_blank">
                    Learn more
                  </EuiLink>
                </EuiText>
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
        <div className="reactflow-parent-wrapper">
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            {toggleButtonSelected === TOGGLE_BUTTON_ID.VISUAL ? (
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
                  wrap: true,
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
