/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TemplateFlows,
  TemplateNode,
  CreateIngestPipelineNode,
  TextEmbeddingProcessor,
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
  WORKFLOW_STEP_TYPE,
  WorkflowConfig,
  PROCESSOR_TYPE,
  IModelProcessorConfig,
  MODEL_TYPE,
  IndexConfig,
} from '../../../../common';
import { generateId, processorConfigToFormik } from '../../../utils';

/**
 * Given a WorkflowConfig with fully populated input values,
 * generate a backend-compatible set of sub-workflows.
 */

export function configToTemplateFlows(config: WorkflowConfig): TemplateFlows {
  const provisionFlow = configToProvisionTemplateFlow(config);

  return {
    provision: provisionFlow,
  };
}

function configToProvisionTemplateFlow(config: WorkflowConfig): TemplateFlow {
  const nodes = [] as TemplateNode[];
  const edges = [] as TemplateEdge[];

  // TODO: few assumptions are made here, such as there will always be
  // a single model-related processor. In the future make this more flexible and generic.
  const modelProcessorConfig = config.ingest.enrich.processors.find(
    (processorConfig) => processorConfig.type === PROCESSOR_TYPE.MODEL
  ) as IModelProcessorConfig;

  nodes.push(...modelProcessorConfigToTemplateNodes(modelProcessorConfig));
  nodes.push(
    indexConfigToTemplateNode(modelProcessorConfig, config.ingest.index)
  );

  return {
    nodes,
    edges,
  };
}

// General fn to process all ML processor configs. Convert into a final ingest pipeline.
// Optionally prepend a register pretrained model step if the selected model
// is a pretrained and currently undeployed one.
function modelProcessorConfigToTemplateNodes(
  modelProcessorConfig: IModelProcessorConfig
): TemplateNode[] {
  // TODO improvements to make here:
  // 1. Consideration of multiple ingest processors and how to collect them all, and finally create
  //    a single ingest pipeline with all of them, in the same order as done on the UI
  switch (modelProcessorConfig.modelType) {
    case MODEL_TYPE.TEXT_EMBEDDING:
    case MODEL_TYPE.SPARSE_ENCODER:
    default: {
      const { model, inputField, vectorField } = processorConfigToFormik(
        modelProcessorConfig
      ) as {
        model: ModelFormValue;
        inputField: string;
        vectorField: string;
      };
      const modelId = model.id;
      const ingestPipelineName = generateId('ingest_pipeline');

      // register model workflow step type is different per use case
      const registerModelStepType =
        modelProcessorConfig.modelType === MODEL_TYPE.TEXT_EMBEDDING
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
        modelProcessorConfig.modelType === MODEL_TYPE.TEXT_EMBEDDING
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
        modelProcessorConfig.modelType === MODEL_TYPE.TEXT_EMBEDDING
          ? 'An ingest pipeline with a text embedding processor'
          : 'An ingest pieline with a neural sparse encoding processor';

      const createIngestPipelineStep = {
        id: modelProcessorConfig.id,
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

// General fn to convert an index config to a final CreateIndexNode template node.
// Requires the processor configs
function indexConfigToTemplateNode(
  modelProcessorConfig: IModelProcessorConfig,
  indexConfig: IndexConfig
): CreateIndexNode {
  const indexName = indexConfig.name.value as string;
  const { inputField, vectorField } = processorConfigToFormik(
    modelProcessorConfig
  ) as {
    inputField: string;
    vectorField: string;
  };

  // index mappings are different per use case
  const finalIndexMappings = {
    properties:
      modelProcessorConfig.modelType === MODEL_TYPE.TEXT_EMBEDDING
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
    id: 'create_index',
    type: WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE,
    previous_node_inputs: {
      [modelProcessorConfig.id]: 'pipeline_id',
    },
    user_inputs: {
      index_name: indexName,
      configurations: {
        settings: {
          default_pipeline: `\${{${modelProcessorConfig.id}.pipeline_id}}`,
        },
        mappings: finalIndexMappings,
      },
    },
  };
}
