/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormikValues } from 'formik';
import {
  WorkflowConfig,
  WorkflowFormValues,
  IngestConfig,
  SearchConfig,
  ProcessorsConfig,
  IndexConfig,
  IProcessorConfig,
  ConfigFieldType,
  ConfigFieldValue,
  ModelFormValue,
} from '../../common';

/*
 **************** Config -> formik utils **********************
 */

export function uiConfigToFormik(config: WorkflowConfig): WorkflowFormValues {
  const formikValues = {} as WorkflowFormValues;
  formikValues['ingest'] = ingestConfigToFormik(config.ingest);
  formikValues['search'] = searchConfigToFormik(config.search);
  return formikValues;
}

function ingestConfigToFormik(
  ingestConfig: IngestConfig | undefined
): FormikValues {
  let ingestFormikValues = {} as FormikValues;
  if (ingestConfig) {
    ingestFormikValues['enrich'] = processorsConfigToFormik(
      ingestConfig.enrich
    );
    ingestFormikValues['index'] = indexConfigToFormik(ingestConfig.index);
  }
  return ingestFormikValues;
}

function processorsConfigToFormik(
  processorsConfig: ProcessorsConfig
): FormikValues {
  let formValues = {} as FormikValues;
  processorsConfig.processors.forEach((processorConfig) => {
    formValues[processorConfig.id] = processorConfigToFormik(processorConfig);
  });
  return formValues;
}

export function processorConfigToFormik(
  processorConfig: IProcessorConfig
): FormikValues {
  const fieldValues = {} as FormikValues;
  processorConfig.fields.forEach((field) => {
    fieldValues[field.id] = field.value || getInitialValue(field.type);
  });
  return fieldValues;
}

function indexConfigToFormik(indexConfig: IndexConfig): FormikValues {
  let formValues = {} as FormikValues;
  formValues['name'] =
    indexConfig.name.value || getInitialValue(indexConfig.name.type);
  formValues['mappings'] =
    indexConfig.mappings.value || getInitialValue(indexConfig.mappings.type);
  formValues['settings'] =
    indexConfig.settings.value || getInitialValue(indexConfig.settings.type);
  return formValues;
}

function searchConfigToFormik(
  searchConfig: SearchConfig | undefined
): FormikValues {
  let searchFormikValues = {} as FormikValues;
  if (searchConfig) {
    // TODO: implement for request
    searchFormikValues['request'] = {};
    searchFormikValues['enrichRequest'] = processorsConfigToFormik(
      searchConfig.enrichRequest
    );
    searchFormikValues['enrichResponse'] = processorsConfigToFormik(
      searchConfig.enrichResponse
    );
  }
  return searchFormikValues;
}

// Helper fn to get an initial value based on the field type
export function getInitialValue(fieldType: ConfigFieldType): ConfigFieldValue {
  switch (fieldType) {
    case 'string': {
      return '';
    }
    case 'select': {
      return '';
    }
    case 'model': {
      return {
        id: '',
        category: undefined,
        algorithm: undefined,
      } as ModelFormValue;
    }
    case 'map': {
      return [];
    }
    case 'json': {
      return {};
    }
  }
}
