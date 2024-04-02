/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Node, Edge } from 'reactflow';
import { IComponentData } from '../public/component_types';

export type Index = {
  name: string;
  health: 'green' | 'yellow' | 'red';
};

/**
 ********** REACTFLOW TYPES/INTERFACES **********
 */

export type ReactFlowComponent = Node<IComponentData>;

// TODO: we may not need this re-defined type here at all, if we don't add
// any special fields/configuration for an edge. Currently this
// is the same as the default Edge type.
export type ReactFlowEdge = Edge<{}> & {};

type ReactFlowViewport = {
  x: number;
  y: number;
  zoom: number;
};

export type UIState = {
  workspaceFlow: WorkspaceFlowState;
};

export type WorkspaceFlowState = {
  nodes: ReactFlowComponent[];
  edges: ReactFlowEdge[];
  viewport?: ReactFlowViewport;
};

/**
 ********** USE CASE TEMPLATE TYPES/INTERFACES **********
 */

export type TemplateNode = {
  id: string;
  type: string;
  previous_node_inputs?: Map<string, any>;
  user_inputs?: Map<string, any>;
};

export type TemplateEdge = {
  source: string;
  target: string;
};

export type TemplateFlow = {
  user_inputs?: Map<string, any>;
  previous_node_inputs?: Map<string, any>;
  nodes: TemplateNode[];
  edges?: TemplateEdge[];
};

export type TemplateFlows = {
  provision: TemplateFlow;
};

// A stateless template of a workflow
export type WorkflowTemplate = {
  name: string;
  description: string;
  use_case: USE_CASE;
  // TODO: finalize on version type when that is implemented
  // https://github.com/opensearch-project/flow-framework/issues/526
  version: any;
  workflows: TemplateFlows;
  // UI state and any ReactFlow state may not exist if a workflow is created via API/backend-only.
  ui_metadata?: UIState;
};

// An instance of a workflow based on a workflow template
export type Workflow = WorkflowTemplate & {
  // won't exist until created in backend
  id?: string;
  // won't exist until created in backend
  lastUpdated?: number;
  // won't exist until launched/provisioned in backend
  lastLaunched?: number;
  // won't exist until launched/provisioned in backend
  state?: WORKFLOW_STATE;
};

export enum USE_CASE {
  PROVISION = 'PROVISION',
}

/**
 ********** MISC TYPES/INTERFACES ************
 */

// TODO: finalize how we have the launch data model
export type WorkflowLaunch = {
  id: string;
  state: WORKFLOW_STATE;
  lastUpdated: number;
};

// Based off of https://github.com/opensearch-project/flow-framework/blob/main/src/main/java/org/opensearch/flowframework/model/State.java
export enum WORKFLOW_STATE {
  NOT_STARTED = 'Not started',
  PROVISIONING = 'Provisioning',
  FAILED = 'Failed',
  COMPLETED = 'Completed',
}

export type WorkflowDict = {
  [workflowId: string]: Workflow;
};
