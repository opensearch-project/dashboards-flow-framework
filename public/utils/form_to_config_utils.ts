/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormikValues } from 'formik';
import { cloneDeep } from 'lodash';
import {
  WorkflowConfig,
  WorkflowFormValues,
  IngestConfig,
  SearchConfig,
  ProcessorsConfig,
  IndexConfig,
} from '../../common';

/*
 **************** Formik -> config utils **********************
 */

export function formikToUiConfig(
  formValues: WorkflowFormValues,
  existingConfig: WorkflowConfig
): WorkflowConfig {
  let updatedConfig = cloneDeep(existingConfig);
  updatedConfig['ingest'] = formikToIngestUiConfig(
    formValues.ingest,
    updatedConfig.ingest
  );
  updatedConfig['search'] = formikToSearchUiConfig(
    formValues.search,
    updatedConfig.search
  ) as SearchConfig;

  return {
    ...updatedConfig,
    ingest: formikToIngestUiConfig(formValues.ingest, updatedConfig.ingest),
  };
}

function formikToIngestUiConfig(
  ingestFormValues: FormikValues,
  existingConfig: IngestConfig
): IngestConfig {
  return {
    ...existingConfig,
    enabled: ingestFormValues['enabled'],
    enrich: formikToProcessorsUiConfig(
      ingestFormValues['enrich'],
      existingConfig.enrich
    ),
    index: formikToIndexUiConfig(
      ingestFormValues['index'],
      existingConfig.index
    ),
  };
}

function formikToIndexUiConfig(
  indexFormValues: FormikValues,
  existingConfig: IndexConfig
): IndexConfig {
  existingConfig['name'].value = indexFormValues['name'];
  existingConfig['mappings'].value = indexFormValues['mappings'];
  existingConfig['settings'].value = indexFormValues['settings'];
  return existingConfig;
}

function formikToSearchUiConfig(
  searchFormValues: FormikValues,
  existingConfig: SearchConfig
): SearchConfig {
  return {
    ...existingConfig,
    request: {
      ...existingConfig.request,
      value: searchFormValues['request'],
    },
    enrichRequest: formikToProcessorsUiConfig(
      searchFormValues['enrichRequest'],
      existingConfig.enrichRequest
    ),
    enrichResponse: formikToProcessorsUiConfig(
      searchFormValues['enrichResponse'],
      existingConfig.enrichResponse
    ),
  };
}

function formikToProcessorsUiConfig(
  formValues: FormikValues,
  existingConfig: ProcessorsConfig
): ProcessorsConfig {
  existingConfig.processors.forEach((processorConfig) => {
    const processorFormValues = formValues[processorConfig.id];
    processorConfig.fields.forEach((processorField) => {
      processorField.value = processorFormValues[processorField.id];
    });
  });
  return existingConfig;
}
