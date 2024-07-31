/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isEmpty } from 'lodash';
import {
  IProcessorConfig,
  IngestPipelineConfig,
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

export function formikToIngestPipeline(
  values: WorkflowFormValues,
  existingConfig: WorkflowConfig,
  curProcessorId: string,
  includeCurProcessor: boolean
): IngestPipelineConfig | SearchPipelineConfig | undefined {
  const uiConfig = formikToUiConfig(values, existingConfig);
  const precedingProcessors = getPrecedingProcessors(
    uiConfig.ingest.enrich.processors,
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
