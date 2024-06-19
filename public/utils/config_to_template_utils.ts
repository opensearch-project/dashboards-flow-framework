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
  CreateSearchPipelineNode,
  SearchProcessor,
  IngestConfig,
  SearchConfig,
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
    ...ingestConfigToTemplateNodes(config.ingest),
    ...searchConfigToTemplateNodes(config.search)
  );

  const createIngestPipelineNode = nodes.find(
    (node) => node.type === WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE
  ) as CreateIngestPipelineNode;
  const createSearchPipelineNode = nodes.find(
    (node) => node.type === WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE
  ) as CreateSearchPipelineNode;

  nodes.push(
    indexConfigToTemplateNode(
      config.ingest.index,
      createIngestPipelineNode,
      createSearchPipelineNode
    )
  );

  return {
    nodes,
    edges,
  };
}

function ingestConfigToTemplateNodes(
  ingestConfig: IngestConfig
): TemplateNode[] {
  const ingestPipelineName = generateId('ingest_pipeline');
  const ingestProcessors = processorConfigsToTemplateProcessors(
    ingestConfig.enrich.processors
  );
  const hasProcessors = ingestProcessors.length > 0;

  return hasProcessors
    ? [
        {
          id: ingestPipelineName,
          type: WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE,
          user_inputs: {
            pipeline_id: ingestPipelineName,
            configurations: {
              description: 'An ingest pipeline',
              processors: ingestProcessors,
            },
          },
        } as CreateIngestPipelineNode,
      ]
    : [];
}

function searchConfigToTemplateNodes(
  searchConfig: SearchConfig
): TemplateNode[] {
  const searchPipelineName = generateId('search_pipeline');
  const searchRequestProcessors = processorConfigsToTemplateProcessors(
    searchConfig.enrichRequest.processors
  );
  const searchResponseProcessors = processorConfigsToTemplateProcessors(
    searchConfig.enrichResponse.processors
  );
  const hasProcessors =
    searchRequestProcessors.length > 0 || searchResponseProcessors.length > 0;

  return hasProcessors
    ? [
        {
          id: searchPipelineName,
          type: WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE,
          user_inputs: {
            pipeline_id: searchPipelineName,
            configurations: {
              request_processors: searchRequestProcessors,
              response_processors: searchResponseProcessors,
            },
          },
        } as CreateSearchPipelineNode,
      ]
    : [];
}

// General fn to process all processor configs and convert them
// into a final list of template-formatted IngestProcessor/SearchProcessors.
function processorConfigsToTemplateProcessors(
  processorConfigs: IProcessorConfig[]
): (IngestProcessor | SearchProcessor)[] {
  const processorsList = [] as (IngestProcessor | SearchProcessor)[];

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

  return processorsList;
}

// General fn to convert an index config to a final CreateIndexNode template node.
// Requires any ingest/pipeline node details to set any defaults, if applicable.
function indexConfigToTemplateNode(
  indexConfig: IndexConfig,
  ingestPipelineNode?: CreateIngestPipelineNode,
  searchPipelineNode?: CreateSearchPipelineNode
): CreateIndexNode {
  let finalSettings = indexConfig.settings.value as {};
  let finalPreviousNodeInputs = {};

  function updateFinalInputsAndSettings(
    createPipelineNode:
      | CreateIngestPipelineNode
      | CreateSearchPipelineNode
      | undefined
  ): void {
    if (createPipelineNode) {
      finalPreviousNodeInputs = {
        ...finalPreviousNodeInputs,
        [createPipelineNode.id]: 'pipeline_id',
      };

      // Search and ingest pipelines expect different keys for setting index defaults
      const pipelineKey =
        createPipelineNode.type ===
        WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE
          ? 'default_pipeline'
          : 'index.search.default_pipeline';

      finalSettings = {
        ...finalSettings,
        [pipelineKey]: `\${{${createPipelineNode.id}.pipeline_id}}`,
      };
    }
  }
  updateFinalInputsAndSettings(ingestPipelineNode);
  updateFinalInputsAndSettings(searchPipelineNode);

  return {
    id: 'create_index',
    type: WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE,
    previous_node_inputs: finalPreviousNodeInputs,
    user_inputs: {
      index_name: indexConfig.name.value as string,
      configurations: {
        settings: finalSettings,
        mappings: indexConfig.mappings.value as IndexMappings,
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
