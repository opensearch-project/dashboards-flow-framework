/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  WorkspaceFlowState,
  ReactFlowComponent,
  TemplateFlows,
  NODE_CATEGORY,
  TemplateNode,
  COMPONENT_CLASS,
  CREATE_INGEST_PIPELINE_STEP_TYPE,
  CREATE_INDEX_STEP_TYPE,
  CreateIngestPipelineNode,
  TextEmbeddingProcessor,
  componentDataToFormik,
  ReactFlowEdge,
  CreateIndexNode,
} from '../../../../common';

// TODO: improve to make more generic
/**
 * Given a ReactFlow workspace flow with fully populated input values,
 * generate a backend-compatible set of sub-workflows.
 *
 */
export function toTemplateFlows(
  workspaceFlow: WorkspaceFlowState
): TemplateFlows {
  const curNodes = workspaceFlow.nodes;
  const prevNodes = [] as ReactFlowComponent[];
  const templateNodes = [] as TemplateNode[];
  curNodes.forEach((node) => {
    const templateNode = toTemplateNode(node, prevNodes, workspaceFlow.edges);
    if (templateNode) {
      templateNodes.push(templateNode);
      prevNodes.push(node);
    }
  });

  console.log('final template nodes: ', templateNodes);
  return {
    provision: {
      nodes: templateNodes,
    },
  };
}

function toTemplateNode(
  flowNode: ReactFlowComponent,
  prevNodes: ReactFlowComponent[],
  edges: ReactFlowEdge[]
): TemplateNode | undefined {
  if (flowNode.type === NODE_CATEGORY.CUSTOM) {
    if (flowNode.data.baseClasses?.includes(COMPONENT_CLASS.ML_TRANSFORMER)) {
      return toIngestPipelineNode(flowNode);
    } else if (flowNode.data.baseClasses?.includes(COMPONENT_CLASS.INDEXER)) {
      return toIndexerNode(flowNode, prevNodes, edges);
    }
  } else {
    return undefined;
  }
}

// General fn to process all ML transform nodes. Convert into a final
// ingest pipeline with a processor specific to the final class of the node.
function toIngestPipelineNode(
  flowNode: ReactFlowComponent
): CreateIngestPipelineNode {
  // TODO a few improvements to make here:
  // 1. Consideration of multiple ingest processors and how to collect them all, and finally create
  //    a single ingest pipeline with all of them, in the same order as done on the UI
  // 2. Support more than just text embedding transformers
  switch (flowNode.data.type) {
    case COMPONENT_CLASS.TEXT_EMBEDDING_TRANSFORMER:
    default: {
      const { modelId, inputField, vectorField } = componentDataToFormik(
        flowNode.data
      ) as { modelId: string; inputField: string; vectorField: string };

      return {
        id: flowNode.data.id,
        type: CREATE_INGEST_PIPELINE_STEP_TYPE,
        user_inputs: {
          // TODO: expose as customizable
          pipeline_id: 'test-pipeline',
          model_id: modelId,
          input_field: inputField,
          output_field: vectorField,
          configurations: {
            description: 'An ingest pipeline with a text embedding processor.',
            processors: [
              {
                text_embedding: {
                  model_id: modelId,
                  field_map: {
                    [inputField]: vectorField,
                  },
                },
              } as TextEmbeddingProcessor,
            ],
          },
        },
      };
    }
  }
}

// General fn to process all indexer nodes. Convert into a final
// ingest pipeline with a processor specific to the final class of the node.
function toIndexerNode(
  flowNode: ReactFlowComponent,
  prevNodes: ReactFlowComponent[],
  edges: ReactFlowEdge[]
): CreateIndexNode {
  switch (flowNode.data.type) {
    case COMPONENT_CLASS.KNN_INDEXER:
    default: {
      const { indexName } = componentDataToFormik(flowNode.data) as {
        indexName: string;
      };
      // TODO: remove hardcoded logic here that is assuming each indexer node has
      // exactly 1 directly connected predecessor node
      const directlyConnectedNodeId = getDirectlyConnectedNodes(
        flowNode,
        edges
      )[0];
      const directlyConnectedNode = prevNodes.find(
        (prevNode) => prevNode.id === directlyConnectedNodeId
      ) as ReactFlowComponent;
      const { inputField, vectorField } = componentDataToFormik(
        directlyConnectedNode.data
      ) as { inputField: string; vectorField: string };

      return {
        id: flowNode.data.id,
        type: CREATE_INDEX_STEP_TYPE,
        previous_node_inputs: {
          [directlyConnectedNodeId]: 'pipeline_id',
        },
        user_inputs: {
          index_name: indexName,
          configurations: {
            settings: {
              default_pipeline: '${{create_ingest_pipeline.pipeline_id}}',
            },
            mappings: {
              properties: {
                [vectorField]: {
                  type: 'knn_vector',
                  dimension: 768,
                  method: {
                    engine: 'lucene',
                    space_type: 'l2',
                    name: 'hnsw',
                    parameters: {},
                  },
                },
                [inputField]: {
                  type: 'text',
                },
              },
            },
          },
        },
      };
    }
  }
}

// Simple utility fn to fetch all direct predecessor node IDs for a given node
function getDirectlyConnectedNodes(
  flowNode: ReactFlowComponent,
  edges: ReactFlowEdge[]
): string[] {
  const incomingNodes = [] as string[];
  edges.forEach((edge) => {
    if (edge.target === flowNode.id) {
      incomingNodes.push(edge.source);
    }
  });
  return incomingNodes;
}
