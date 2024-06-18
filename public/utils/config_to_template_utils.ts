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
  IngestProcessor,
  Workflow,
  WorkflowTemplate,
} from '../../common';
import { processorConfigToFormik } from './config_to_form_utils';
import { generateId } from './utils';

/*
 **************** Config -> template utils **********************
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

  nodes.push(
    ...processorConfigsToTemplateNodes(config.ingest.enrich.processors)
  );
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

// General fn to process all processor configs. Generate a final
// ingest pipeline containing all of the processors, maintaining order
function processorConfigsToTemplateNodes(
  processorConfigs: IProcessorConfig[]
): TemplateNode[] {
  const processorsList = [] as IngestProcessor[];

  processorConfigs.forEach((processorConfig) => {
    // TODO: support more processor types
    switch (processorConfig.type) {
      case PROCESSOR_TYPE.ML:
      default: {
        const { model, inputMap, outputMap } = processorConfigToFormik(
          processorConfig
        ) as {
          model: ModelFormValue;
          inputMap: MapFormValue;
          outputMap: MapFormValue;
        };

        let processor = {
          ml_inference: {
            model_id: model.id,
          },
        } as MLInferenceProcessor;
        if (inputMap?.length > 0) {
          processor.ml_inference.input_map = inputMap.map((mapEntry) => ({
            [mapEntry.key]: mapEntry.value,
          }));
        }
        if (outputMap?.length > 0) {
          processor.ml_inference.output_map = outputMap.map((mapEntry) => ({
            [mapEntry.key]: mapEntry.value,
          }));
        }

        processorsList.push(processor);
      }
    }
  });

  const ingestPipelineName = generateId('ingest_pipeline');
  return [
    {
      id: ingestPipelineName,
      type: WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE,
      user_inputs: {
        pipeline_id: ingestPipelineName,
        configurations: {
          description: 'An ingest pipeline',
          processors: processorsList,
        },
      },
    } as CreateIngestPipelineNode,
  ];
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

// Helper fn to remove state-related fields from a workflow and have a stateless template
// to export and/or pass around, use when updating, etc.
export function reduceToTemplate(workflow: Workflow): WorkflowTemplate {
  const {
    id,
    lastUpdated,
    lastLaunched,
    state,
    resourcesCreated,
    ...workflowTemplate
  } = workflow;
  return workflowTemplate;
}
