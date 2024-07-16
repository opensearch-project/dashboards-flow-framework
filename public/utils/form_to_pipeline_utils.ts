/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkflowFormValues } from '../../common';

/*
   **************** Form -> pipeline utils **********************
   Collection of utility fns for converting the current form state
   to partial/in-progress ingest and search pipelines to run
   and collect their current outputs. Primarily used for determining
   the input schema at a certain stage of a pipeline.
   */

export function formikToIngestPipeline(values: WorkflowFormValues): {} {
  const ingestConfig = values.ingest;
  console.log('ingest config: ', ingestConfig);
  // TODO: may be able to convert form -> config -> template, where template has the API-formatted configs.
  return {};
}
