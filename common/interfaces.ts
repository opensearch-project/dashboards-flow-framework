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
export type ReactFlowEdge = Edge<{}> & {};

type ReactFlowViewport = {
  x: number;
  y: number;
  zoom: number;
};

export type UIState = {
  workspace_flow: WorkspaceFlowState;
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
    model_id?: string;
    input_field?: string;
    output_field?: string;
    configurations: {
      description?: string;
      processors: IngestProcessor[];
    };
  };
};

export type CreateIndexNode = TemplateNode & {
  previous_node_inputs?: {
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

export type RegisterPretrainedModelNode = TemplateNode & {
  user_inputs: {
    name: string;
    description: string;
    model_format: string;
    version: string;
    deploy: boolean;
  };
};

export type TemplateEdge = {
  source: string;
  dest: string;
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
  // won't exist until launched/provisioned in backend
  resourcesCreated?: WorkflowResource[];
};

export enum USE_CASE {
  SEMANTIC_SEARCH = 'SEMANTIC_SEARCH',
}

/**
 ********** ML PLUGIN TYPES/INTERFACES **********
 */

// Based off of https://github.com/opensearch-project/ml-commons/blob/main/common/src/main/java/org/opensearch/ml/common/model/MLModelState.java
export enum MODEL_STATE {
  REGISTERED = 'Registered',
  REGISTERING = 'Registering',
  DEPLOYING = 'Deploying',
  DEPLOYED = 'Deployed',
  PARTIALLY_DEPLOYED = 'Partially deployed',
  UNDEPLOYED = 'Undeployed',
  DEPLOY_FAILED = 'Deploy failed',
}

export enum MODEL_CATEGORY {
  DEPLOYED = 'Deployed',
  PRETRAINED = 'Pretrained',
}

export enum PRETRAINED_MODEL_FORMAT {
  TORCH_SCRIPT = 'TORCH_SCRIPT',
}

export type PretrainedModel = {
  name: string;
  shortenedName: string;
  description: string;
  format: PRETRAINED_MODEL_FORMAT;
  version: string;
};

export type PretrainedSentenceTransformer = PretrainedModel & {
  vectorDimensions: number;
};

export type ModelConfig = {
  modelType?: string;
  embeddingDimension?: number;
};

export type Model = {
  id: string;
  name: string;
  algorithm: string;
  state: MODEL_STATE;
  modelConfig?: ModelConfig;
};

export type ModelDict = {
  [modelId: string]: Model;
};

export type ModelFormValue = {
  id: string;
  category?: MODEL_CATEGORY;
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

export type WorkflowResource = {
  id: string;
  type: WORKFLOW_RESOURCE_TYPE;
};

// Based off of https://github.com/opensearch-project/flow-framework/blob/main/src/main/java/org/opensearch/flowframework/common/WorkflowResources.java
export enum WORKFLOW_RESOURCE_TYPE {
  PIPELINE_ID = 'Ingest pipeline',
  INDEX_NAME = 'Index',
  MODEL_ID = 'Model',
  MODEL_GROUP_ID = 'Model group',
  CONNECTOR_ID = 'Connector',
}

export type WorkflowDict = {
  [workflowId: string]: Workflow;
};
