/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormikValues } from 'formik';
import {
  WorkspaceFlowState,
  ReactFlowComponent,
  TemplateFlows,
  NODE_CATEGORY,
  TemplateNode,
  COMPONENT_CLASS,
  CreateIngestPipelineNode,
  TextEmbeddingProcessor,
  ReactFlowEdge,
  CreateIndexNode,
  TemplateFlow,
  TemplateEdge,
  ModelFormValue,
  MODEL_CATEGORY,
  RegisterPretrainedModelNode,
  PretrainedSentenceTransformer,
  ROBERTA_SENTENCE_TRANSFORMER,
  MPNET_SENTENCE_TRANSFORMER,
  BERT_SENTENCE_TRANSFORMER,
  NEURAL_SPARSE_TRANSFORMER,
  NEURAL_SPARSE_DOC_TRANSFORMER,
  NEURAL_SPARSE_TOKENIZER_TRANSFORMER,
  SparseEncodingProcessor,
  IndexMappings,
  CreateSearchPipelineNode,
  WORKFLOW_STEP_TYPE,
} from '../../../../common';
import { componentDataToFormik, generateId } from '../../../utils';

/**
 * Given a ReactFlow workspace flow with fully populated input values,
 * generate a backend-compatible set of sub-workflows.
 *
 */
export function toTemplateFlows(
  workspaceFlow: WorkspaceFlowState
): TemplateFlows {
  const provisionFlow = toProvisionTemplateFlow(workspaceFlow);

  // TODO: support beyond provision
  return {
    provision: provisionFlow,
  };
}

export function getNodesAndEdgesUnderParent(
  parentGroup: NODE_CATEGORY,
  allNodes: ReactFlowComponent[],
  allEdges: ReactFlowEdge[]
): { nodes: ReactFlowComponent[]; edges: ReactFlowEdge[] } {
  const parentId = allNodes.find((node) => node.type === parentGroup)
    ?.id as string;
  const nodes = allNodes.filter((node) => node.parentNode === parentId);
  const nodeIds = nodes.map((node) => node.id);
  const edges = allEdges.filter(
    (edge) => nodeIds.includes(edge.source) || nodeIds.includes(edge.target)
  );
  return {
    nodes,
    edges,
  };
}

// Generates the end-to-end provision subflow, if applicable
function toProvisionTemplateFlow(
  workspaceFlow: WorkspaceFlowState
): TemplateFlow {
  const {
    nodes: ingestNodes,
    edges: ingestEdges,
  } = getNodesAndEdgesUnderParent(
    NODE_CATEGORY.INGEST_GROUP,
    workspaceFlow.nodes,
    workspaceFlow.edges
  );
  const {
    nodes: searchNodes,
    edges: searchEdges,
  } = getNodesAndEdgesUnderParent(
    NODE_CATEGORY.SEARCH_GROUP,
    workspaceFlow.nodes,
    workspaceFlow.edges
  );

  // INGEST: iterate through nodes/edges and generate the valid template nodes
  const prevNodes = [] as ReactFlowComponent[];
  const finalTemplateNodes = [] as TemplateNode[];
  const templateEdges = [] as TemplateEdge[];
  ingestNodes.forEach((node) => {
    const templateNodes = toTemplateNodes(node, prevNodes, ingestEdges);
    // it may be undefined if the node is not convertible for some reason
    if (templateNodes) {
      finalTemplateNodes.push(...templateNodes);
      prevNodes.push(node);
    }
  });

  ingestEdges.forEach((edge) => {
    // it may be undefined if the edge is not convertible
    // (e.g., connecting to some meta/other UI component, like "document" or "query")
    const templateEdge = toTemplateEdge(edge);
    if (templateEdge) {
      templateEdges.push(templateEdge);
    }
  });

  // SEARCH: iterate through nodes/edges and generate the valid template nodes
  // TODO: currently the scope is limited to only expecting a single search processor
  // node, and hence logic is hardcoded to return a single CreateSearchPipelineNode
  searchNodes.forEach((node) => {
    if (node.data.baseClasses?.includes(COMPONENT_CLASS.RESULTS_TRANSFORMER)) {
      const templateNode = resultsTransformerToTemplateNode(node);
      finalTemplateNodes.push(templateNode);
    }
  });

  return {
    nodes: finalTemplateNodes,
    edges: templateEdges,
  };
}

function toTemplateNodes(
  flowNode: ReactFlowComponent,
  prevNodes: ReactFlowComponent[],
  edges: ReactFlowEdge[]
): TemplateNode[] | undefined {
  if (flowNode.data.baseClasses?.includes(COMPONENT_CLASS.ML_TRANSFORMER)) {
    return transformerToTemplateNodes(flowNode);
  } else if (flowNode.data.baseClasses?.includes(COMPONENT_CLASS.INDEXER)) {
    return [indexerToTemplateNode(flowNode, prevNodes, edges)];
  }
}

function toTemplateEdge(flowEdge: ReactFlowEdge): TemplateEdge | undefined {
  return isValidTemplateEdge(flowEdge)
    ? {
        source: flowEdge.source,
        dest: flowEdge.target,
      }
    : undefined;
}

// General fn to process all ML transform nodes. Convert into a final
// ingest pipeline with a processor specific to the final class of the node.
// Optionally prepend a register pretrained model step if the selected model
// is a pretrained and undeployed one.
function transformerToTemplateNodes(
  flowNode: ReactFlowComponent
): TemplateNode[] {
  // TODO improvements to make here:
  // 1. Consideration of multiple ingest processors and how to collect them all, and finally create
  //    a single ingest pipeline with all of them, in the same order as done on the UI
  switch (flowNode.data.type) {
    case COMPONENT_CLASS.TEXT_EMBEDDING_TRANSFORMER:
    case COMPONENT_CLASS.SPARSE_ENCODER_TRANSFORMER:
    default: {
      const { model, inputField, vectorField } = componentDataToFormik(
        flowNode.data
      ) as {
        model: ModelFormValue;
        inputField: string;
        vectorField: string;
      };
      const modelId = model.id;
      const ingestPipelineName = generateId('ingest_pipeline');

      // register model workflow step type is different per use case
      const registerModelStepType =
        flowNode.data.type === COMPONENT_CLASS.TEXT_EMBEDDING_TRANSFORMER
          ? WORKFLOW_STEP_TYPE.REGISTER_LOCAL_PRETRAINED_MODEL_STEP_TYPE
          : WORKFLOW_STEP_TYPE.REGISTER_LOCAL_SPARSE_ENCODING_MODEL_STEP_TYPE;

      let registerModelStep = undefined as
        | RegisterPretrainedModelNode
        | undefined;
      if (model.category === MODEL_CATEGORY.PRETRAINED) {
        const pretrainedModel = [
          ROBERTA_SENTENCE_TRANSFORMER,
          MPNET_SENTENCE_TRANSFORMER,
          BERT_SENTENCE_TRANSFORMER,
          NEURAL_SPARSE_TRANSFORMER,
          NEURAL_SPARSE_DOC_TRANSFORMER,
          NEURAL_SPARSE_TOKENIZER_TRANSFORMER,
        ].find(
          // the model ID in the form will be the unique name of the pretrained model
          (model) => model.name === modelId
        ) as PretrainedSentenceTransformer;

        registerModelStep = {
          id: registerModelStepType,
          type: registerModelStepType,
          user_inputs: {
            name: pretrainedModel.name,
            description: pretrainedModel.description,
            model_format: pretrainedModel.format,
            version: pretrainedModel.version,
            deploy: true,
          },
        } as RegisterPretrainedModelNode;
      }

      // The model ID depends on if we are consuming it from a previous pretrained model step,
      // or directly from the user
      const finalModelId =
        registerModelStep !== undefined
          ? `\${{${registerModelStepType}.model_id}}`
          : modelId;

      // processor is different per use case
      const finalProcessor =
        flowNode.data.type === COMPONENT_CLASS.TEXT_EMBEDDING_TRANSFORMER
          ? ({
              text_embedding: {
                model_id: finalModelId,
                field_map: {
                  [inputField]: vectorField,
                },
              },
            } as TextEmbeddingProcessor)
          : ({
              sparse_encoding: {
                model_id: finalModelId,
                field_map: {
                  [inputField]: vectorField,
                },
              },
            } as SparseEncodingProcessor);

      // ingest pipeline is different per use case
      const finalIngestPipelineDescription =
        flowNode.data.type === COMPONENT_CLASS.TEXT_EMBEDDING_TRANSFORMER
          ? 'An ingest pipeline with a text embedding processor'
          : 'An ingest pieline with a neural sparse encoding processor';

      const createIngestPipelineStep = {
        id: flowNode.data.id,
        type: WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE,
        user_inputs: {
          pipeline_id: ingestPipelineName,
          model_id: finalModelId,
          input_field: inputField,
          output_field: vectorField,
          configurations: {
            description: finalIngestPipelineDescription,
            processors: [finalProcessor],
          },
        },
      } as CreateIngestPipelineNode;
      if (registerModelStep !== undefined) {
        createIngestPipelineStep.previous_node_inputs = {
          ...createIngestPipelineStep.previous_node_inputs,
          [registerModelStepType]: 'model_id',
        };
      }

      return registerModelStep !== undefined
        ? [registerModelStep, createIngestPipelineStep]
        : [createIngestPipelineStep];
    }
  }
}

// General fn to convert an indexer node to a final CreateIndexNode template node.
function indexerToTemplateNode(
  flowNode: ReactFlowComponent,
  prevNodes: ReactFlowComponent[],
  edges: ReactFlowEdge[]
): CreateIndexNode {
  switch (flowNode.data.type) {
    case COMPONENT_CLASS.KNN_INDEXER:
    default: {
      const { indexName } = componentDataToFormik(flowNode.data);
      // TODO: remove hardcoded logic here that is assuming each indexer node has
      // exactly 1 directly connected create_ingest_pipeline predecessor node that
      // contains an inputField and vectorField
      const directlyConnectedNode = getDirectlyConnectedNodes(
        flowNode,
        prevNodes,
        edges
      )[0];

      const { inputField, vectorField } = getNodeValues([
        directlyConnectedNode,
      ]);

      // index mappings are different per use case
      const finalIndexMappings = {
        properties:
          directlyConnectedNode.data.type ===
          COMPONENT_CLASS.TEXT_EMBEDDING_TRANSFORMER
            ? {
                [vectorField]: {
                  type: 'knn_vector',
                  // TODO: remove hardcoding, fetch from the selected model
                  // (existing or from pretrained configuration)
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
              }
            : {
                [vectorField]: {
                  type: 'rank_features',
                },
                [inputField]: {
                  type: 'text',
                },
              },
      } as IndexMappings;

      return {
        id: flowNode.data.id,
        type: WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE,
        previous_node_inputs: {
          [directlyConnectedNode.id]: 'pipeline_id',
        },
        user_inputs: {
          index_name: indexName,
          configurations: {
            settings: {
              default_pipeline: `\${{${directlyConnectedNode.id}.pipeline_id}}`,
            },
            mappings: finalIndexMappings,
          },
        },
      };
    }
  }
}

// General fn to process all result transformer nodes.
// TODO: currently hardcoding to return a static configuration of a normalization
// phase results processor. Should make dynamic & generic
function resultsTransformerToTemplateNode(
  flowNode: ReactFlowComponent
): CreateSearchPipelineNode {
  return {
    id: flowNode.data.id,
    type: WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE,
    user_inputs: {
      pipeline_id: generateId('search_pipeline'),
      configurations: {
        phase_results_processors: [
          {
            ['normalization-processor']: {
              normalization: {
                technique: 'min_max',
              },
              combination: {
                technique: 'arithmetic_mean',
                parameters: {
                  weights: `[0.3, 0.7]`,
                },
              },
            },
          },
        ],
      },
    },
  } as CreateSearchPipelineNode;
}

// Fetch all directly connected predecessor nodes
function getDirectlyConnectedNodes(
  node: ReactFlowComponent,
  prevNodes: ReactFlowComponent[],
  edges: ReactFlowEdge[]
): ReactFlowComponent[] {
  const directlyConnectedNodeIds = getDirectlyConnectedNodeIds(node, edges);
  return prevNodes.filter((prevNode) =>
    directlyConnectedNodeIds.includes(prevNode.id)
  );
}

// Get all values for an arr of flow nodes
function getNodeValues(nodes: ReactFlowComponent[]): FormikValues {
  let values = {} as FormikValues;
  nodes.forEach((node) => {
    values = {
      ...values,
      ...componentDataToFormik(node.data),
    };
  });
  return values;
}

// Fetch all direct predecessor node IDs for a given node
function getDirectlyConnectedNodeIds(
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

function isValidTemplateEdge(flowEdge: ReactFlowEdge): boolean {
  // TODO: may need to expand to handle multiple classes in the future (e.g., some 'query' component)
  const invalidClass = COMPONENT_CLASS.DOCUMENT;
  return (
    !flowEdge.sourceClasses?.includes(invalidClass) &&
    !flowEdge.targetClasses?.includes(invalidClass)
  );
}
