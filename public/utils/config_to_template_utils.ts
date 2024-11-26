/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormikValues } from 'formik';
import { isEmpty } from 'lodash';
import {
  TemplateFlows,
  TemplateNode,
  CreateIngestPipelineNode,
  CreateIndexNode,
  TemplateFlow,
  TemplateEdge,
  WORKFLOW_STEP_TYPE,
  WorkflowConfig,
  PROCESSOR_TYPE,
  IndexConfig,
  IProcessorConfig,
  MLInferenceProcessor,
  IngestProcessor,
  Workflow,
  WorkflowTemplate,
  CreateSearchPipelineNode,
  SearchProcessor,
  IngestConfig,
  SearchConfig,
  MapEntry,
  TEXT_CHUNKING_ALGORITHM,
  SHARED_OPTIONAL_FIELDS,
  FIXED_TOKEN_LENGTH_OPTIONAL_FIELDS,
  DELIMITER_OPTIONAL_FIELDS,
  IngestPipelineConfig,
  SearchPipelineConfig,
  InputMapFormValue,
  MapFormValue,
  TRANSFORM_TYPE,
  OutputMapFormValue,
} from '../../common';
import { processorConfigToFormik } from './config_to_form_utils';
import { sanitizeJSONPath } from './utils';

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

  if (config.ingest.enabled.value) {
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
    user_params: {},
  };
}

function ingestConfigToTemplateNodes(
  ingestConfig: IngestConfig
): TemplateNode[] {
  const ingestPipelineName = ingestConfig.pipelineName.value;
  const ingestEnabled = ingestConfig.enabled.value;
  const ingestProcessors = processorConfigsToTemplateProcessors(
    ingestConfig.enrich.processors
  );
  const hasProcessors = ingestProcessors.length > 0;

  return hasProcessors && ingestEnabled
    ? [
        {
          id: ingestPipelineName,
          type: WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE,
          previous_node_inputs: {},
          user_inputs: {
            pipeline_id: ingestPipelineName,
            configurations: JSON.stringify({
              description: 'An ingest pipeline',
              processors: ingestProcessors,
            } as IngestPipelineConfig),
          },
        } as CreateIngestPipelineNode,
      ]
    : [];
}

function searchConfigToTemplateNodes(
  searchConfig: SearchConfig
): TemplateNode[] {
  const searchPipelineName = searchConfig.pipelineName.value;
  const searchRequestProcessors = processorConfigsToTemplateProcessors(
    searchConfig.enrichRequest.processors
  );
  // For the configured response processors, we don't maintain separate UI / config
  // between response processors and phase results processors. So, we parse
  // out those different processor types here when configuring the final search pipeline.
  // Currently, the only special phase results processor supported is the normalization processor,
  // so we filter & partition on that type.
  const normalizationProcessor = searchConfig.enrichResponse.processors.find(
    (processor) => processor.type === PROCESSOR_TYPE.NORMALIZATION
  );
  const phaseResultsProcessors = processorConfigsToTemplateProcessors(
    normalizationProcessor ? [normalizationProcessor] : []
  );
  const searchResponseProcessors = processorConfigsToTemplateProcessors(
    searchConfig.enrichResponse.processors.filter(
      (processor) => processor.type !== PROCESSOR_TYPE.NORMALIZATION
    )
  );
  const hasProcessors =
    searchRequestProcessors.length > 0 ||
    searchResponseProcessors.length > 0 ||
    phaseResultsProcessors.length > 0;

  return hasProcessors
    ? [
        {
          id: searchPipelineName,
          type: WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE,
          previous_node_inputs: {},
          user_inputs: {
            pipeline_id: searchPipelineName,
            configurations: JSON.stringify({
              request_processors: searchRequestProcessors,
              response_processors: searchResponseProcessors,
              phase_results_processors: phaseResultsProcessors,
            } as SearchPipelineConfig),
          },
        } as CreateSearchPipelineNode,
      ]
    : [];
}

// General fn to process all processor configs and convert them
// into a final list of template-formatted IngestProcessor/SearchProcessors.
export function processorConfigsToTemplateProcessors(
  processorConfigs: IProcessorConfig[]
): (IngestProcessor | SearchProcessor)[] {
  const processorsList = [] as (IngestProcessor | SearchProcessor)[];

  processorConfigs.forEach((processorConfig) => {
    switch (processorConfig.type) {
      case PROCESSOR_TYPE.ML: {
        const {
          model,
          input_map,
          output_map,
          model_config,
          ...formValues
        } = processorConfigToFormik(processorConfig);

        let processor = {
          ml_inference: {
            model_id: model.id,
          },
        } as MLInferenceProcessor;

        // process model config.
        // TODO: this special handling, plus the special handling on index settings/mappings
        // could be improved if the 'json' obj returned {} during the conversion instead
        // of "{}". We may have future JSON fields which right now are going to require
        // this manual parsing before adding to the template.
        let modelConfig = {};
        try {
          // @ts-ignore
          modelConfig = JSON.parse(model_config);
        } catch (e) {}

        // process input/output maps.
        // if static values found in the input map, add to the model config
        if (input_map?.length > 0) {
          processor.ml_inference.input_map = input_map.map(
            (inputMapFormValue: InputMapFormValue) => {
              const res = processModelInputs(inputMapFormValue);
              if (!isEmpty(res.modelConfig)) {
                modelConfig = {
                  ...modelConfig,
                  ...res.modelConfig,
                };
              }
              return res.inputMap;
            }
          );
        }

        if (output_map?.length > 0) {
          processor.ml_inference.output_map = output_map.map(
            (outputMapFormValue: OutputMapFormValue) =>
              processModelOutputs(outputMapFormValue)
          );
        }

        // process optional fields
        let additionalFormValues = {} as FormikValues;
        Object.keys(formValues).forEach((formKey: string) => {
          const formValue = formValues[formKey];
          additionalFormValues = optionallyAddToFinalForm(
            additionalFormValues,
            formKey,
            formValue
          );
        });

        processor.ml_inference = {
          ...processor.ml_inference,
          ...additionalFormValues,
          model_config: modelConfig,
        };

        processorsList.push(processor);
        break;
      }
      // only include the optional field form values that are relevant
      // to the selected algorithm. always add any common/shared form values.
      case PROCESSOR_TYPE.TEXT_CHUNKING: {
        const formValues = processorConfigToFormik(processorConfig);
        let finalFormValues = {} as FormikValues;
        const algorithm = formValues['algorithm'] as TEXT_CHUNKING_ALGORITHM;
        Object.keys(formValues).forEach((formKey: string) => {
          const formValue = formValues[formKey];
          if (SHARED_OPTIONAL_FIELDS.includes(formKey)) {
            finalFormValues = optionallyAddToFinalForm(
              finalFormValues,
              formKey,
              formValue
            );
          } else {
            if (algorithm === TEXT_CHUNKING_ALGORITHM.FIXED_TOKEN_LENGTH) {
              if (FIXED_TOKEN_LENGTH_OPTIONAL_FIELDS.includes(formKey)) {
                finalFormValues = optionallyAddToFinalForm(
                  finalFormValues,
                  formKey,
                  formValue
                );
              }
            } else {
              if (DELIMITER_OPTIONAL_FIELDS.includes(formKey)) {
                finalFormValues = optionallyAddToFinalForm(
                  finalFormValues,
                  formKey,
                  formValue
                );
              }
            }
          }
        });
        // add the field map config obj
        finalFormValues = {
          ...finalFormValues,
          field_map: mergeMapIntoSingleObj(
            formValues['field_map'] as MapFormValue
          ),
        };
        processorsList.push({
          [processorConfig.type]: finalFormValues,
        });
        break;
      }
      // optionally add any parameters specified, in the expected nested format
      // for the normalization processor
      case PROCESSOR_TYPE.NORMALIZATION: {
        const {
          normalization_technique,
          combination_technique,
          weights,
        } = processorConfigToFormik(processorConfig);

        let finalConfig = {} as any;
        if (!isEmpty(normalization_technique)) {
          finalConfig = {
            ...finalConfig,
            normalization: {
              technique: normalization_technique,
            },
          };
        }
        if (!isEmpty(combination_technique)) {
          finalConfig = {
            ...finalConfig,
            combination: {
              ...(finalConfig?.combination || {}),
              technique: combination_technique,
            },
          };
        }
        if (!isEmpty(weights) && weights.split(',').length > 0) {
          finalConfig = {
            ...finalConfig,
            combination: {
              ...(finalConfig?.combination || {}),
              parameters: {
                weights: weights.split(',').map(Number),
              },
            },
          };
        }
        processorsList.push({
          [processorConfig.type]: finalConfig,
        });
        break;
      }
      // Since we only support the by_field type of the rerank processor,
      // we need to nest the form values within the parent "by_field" field.
      case PROCESSOR_TYPE.RERANK: {
        const formValues = processorConfigToFormik(processorConfig);
        let finalFormValues = {} as FormikValues;
        Object.keys(formValues).forEach((formKey: string) => {
          const formValue = formValues[formKey];
          finalFormValues = optionallyAddToFinalForm(
            finalFormValues,
            formKey,
            formValue
          );
        });
        finalFormValues = {
          by_field: finalFormValues,
        };
        processorsList.push({
          [processorConfig.type]: finalFormValues,
        });
        break;
      }
      case PROCESSOR_TYPE.SPLIT:
      case PROCESSOR_TYPE.SORT:
      case PROCESSOR_TYPE.COLLAPSE:
      default: {
        const formValues = processorConfigToFormik(processorConfig);
        let finalFormValues = {} as FormikValues;
        // iterate through the form values, ignoring any empty
        // field (empty fields can be possible if the field is optional)
        Object.keys(formValues).forEach((formKey: string) => {
          const formValue = formValues[formKey];
          finalFormValues = optionallyAddToFinalForm(
            finalFormValues,
            formKey,
            formValue
          );
        });
        processorsList.push({
          [processorConfig.type]: finalFormValues,
        });
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
    id: indexConfig.name.value as string,
    type: WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE,
    previous_node_inputs: finalPreviousNodeInputs,
    user_inputs: {
      index_name: indexConfig.name.value as string,
      configurations: JSON.stringify({
        settings: finalSettings,
        mappings: finalMappings,
      }),
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
// expected inputs for processor configurations
function mergeMapIntoSingleObj(
  mapFormValue: MapFormValue,
  reverse: boolean = false
): {} {
  let curMap = {} as MapEntry;
  mapFormValue.forEach((mapEntry) => {
    curMap = reverse
      ? {
          ...curMap,
          [sanitizeJSONPath(mapEntry.value)]: sanitizeJSONPath(mapEntry.key),
        }
      : {
          ...curMap,
          [sanitizeJSONPath(mapEntry.key)]: sanitizeJSONPath(mapEntry.value),
        };
  });
  return curMap;
}

// Bucket the model inputs configured on the UI as input map entries containing dynamic data,
// or model config entries containing static data.
function processModelInputs(
  mapFormValue: InputMapFormValue
): { inputMap: {}; modelConfig: {} } {
  let inputMap = {};
  let modelConfig = {};
  mapFormValue.forEach((mapEntry) => {
    // dynamic data
    if (
      mapEntry.value.transformType === TRANSFORM_TYPE.FIELD ||
      mapEntry.value.transformType === TRANSFORM_TYPE.EXPRESSION
    ) {
      inputMap = {
        ...inputMap,
        [sanitizeJSONPath(mapEntry.key)]: sanitizeJSONPath(
          mapEntry.value.value
        ),
      };
      // template with dynamic nested vars. Add the nested vars as input map entries,
      // and add the static template itself to the model config.
    } else if (
      mapEntry.value.transformType === TRANSFORM_TYPE.TEMPLATE &&
      !isEmpty(mapEntry.value.nestedVars)
    ) {
      mapEntry.value.nestedVars?.forEach((nestedVar) => {
        inputMap = {
          ...inputMap,
          [sanitizeJSONPath(nestedVar.name)]: sanitizeJSONPath(
            nestedVar.transform
          ),
        };
      });
      modelConfig = {
        ...modelConfig,
        [mapEntry.key]: mapEntry.value.value,
      };
      // static data
    } else {
      modelConfig = {
        ...modelConfig,
        [mapEntry.key]: mapEntry.value.value,
      };
    }
  });
  return {
    inputMap,
    modelConfig,
  };
}

// Parse out the model outputs and any sub-expressions into a single, final output map
function processModelOutputs(mapFormValue: OutputMapFormValue): {} {
  let outputMap = {};
  mapFormValue.forEach((mapEntry) => {
    // field transform: just a rename
    if (mapEntry.value.transformType === TRANSFORM_TYPE.FIELD) {
      outputMap = {
        ...outputMap,
        [sanitizeJSONPath(mapEntry.value.value)]: sanitizeJSONPath(
          mapEntry.key
        ),
      };
      // expression transform: can have multiple nested expressions, since a user may want to parse
      // out new sub-fields / sub-transforms based off of some model output field that contains nested
      // data. Add the nested expressions as standalone output map entries
    } else if (
      mapEntry.value.transformType === TRANSFORM_TYPE.EXPRESSION &&
      !isEmpty(mapEntry.value.nestedVars)
    ) {
      mapEntry.value.nestedVars?.forEach((nestedVar) => {
        outputMap = {
          ...outputMap,
          [sanitizeJSONPath(nestedVar.name)]: sanitizeJSONPath(
            nestedVar.transform
          ),
        };
      });
      // Placeholder logic for future transform types
    } else {
    }
  });
  return outputMap;
}

// utility fn used to build the final set of processor config fields, filtering
// by only adding if the field is valid
function optionallyAddToFinalForm(
  finalFormValues: FormikValues,
  formKey: string,
  formValue: any
): FormikValues {
  if (!isEmpty(formValue) || typeof formValue === 'boolean') {
    finalFormValues[formKey] =
      typeof formValue === 'boolean' ? formValue : formValue;
  }
  return finalFormValues;
}
