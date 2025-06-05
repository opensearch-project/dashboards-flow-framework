/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isEmpty } from 'lodash';
import {
  IProcessorConfig,
  IngestPipelineConfig,
  PROCESSOR_CONTEXT,
  PROCESSOR_TYPE,
  SearchPipelineConfig,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../common';
import { formikToUiConfig } from './form_to_config_utils';
import { processorConfigsToTemplateProcessors } from './config_to_template_utils';

/*
   **************** Form -> pipeline utils **********************
   Collection of utility fns for converting the current form state
   to partial/in-progress ingest and search pipelines to run
   and collect their current outputs. Primarily used for determining
   the input schema at a certain stage of a pipeline.
   */

export function formikToPartialPipeline(
  values: WorkflowFormValues,
  existingConfig: WorkflowConfig,
  curProcessorId: string,
  includeCurProcessor: boolean,
  context: PROCESSOR_CONTEXT
): IngestPipelineConfig | SearchPipelineConfig | undefined {
  if (values?.ingest && values?.search) {
    const uiConfig = formikToUiConfig(values, existingConfig);
    switch (context) {
      // Generating ingest pipeline: just fetch existing ingest processors and
      // check if there are preceding ones
      case PROCESSOR_CONTEXT.INGEST: {
        const precedingProcessors = getPrecedingProcessors(
          uiConfig.ingest.enrich.processors,
          curProcessorId,
          includeCurProcessor
        );
        return !isEmpty(precedingProcessors)
          ? ({
              processors: processorConfigsToTemplateProcessors(
                precedingProcessors,
                context
              ),
            } as IngestPipelineConfig)
          : undefined;
      }
      // Generating search pipeline (request): just fetch existing search request
      // processors and check if there are preceding ones
      case PROCESSOR_CONTEXT.SEARCH_REQUEST: {
        const precedingProcessors = getPrecedingProcessors(
          uiConfig.search.enrichRequest.processors,
          curProcessorId,
          includeCurProcessor
        );
        return !isEmpty(precedingProcessors)
          ? ({
              request_processors: processorConfigsToTemplateProcessors(
                precedingProcessors,
                context
              ),
            } as SearchPipelineConfig)
          : undefined;
      }
      // Generating search pipeline (response): fetch existing search response
      // processors and check if there are preceding ones. Also add on any
      // existing search request processors
      case PROCESSOR_CONTEXT.SEARCH_RESPONSE: {
        const requestProcessors = uiConfig.search.enrichRequest.processors;
        const precedingProcessors = getPrecedingProcessors(
          uiConfig.search.enrichResponse.processors,
          curProcessorId,
          includeCurProcessor
        );
        return !isEmpty(precedingProcessors) || !isEmpty(requestProcessors)
          ? ({
              request_processors: processorConfigsToTemplateProcessors(
                requestProcessors,
                context
              ),
              // for search response, we need to explicitly separate out any phase results processors
              phase_results_processors: processorConfigsToTemplateProcessors(
                precedingProcessors.filter((processor) =>
                  isPhaseResultsProcessor(processor)
                ),
                context
              ),
              response_processors: processorConfigsToTemplateProcessors(
                precedingProcessors.filter(
                  (processor) => !isPhaseResultsProcessor(processor)
                ),
                context
              ),
            } as SearchPipelineConfig)
          : undefined;
      }
    }
  }
  return undefined;
}

export function formikToSearchRequestPipeline(
  values: WorkflowFormValues,
  existingConfig: WorkflowConfig
): SearchPipelineConfig | undefined {
  if (values?.ingest && values?.search) {
    const uiConfig = formikToUiConfig(values, existingConfig);
    const requestProcessors = uiConfig.search.enrichRequest.processors;
    if (requestProcessors?.length > 0) {
      return {
        request_processors: processorConfigsToTemplateProcessors(
          requestProcessors,
          PROCESSOR_CONTEXT.SEARCH_REQUEST
        ),
      } as SearchPipelineConfig;
    }
  }
  return undefined;
}

export function formikToSearchPipeline(
  values: WorkflowFormValues,
  existingConfig: WorkflowConfig
): SearchPipelineConfig | undefined {
  if (values?.ingest && values?.search) {
    const uiConfig = formikToUiConfig(values, existingConfig);
    const requestProcessors = uiConfig.search.enrichRequest.processors;
    const responseProcessors = uiConfig.search.enrichResponse.processors;
    if (requestProcessors?.length > 0 || responseProcessors.length > 0) {
      return {
        request_processors: processorConfigsToTemplateProcessors(
          requestProcessors,
          PROCESSOR_CONTEXT.SEARCH_REQUEST
        ),
        // for search response, we need to explicitly separate out any phase results processors
        phase_results_processors: processorConfigsToTemplateProcessors(
          responseProcessors.filter((processor) =>
            isPhaseResultsProcessor(processor)
          ),
          PROCESSOR_CONTEXT.SEARCH_RESPONSE
        ),
        response_processors: processorConfigsToTemplateProcessors(
          responseProcessors.filter(
            (processor) => !isPhaseResultsProcessor(processor)
          ),
          PROCESSOR_CONTEXT.SEARCH_RESPONSE
        ),
      } as SearchPipelineConfig;
    }
  }
  return undefined;
}

function getPrecedingProcessors(
  allProcessors: IProcessorConfig[],
  curProcessorId: string,
  includeCurProcessor: boolean
): IProcessorConfig[] {
  const precedingProcessors = [] as IProcessorConfig[];
  allProcessors.some((processor) => {
    if (processor.id === curProcessorId) {
      if (includeCurProcessor) {
        precedingProcessors.push(processor);
      }
      return true;
    } else {
      precedingProcessors.push(processor);
    }
  });
  return precedingProcessors;
}

// currently the only phase results processor supported is the normalization processor
function isPhaseResultsProcessor(processor: IProcessorConfig): boolean {
  return processor.type === PROCESSOR_TYPE.NORMALIZATION;
}
