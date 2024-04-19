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
  CREATE_INGEST_PIPELINE_STEP_TYPE,
  CREATE_INDEX_STEP_TYPE,
  CreateIngestPipelineNode,
  TextEmbeddingProcessor,
  componentDataToFormik,
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
  REGISTER_LOCAL_PRETRAINED_MODEL_STEP_TYPE,
  generateId,
  NEURAL_SPARSE_TRANSFORMER,
  NEURAL_SPARSE_DOC_TRANSFORMER,
  NEURAL_SPARSE_TOKENIZER_TRANSFORMER,
  REGISTER_LOCAL_SPARSE_ENCODING_MODEL_STEP_TYPE,
  SparseEncodingProcessor,
} from '../../../../common';

/**
 * Given a ReactFlow workspace flow with fully populated input values,
 * generate a backend-compatible set of sub-workflows.
 *
 */
export function toTemplateFlows(
  workspaceFlow: WorkspaceFlowState
): TemplateFlows {
  const { ingestNodes, ingestEdges } = getIngestNodesAndEdges(
    workspaceFlow.nodes,
    workspaceFlow.edges
  );
  const provisionFlow = toProvisionTemplateFlow(ingestNodes, ingestEdges);

  // TODO: support beyond provision
  return {
    provision: provisionFlow,
  };
}

export function getIngestNodesAndEdges(
  allNodes: ReactFlowComponent[],
  allEdges: ReactFlowEdge[]
): { ingestNodes: ReactFlowComponent[]; ingestEdges: ReactFlowEdge[] } {
  const ingestParentId = allNodes.find(
    (node) => node.type === NODE_CATEGORY.INGEST_GROUP
  )?.id as string;
  const ingestNodes = allNodes.filter(
    (node) => node.parentNode === ingestParentId
  );
  const ingestIds = ingestNodes.map((node) => node.id);
  const ingestEdges = allEdges.filter(
    (edge) => ingestIds.includes(edge.source) || ingestIds.includes(edge.target)
  );
  return {
    ingestNodes,
    ingestEdges,
  };
}

// Generates the end-to-end provision subflow, if applicable
function toProvisionTemplateFlow(
  nodes: ReactFlowComponent[],
  edges: ReactFlowEdge[]
): TemplateFlow {
  const prevNodes = [] as ReactFlowComponent[];
  const finalTemplateNodes = [] as TemplateNode[];
  const templateEdges = [] as TemplateEdge[];
  nodes.forEach((node) => {
    const templateNodes = toTemplateNodes(node, prevNodes, edges);
    // it may be undefined if the node is not convertible for some reason
    if (templateNodes) {
      finalTemplateNodes.push(...templateNodes);
      prevNodes.push(node);
    }
  });

  edges.forEach((edge) => {
    // it may be undefined if the edge is not convertible
    // (e.g., connecting to some meta/other UI component, like "document" or "query")
    const templateEdge = toTemplateEdge(edge);
    if (templateEdge) {
      templateEdges.push(templateEdge);
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

        // workflow step type is different per use case
        const stepType =
          flowNode.data.type === COMPONENT_CLASS.TEXT_EMBEDDING_TRANSFORMER
            ? REGISTER_LOCAL_PRETRAINED_MODEL_STEP_TYPE
            : REGISTER_LOCAL_SPARSE_ENCODING_MODEL_STEP_TYPE;

        registerModelStep = {
          id: stepType,
          type: stepType,
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
          ? `\${{${REGISTER_LOCAL_PRETRAINED_MODEL_STEP_TYPE}.model_id}}`
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
        type: CREATE_INGEST_PIPELINE_STEP_TYPE,
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
      const directlyConnectedNodeId = getDirectlyConnectedNodes(
        flowNode,
        edges
      )[0];
      const { inputField, vectorField } = getDirectlyConnectedNodeInputs(
        flowNode,
        prevNodes,
        edges
      );

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
              default_pipeline: `\${{${directlyConnectedNodeId}.pipeline_id}}`,
            },
            mappings: {
              properties: {
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
              },
            },
          },
        },
      };
    }
  }
}

// Fetch all directly connected predecessor node inputs
function getDirectlyConnectedNodeInputs(
  node: ReactFlowComponent,
  prevNodes: ReactFlowComponent[],
  edges: ReactFlowEdge[]
): FormikValues {
  const directlyConnectedNodeIds = getDirectlyConnectedNodes(node, edges);
  const directlyConnectedNodes = prevNodes.filter((prevNode) =>
    directlyConnectedNodeIds.includes(prevNode.id)
  );
  let values = {} as FormikValues;
  directlyConnectedNodes.forEach((node) => {
    values = {
      ...values,
      ...componentDataToFormik(node.data),
    };
  });
  return values;
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

function isValidTemplateEdge(flowEdge: ReactFlowEdge): boolean {
  // TODO: may need to expand to handle multiple classes in the future (e.g., some 'query' component)
  const invalidClass = COMPONENT_CLASS.DOCUMENT;
  return (
    !flowEdge.sourceClasses?.includes(invalidClass) &&
    !flowEdge.targetClasses?.includes(invalidClass)
  );
}
