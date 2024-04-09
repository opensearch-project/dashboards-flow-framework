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

export type IngestProcessor = {
  description?: string;
};

export type TextEmbeddingProcessor = IngestProcessor & {
  text_embedding: {
    model_id: string;
    field_map: {};
  };
};

export type TemplateNode = {
  id: string;
  type: string;
  previous_node_inputs?: {};
  user_inputs?: {};
};

export type CreateIngestPipelineNode = TemplateNode & {
  user_inputs: {
    pipeline_id: string;
    model_id: string;
    input_field: string;
    output_field: string;
    configurations: {
      description?: string;
      processors: IngestProcessor[];
    };
  };
};

export type CreateIndexNode = TemplateNode & {
  previous_node_inputs: {
    [ingest_pipeline_step_id: string]: string;
  };
  user_inputs: {
    index_name: string;
    configurations: {
      settings: {};
      mappings: {};
    };
  };
};

export type TemplateEdge = {
  source: string;
  target: string;
};

export type TemplateFlow = {
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
 ********** ML PLUGIN TYPES/INTERFACES **********
 */
export type Model = {
  id: string;
  algorithm: string;
};

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

export type ModelDict = {
  [modelId: string]: Model;
};
