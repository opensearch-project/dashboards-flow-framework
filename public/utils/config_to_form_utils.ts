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

// if the user has input any ingest docs, persist them in the form.
// we don't persist in the config as it logically does not belong there,
// and can be extremely large. so we pass that as a standalone field
export function uiConfigToFormik(
  config: WorkflowConfig,
  ingestDocs: string
): WorkflowFormValues {
  const formikValues = {} as WorkflowFormValues;
  formikValues['ingest'] = ingestConfigToFormik(config.ingest, ingestDocs);
  formikValues['search'] = searchConfigToFormik(config.search);
  return formikValues;
}

function ingestConfigToFormik(
  ingestConfig: IngestConfig | undefined,
  ingestDocs: string
): FormikValues {
  let ingestFormikValues = {} as FormikValues;
  if (ingestConfig) {
    ingestFormikValues['enabled'] = ingestConfig.enabled;
    ingestFormikValues['docs'] = ingestDocs || getInitialValue('jsonArray');
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
    searchFormikValues['request'] =
      searchConfig.request.value || getInitialValue('json');
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
        algorithm: undefined,
      } as ModelFormValue;
    }
    case 'map': {
      return [];
    }
    case 'json': {
      return '{}';
    }
    case 'jsonArray': {
      return '[]';
    }
    case 'mapArray': {
      return [];
    }
  }
}
