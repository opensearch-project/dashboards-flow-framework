/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormikValues } from 'formik';
import { cloneDeep, get } from 'lodash';
import {
  WorkflowConfig,
  WorkflowFormValues,
  IngestConfig,
  SearchConfig,
  ProcessorsConfig,
  IndexConfig,
  SearchIndexConfig,
} from '../../common';
import { getInitialValue } from './config_to_form_utils';

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
    enabled: {
      ...existingConfig.enabled,
      value: ingestFormValues['enabled'],
    },
    pipelineName: {
      ...existingConfig.pipelineName,
      value: ingestFormValues['pipelineName'],
    },
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
    pipelineName: {
      ...existingConfig.pipelineName,
      value: searchFormValues['pipelineName'],
    },
    index: formikToSearchIndexUiConfig(
      searchFormValues['index'],
      existingConfig.index
    ),
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

function formikToSearchIndexUiConfig(
  searchIndexFormValues: FormikValues,
  existingConfig: SearchIndexConfig
): SearchIndexConfig {
  existingConfig['name'].value = searchIndexFormValues['name'];
  return existingConfig;
}

function formikToProcessorsUiConfig(
  formValues: FormikValues,
  existingConfig: ProcessorsConfig
): ProcessorsConfig {
  existingConfig.processors.forEach((processorConfig) => {
    const processorFormValues = formValues[processorConfig.id];
    processorConfig.fields.forEach((processorField) => {
      processorField.value = get(
        processorFormValues,
        processorField.id,
        getInitialValue(processorField.type)
      );
    });
    processorConfig.optionalFields?.forEach((processorField) => {
      processorField.value = get(
        processorFormValues,
        processorField.id,
        undefined
      );
    });
  });
  return existingConfig;
}
