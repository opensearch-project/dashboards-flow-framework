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
  WORKFLOW_STEP_TYPE,
  WorkflowConfig,
  PROCESSOR_TYPE,
  IndexConfig,
  IProcessorConfig,
  MLInferenceProcessor,
  MapArrayFormValue,
  IngestProcessor,
  Workflow,
  WorkflowTemplate,
  CreateSearchPipelineNode,
  SearchProcessor,
  IngestConfig,
  SearchConfig,
  MapFormValue,
  MapEntry,
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

  if (config.ingest.enabled) {
    nodes.push(
      indexConfigToTemplateNode(
        config.ingest.index,
        createIngestPipelineNode,
        createSearchPipelineNode
      )
    );
  }

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

  return hasProcessors && ingestConfig.enabled
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
// TODO: improve the type safety of the returned form values. Have defined interfaces
// for each processor type, including the handling of any configured optional fields
export function processorConfigsToTemplateProcessors(
  processorConfigs: IProcessorConfig[]
): (IngestProcessor | SearchProcessor)[] {
  const processorsList = [] as (IngestProcessor | SearchProcessor)[];

  processorConfigs.forEach((processorConfig) => {
    switch (processorConfig.type) {
      case PROCESSOR_TYPE.ML: {
        const { model, inputMap, outputMap } = processorConfigToFormik(
          processorConfig
        ) as {
          model: ModelFormValue;
          inputMap: MapArrayFormValue;
          outputMap: MapArrayFormValue;
        };

        let processor = {
          ml_inference: {
            model_id: model.id,
          },
        } as MLInferenceProcessor;
        if (inputMap?.length > 0) {
          processor.ml_inference.input_map = inputMap.map((mapFormValue) =>
            mergeMapIntoSingleObj(mapFormValue)
          );
        }

        if (outputMap?.length > 0) {
          processor.ml_inference.output_map = outputMap.map((mapFormValue) =>
            mergeMapIntoSingleObj(mapFormValue)
          );
        }
        processorsList.push(processor);
        break;
      }
      case PROCESSOR_TYPE.SPLIT: {
        const { field, separator } = processorConfigToFormik(
          processorConfig
        ) as { field: string; separator: string };
        processorsList.push({
          split: {
            field,
            separator,
          },
        });
        break;
      }
      case PROCESSOR_TYPE.SORT: {
        const { field, order } = processorConfigToFormik(processorConfig) as {
          field: string;
          order: string;
        };
        processorsList.push({
          sort: {
            field,
            order,
          },
        });
        break;
      }
      default: {
        break;
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
  let finalSettings = {};
  let finalMappings = {};
  try {
    // @ts-ignore
    finalSettings = JSON.parse(indexConfig.settings?.value);
  } catch (e) {}
  try {
    // @ts-ignore
    finalMappings = JSON.parse(indexConfig.mappings?.value);
  } catch (e) {}

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
        mappings: finalMappings,
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
    error,
    resourcesCreated,
    ...workflowTemplate
  } = workflow;
  return workflowTemplate;
}

// Helper fn to merge the form map (an arr of objs) into a single obj, such that each key
// is an obj property, and each value is a property value. Used to format into the
// expected inputs for input_maps and output_maps of the ML inference processors.
function mergeMapIntoSingleObj(mapFormValue: MapFormValue): {} {
  let curMap = {} as MapEntry;
  mapFormValue.forEach((mapEntry) => {
    curMap = {
      ...curMap,
      [mapEntry.key]: mapEntry.value,
    };
  });
  return curMap;
}
