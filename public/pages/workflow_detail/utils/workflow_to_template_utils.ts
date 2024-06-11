/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TemplateFlows,
  TemplateNode,
  CreateIngestPipelineNode,
  CreateIndexNode,
  TemplateFlow,
  TemplateEdge,
  ModelFormValue,
  IndexMappings,
  WORKFLOW_STEP_TYPE,
  WorkflowConfig,
  PROCESSOR_TYPE,
  IndexConfig,
  IProcessorConfig,
  MLInferenceProcessor,
  MapFormValue,
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
  // a single ml-related processor. In the future make this more flexible and generic.
  const mlProcessorConfig = config.ingest.enrich.processors.find(
    (processorConfig) => processorConfig.type === PROCESSOR_TYPE.ML
  ) as IProcessorConfig;

  nodes.push(...mlProcessorConfigToTemplateNodes(mlProcessorConfig));
  nodes.push(
    indexConfigToTemplateNode(
      config.ingest.index,
      nodes.find(
        (node) =>
          node.type === WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE
      ) as CreateIngestPipelineNode
    )
  );

  return {
    nodes,
    edges,
  };
}

// General fn to process all ML processor configs. Convert into a final ingest pipeline.
// Optionally prepend a register pretrained model step if the selected model
// is a pretrained and currently undeployed one.
function mlProcessorConfigToTemplateNodes(
  mlProcessorConfig: IProcessorConfig
): TemplateNode[] {
  // TODO improvements to make here:
  // 1. Consideration of multiple ingest processors and how to collect them all, and finally create
  //    a single ingest pipeline with all of them, in the same order as done on the UI
  switch (mlProcessorConfig.type) {
    case PROCESSOR_TYPE.ML:
    default: {
      const { model, inputMap, outputMap } = processorConfigToFormik(
        mlProcessorConfig
      ) as {
        model: ModelFormValue;
        inputMap: MapFormValue;
        outputMap: MapFormValue;
      };
      const ingestPipelineName = generateId('ingest_pipeline');

      const finalProcessor = {
        ml_inference: {
          model_id: model.id,
          input_map: inputMap.map((mapEntry) => ({
            [mapEntry.key]: mapEntry.value,
          })),
          output_map: outputMap.map((mapEntry) => ({
            [mapEntry.key]: mapEntry.value,
          })),
        },
      } as MLInferenceProcessor;

      const finalIngestPipelineDescription =
        'An ingest pipeline with an ML inference processor.';

      const createIngestPipelineStep = {
        id: ingestPipelineName,
        type: WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE,
        user_inputs: {
          pipeline_id: ingestPipelineName,
          model_id: model.id,
          configurations: {
            description: finalIngestPipelineDescription,
            processors: [finalProcessor],
          },
        },
      } as CreateIngestPipelineNode;

      return [createIngestPipelineStep];
    }
  }
}

// General fn to convert an index config to a final CreateIndexNode template node.
// Requires any ingest/pipeline node details to set any defaults
function indexConfigToTemplateNode(
  indexConfig: IndexConfig,
  ingestPipelineNode: CreateIngestPipelineNode
): CreateIndexNode {
  const indexName = indexConfig.name.value as string;

  // TODO: extract model details to determine the mappings

  // index mappings are different per use case
  const finalIndexMappings = {
    properties: {},
  } as IndexMappings;

  return {
    id: 'create_index',
    type: WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE,
    previous_node_inputs: {
      [ingestPipelineNode.id]: 'pipeline_id',
    },
    user_inputs: {
      index_name: indexName,
      configurations: {
        settings: {
          default_pipeline: `\${{${ingestPipelineNode.id}.pipeline_id}}`,
        },
        mappings: finalIndexMappings,
      },
    },
  };
}
