/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Node, Edge } from 'reactflow';
import { IComponent as IComponentData } from '../public/component_types';

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

export type ReactFlowState = {
  nodes: ReactFlowComponent[];
  edges: ReactFlowEdge[];
  viewport?: ReactFlowViewport;
};

/**
 ********** USE CASE TEMPLATE TYPES/INTERFACES **********
 */

type TemplateNode = {
  id: string;
  inputs: {};
};

type TemplateEdge = {
  source: string;
  target: string;
};

type TemplateFlow = {
  userParams: {};
  nodes: TemplateNode[];
  edges: TemplateEdge[];
};

type TemplateFlows = {
  provision: TemplateFlow;
  ingest: TemplateFlow;
  query: TemplateFlow;
};

export type UseCaseTemplate = {
  type: string;
  name: string;
  description: string;
  userInputs: {};
  workflows: TemplateFlows;
};

export type Workflow = {
  id: string;
  name: string;
  description?: string;
  // ReactFlow state may not exist if a workflow is created via API/backend-only.
  reactFlowState?: ReactFlowState;
  template: UseCaseTemplate;
  lastUpdated: number;
};
