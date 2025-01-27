/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarkerType } from 'reactflow';
import {
  WorkflowConfig,
  IngestConfig,
  SearchConfig,
  ProcessorsConfig,
  WorkspaceFlowState,
  ReactFlowEdge,
  ReactFlowComponent,
  COMPONENT_CLASS,
  COMPONENT_CATEGORY,
  NODE_CATEGORY,
  PROCESSOR_TYPE,
  IComponent,
  IComponentData,
  PROCESSOR_CONTEXT,
} from '../../common';
import {
  Document,
  MLTransformer,
  BaseTransformer,
  SearchResponse,
  SearchRequest,
  BaseIndex,
} from '../component_types';
import { generateId } from './utils';

/*
 **************** Config -> workspace utils **********************
 */

export const PARENT_NODE_HEIGHT = 275;
const NODE_WIDTH = 250; // based off of the value set in reactflow-styles.scss
export const NODE_SPACING = 40; // the margin (in # pixels) between the components, and the parent component's edges.

export function uiConfigToWorkspaceFlow(
  config: WorkflowConfig
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  const ingestWorkspaceFlow = ingestConfigToWorkspaceFlow(config.ingest);
  nodes.push(...ingestWorkspaceFlow.nodes);
  edges.push(...ingestWorkspaceFlow.edges);

  const searchWorkspaceFlow = searchConfigToWorkspaceFlow(config.search);
  nodes.push(...searchWorkspaceFlow.nodes);
  edges.push(...searchWorkspaceFlow.edges);

  return {
    nodes: nodes.map((node) => addDefaults(node)),
    edges,
  };
}

// Helper fn for determining the ingest parent width, based on the number of processors and the specified
// spacing/margin between nodes
function generateIngestParentWidth(ingestConfig: IngestConfig): number {
  return (
    (ingestConfig.enrich.processors.length + 2) * (NODE_WIDTH + NODE_SPACING) +
    NODE_SPACING
  );
}

// Helper fn for determining the search parent width, based on the number of
// search request processors, search response processors, and the specified
// spacing/margin between nodes
function generateSearchParentWidth(searchConfig: SearchConfig): number {
  return (
    (searchConfig.enrichRequest.processors.length +
      searchConfig.enrichResponse.processors.length +
      3) *
      (NODE_WIDTH + NODE_SPACING) +
    NODE_SPACING
  );
}

function ingestConfigToWorkspaceFlow(
  ingestConfig: IngestConfig
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  // Parent ingest node
  const parentNode = {
    id: ingestConfig.pipelineName.value,
    position: { x: 400, y: 400 },
    type: NODE_CATEGORY.INGEST_GROUP,
    data: { label: COMPONENT_CATEGORY.INGEST },
    style: {
      width: generateIngestParentWidth(ingestConfig),
      height: PARENT_NODE_HEIGHT,
    },
    className: 'reactflow__group-node__ingest',
  } as ReactFlowComponent;

  nodes.push(parentNode);

  // By default, always include a document node and an index node.
  const docNodeId = generateId(COMPONENT_CLASS.DOCUMENT);
  const docNode = {
    id: docNodeId,
    position: { x: NODE_SPACING, y: NODE_SPACING },
    data: initComponentData(
      { ...new Document().toObj(), iconType: 'document' },
      docNodeId
    ),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNode.id,
    extent: 'parent',
  } as ReactFlowComponent;
  const indexNodeId = generateId(COMPONENT_CLASS.INDEX);
  const indexNode = {
    id: indexNodeId,
    position: {
      x: parentNode?.style?.width - (NODE_WIDTH + NODE_SPACING),
      y: NODE_SPACING,
    },
    data: initComponentData(
      {
        ...new BaseIndex(COMPONENT_CATEGORY.INGEST).toObj(),
        iconType: 'indexSettings',
      },
      indexNodeId
    ),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNode.id,
    extent: 'parent',
  } as ReactFlowComponent;
  nodes.push(docNode, indexNode);

  // Get nodes/edges from the sub-configurations
  const enrichWorkspaceFlow = processorsConfigToWorkspaceFlow(
    ingestConfig.enrich,
    PROCESSOR_CONTEXT.INGEST,
    parentNode.id,
    NODE_WIDTH + NODE_SPACING * 2 // node padding + (width of doc node) + node padding
  );

  nodes.push(...enrichWorkspaceFlow.nodes);
  edges.push(...enrichWorkspaceFlow.edges);

  // Link up the set of localized nodes/edges per sub-workflow
  edges.push(...getIngestEdges(docNode, enrichWorkspaceFlow, indexNode));

  return {
    nodes,
    edges,
  };
}

// Given the set of localized flows per sub-configuration, generate the global ingest-level edges.
// This takes the assumption the flow is linear, and all sub-configuration flows are fully connected.
function getIngestEdges(
  docNode: ReactFlowComponent,
  enrichFlow: WorkspaceFlowState,
  indexNode: ReactFlowComponent
): ReactFlowEdge[] {
  const startAndEndNodesEnrich = getStartAndEndNodes(enrichFlow);

  // Users may omit search request processors altogether. Need to handle cases separately.
  if (startAndEndNodesEnrich !== undefined) {
    const sourceToEnrichEdgeId = generateId('edge');
    const enrichToIndexEdgeId = generateId('edge');

    return [
      generateReactFlowEdge(
        sourceToEnrichEdgeId,
        docNode.id,
        startAndEndNodesEnrich.startNode.id
      ),
      generateReactFlowEdge(
        enrichToIndexEdgeId,
        startAndEndNodesEnrich.endNode.id,
        indexNode.id
      ),
    ] as ReactFlowEdge[];
  } else {
    const sourceToIndexEdgeId = generateId('edge');
    return [
      generateReactFlowEdge(sourceToIndexEdgeId, docNode.id, indexNode.id),
    ] as ReactFlowEdge[];
  }
}

function searchConfigToWorkspaceFlow(
  searchConfig: SearchConfig
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  // Parent search node
  const parentNode = {
    id: searchConfig.pipelineName.value,
    position: { x: 400, y: 700 },
    type: NODE_CATEGORY.SEARCH_GROUP,
    data: { label: COMPONENT_CATEGORY.SEARCH },
    style: {
      width: generateSearchParentWidth(searchConfig),
      height: PARENT_NODE_HEIGHT,
    },
    className: 'reactflow__group-node__search',
  } as ReactFlowComponent;

  nodes.push(parentNode);

  // Get nodes/edges from the processor sub-configurations
  const enrichRequestWorkspaceFlow = processorsConfigToWorkspaceFlow(
    searchConfig.enrichRequest,
    PROCESSOR_CONTEXT.SEARCH_REQUEST,
    parentNode.id,
    NODE_WIDTH + NODE_SPACING * 2 // node padding + (width of searchRequest node) + node padding
  );
  const enrichResponseWorkspaceFlow = processorsConfigToWorkspaceFlow(
    searchConfig.enrichResponse,
    PROCESSOR_CONTEXT.SEARCH_RESPONSE,
    parentNode.id,
    NODE_SPACING +
      (NODE_WIDTH + NODE_SPACING) *
        (enrichRequestWorkspaceFlow.nodes.length + 2) // node padding + (width + padding of searchRequest node, any request processor nodes, and index node)
  );

  // By default, always include a search request node, an index node, and a search response node.
  const searchRequestNodeId = generateId(COMPONENT_CLASS.SEARCH_REQUEST);
  const searchRequestNode = {
    id: searchRequestNodeId,
    position: { x: NODE_SPACING, y: NODE_SPACING },
    data: initComponentData(
      { ...new SearchRequest().toObj(), iconType: 'editorCodeBlock' },
      searchRequestNodeId
    ),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNode.id,
    extent: 'parent',
  } as ReactFlowComponent;
  const indexNodeId = generateId(COMPONENT_CLASS.INDEX);
  const indexNode = {
    id: indexNodeId,
    position: {
      x:
        parentNode?.style?.width -
        (NODE_WIDTH + NODE_SPACING) *
          (enrichResponseWorkspaceFlow.nodes.length + 2),
      y: NODE_SPACING,
    },
    data: initComponentData(
      {
        ...new BaseIndex(COMPONENT_CATEGORY.SEARCH).toObj(),
        iconType: 'indexSettings',
      },
      indexNodeId
    ),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNode.id,
    extent: 'parent',
  } as ReactFlowComponent;
  const searchResponseNodeId = generateId(COMPONENT_CLASS.SEARCH_RESPONSE);
  const searchResponseNode = {
    id: searchResponseNodeId,
    position: {
      x: parentNode?.style?.width - (NODE_WIDTH + NODE_SPACING),
      y: NODE_SPACING,
    },
    data: initComponentData(
      { ...new SearchResponse().toObj(), iconType: 'inspect' },
      searchResponseNodeId
    ),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNode.id,
    extent: 'parent',
  } as ReactFlowComponent;
  nodes.push(searchRequestNode, indexNode, searchResponseNode);

  nodes.push(
    ...enrichRequestWorkspaceFlow.nodes,
    ...enrichResponseWorkspaceFlow.nodes
  );
  edges.push(
    ...enrichRequestWorkspaceFlow.edges,
    ...enrichResponseWorkspaceFlow.edges
  );

  // Link up the set of localized nodes/edges per sub-workflow
  edges.push(
    ...getSearchEdges(
      searchRequestNode,
      enrichRequestWorkspaceFlow,
      indexNode,
      enrichResponseWorkspaceFlow,
      searchResponseNode
    )
  );

  return {
    nodes,
    edges,
  };
}

// Helper fn to generate a dynamic list of processor nodes
// based on the list of processors in a config
function processorsConfigToWorkspaceFlow(
  processorsConfig: ProcessorsConfig,
  context: PROCESSOR_CONTEXT,
  parentNodeId: string,
  xPosition: number
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  let prevNodeId = undefined as string | undefined;

  processorsConfig.processors.forEach((processorConfig) => {
    let componentData = {} as IComponent;
    switch (processorConfig.type) {
      case PROCESSOR_TYPE.ML: {
        componentData = {
          ...new MLTransformer(context),
          iconType: 'compute',
          description:
            context === PROCESSOR_CONTEXT.INGEST
              ? 'Ingestion processor'
              : context === PROCESSOR_CONTEXT.SEARCH_REQUEST
              ? 'Search request processor'
              : 'Search response processor',
        };
        break;
      }
      case PROCESSOR_TYPE.SPLIT: {
        componentData = new BaseTransformer(
          processorConfig.name,
          'Split a string field into an array of substrings',
          context
        );
        break;
      }
      case PROCESSOR_TYPE.SORT: {
        componentData = new BaseTransformer(
          processorConfig.name,
          'Sort an array of items in either ascending or descending order',
          context
        );
        break;
      }
      case PROCESSOR_TYPE.TEXT_CHUNKING: {
        componentData = new BaseTransformer(
          processorConfig.name,
          'Split long documents into shorter passages',
          context
        );
        break;
      }
      case PROCESSOR_TYPE.COPY: {
        componentData = new BaseTransformer(
          processorConfig.name,
          'Copy an entire object in an existing field to another field',
          context
        );
        break;
      }
      case PROCESSOR_TYPE.NORMALIZATION: {
        componentData = new BaseTransformer(
          processorConfig.name,
          'Normalize and combine document scores from different query clauses',
          context
        );
        break;
      }
      case PROCESSOR_TYPE.COLLAPSE: {
        componentData = new BaseTransformer(
          processorConfig.name,
          'Discard hits with duplicate values',
          context
        );
        break;
      }
      case PROCESSOR_TYPE.RERANK: {
        componentData = new BaseTransformer(
          processorConfig.name,
          'Rerank results by a document field',
          context
        );
        break;
      }
      default: {
        componentData = new BaseTransformer(processorConfig.name, '', context);
        break;
      }
    }

    const transformerNodeId = generateId(componentData.type);
    nodes.push({
      id: transformerNodeId,
      position: { x: xPosition, y: NODE_SPACING },
      data: initComponentData(componentData, transformerNodeId),
      type: NODE_CATEGORY.CUSTOM,
      parentNode: parentNodeId,
      extent: 'parent',
    });
    xPosition += NODE_SPACING + NODE_WIDTH;

    if (prevNodeId) {
      edges.push(
        generateReactFlowEdge(generateId('edge'), prevNodeId, transformerNodeId)
      );
    }
    prevNodeId = transformerNodeId;
  });
  return {
    nodes,
    edges,
  };
}

// Given the set of localized flows per sub-configuration, generate the global search-level edges.
// This takes the assumption the flow is linear, and all sub-configuration flows are fully connected.
function getSearchEdges(
  searchRequestNode: ReactFlowComponent,
  enrichRequestFlow: WorkspaceFlowState,
  indexNode: ReactFlowComponent,
  enrichResponseFlow: WorkspaceFlowState,
  searchResponseNode: ReactFlowComponent
): ReactFlowEdge[] {
  const startAndEndNodesEnrichRequest = getStartAndEndNodes(enrichRequestFlow);
  const startAndEndNodesEnrichResponse = getStartAndEndNodes(
    enrichResponseFlow
  );
  const edges = [] as ReactFlowEdge[];

  // Users may omit search request processors altogether. Need to handle cases separately.
  if (startAndEndNodesEnrichRequest !== undefined) {
    const requestToEnrichRequestEdgeId = generateId('edge');
    const enrichRequestToIndexEdgeId = generateId('edge');
    edges.push(
      ...([
        generateReactFlowEdge(
          requestToEnrichRequestEdgeId,
          searchRequestNode.id,
          startAndEndNodesEnrichRequest.startNode.id
        ),

        generateReactFlowEdge(
          enrichRequestToIndexEdgeId,
          startAndEndNodesEnrichRequest.endNode.id,
          indexNode.id
        ),
      ] as ReactFlowEdge[])
    );
  } else {
    const requestToIndexEdgeId = generateId('edge');
    edges.push(
      generateReactFlowEdge(
        requestToIndexEdgeId,
        searchRequestNode.id,
        indexNode.id
      )
    );
  }

  // Users may omit search response processors altogether. Need to handle cases separately.
  if (startAndEndNodesEnrichResponse !== undefined) {
    const indexToEnrichResponseEdgeId = generateId('edge');
    const enrichResponseToSearchResponseEdgeId = generateId('edge');

    edges.push(
      ...([
        generateReactFlowEdge(
          indexToEnrichResponseEdgeId,
          indexNode.id,
          startAndEndNodesEnrichResponse.startNode.id
        ),
        generateReactFlowEdge(
          enrichResponseToSearchResponseEdgeId,
          startAndEndNodesEnrichResponse.endNode.id,
          searchResponseNode.id
        ),
      ] as ReactFlowEdge[])
    );
  } else {
    const indexToSearchResponseEdgeId = generateId('edge');
    edges.push(
      generateReactFlowEdge(
        indexToSearchResponseEdgeId,
        indexNode.id,
        searchResponseNode.id
      )
    );
  }

  return edges;
}

// Get start and end nodes in a flow. This assumes the flow is linear and fully connected,
// such that there will always be a single start and single end node.
function getStartAndEndNodes(
  workspaceFlow: WorkspaceFlowState
):
  | {
      startNode: ReactFlowComponent;
      endNode: ReactFlowComponent;
    }
  | undefined {
  if (workspaceFlow.nodes.length === 0) {
    return undefined;
  }
  if (workspaceFlow.nodes.length === 1) {
    return {
      startNode: workspaceFlow.nodes[0],
      endNode: workspaceFlow.nodes[0],
    };
  }

  const nodeIdsWithTarget = workspaceFlow.edges.map((edge) => edge.target);
  const nodeIdsWithSource = workspaceFlow.edges.map((edge) => edge.source);

  return {
    startNode: workspaceFlow.nodes.filter(
      (node) => !nodeIdsWithTarget.includes(node.id)
    )[0],
    endNode: workspaceFlow.nodes.filter(
      (node) => !nodeIdsWithSource.includes(node.id)
    )[0],
  };
}

function addDefaults(component: ReactFlowComponent): ReactFlowComponent {
  return {
    ...component,
    draggable: false,
    selectable: false,
    deletable: false,
  };
}

function generateReactFlowEdge(
  id: string,
  source: string,
  target: string
): ReactFlowEdge {
  return {
    id,
    key: id,
    source,
    target,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
    zIndex: 2,
    deletable: false,
  } as ReactFlowEdge;
}
// Adding any instance metadata. Converting the base IComponent obj into
// an instance-specific IComponentData obj.
function initComponentData(
  data: IComponent,
  componentId: string
): IComponentData {
  return {
    ...data,
    id: componentId,
  } as IComponentData;
}
