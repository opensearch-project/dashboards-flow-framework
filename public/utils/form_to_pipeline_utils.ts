/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isEmpty } from 'lodash';
import {
  IProcessorConfig,
  IngestPipelineConfig,
  PROCESSOR_CONTEXT,
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

export function formikToPipeline(
  values: WorkflowFormValues,
  existingConfig: WorkflowConfig,
  curProcessorId: string,
  includeCurProcessor: boolean,
  context: PROCESSOR_CONTEXT
): IngestPipelineConfig | undefined {
  const uiConfig = formikToUiConfig(values, existingConfig);
  const processors =
    context === PROCESSOR_CONTEXT.INGEST
      ? uiConfig.ingest.enrich.processors
      : context === PROCESSOR_CONTEXT.SEARCH_REQUEST
      ? uiConfig.search.enrichRequest.processors
      : uiConfig.search.enrichResponse.processors;
  const precedingProcessors = getPrecedingProcessors(
    processors,
    curProcessorId,
    includeCurProcessor
  );
  if (!isEmpty(precedingProcessors)) {
    return {
      processors: processorConfigsToTemplateProcessors(precedingProcessors),
    } as IngestPipelineConfig | SearchPipelineConfig;
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
