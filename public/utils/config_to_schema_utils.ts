/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, ObjectSchema } from 'yup';
import * as yup from 'yup';
import {
  WorkflowConfig,
  WorkflowSchema,
  IngestConfig,
  SearchConfig,
  ProcessorsConfig,
  WorkflowSchemaObj,
  IndexConfig,
  ConfigFieldType,
} from '../../common';

/*
 **************** Schema / validation utils **********************
 */

export function uiConfigToSchema(config: WorkflowConfig): WorkflowSchema {
  const schemaObj = {} as WorkflowSchemaObj;
  schemaObj['ingest'] = ingestConfigToSchema(config.ingest);
  schemaObj['search'] = searchConfigToSchema(config.search);
  return yup.object(schemaObj) as WorkflowSchema;
}

function ingestConfigToSchema(
  ingestConfig: IngestConfig | undefined
): ObjectSchema<any> {
  const ingestSchemaObj = {} as { [key: string]: Schema };
  if (ingestConfig) {
    ingestSchemaObj['docs'] = getFieldSchema('json');
    ingestSchemaObj['enrich'] = processorsConfigToSchema(ingestConfig.enrich);
    ingestSchemaObj['index'] = indexConfigToSchema(ingestConfig.index);
  }
  return yup.object(ingestSchemaObj);
}

function indexConfigToSchema(indexConfig: IndexConfig): Schema {
  const indexSchemaObj = {} as { [key: string]: Schema };
  indexSchemaObj['name'] = getFieldSchema(indexConfig.name.type);
  indexSchemaObj['mappings'] = getFieldSchema(indexConfig.mappings.type);
  indexSchemaObj['settings'] = getFieldSchema(indexConfig.settings.type);
  return yup.object(indexSchemaObj);
}

function searchConfigToSchema(
  searchConfig: SearchConfig | undefined
): ObjectSchema<any> {
  const searchSchemaObj = {} as { [key: string]: Schema };
  if (searchConfig) {
    searchSchemaObj['request'] = getFieldSchema('json');
    searchSchemaObj['enrichRequest'] = processorsConfigToSchema(
      searchConfig.enrichRequest
    );
    searchSchemaObj['enrichResponse'] = processorsConfigToSchema(
      searchConfig.enrichResponse
    );
  }
  return yup.object(searchSchemaObj);
}

function processorsConfigToSchema(processorsConfig: ProcessorsConfig): Schema {
  const processorsSchemaObj = {} as { [key: string]: Schema };
  processorsConfig.processors.forEach((processorConfig) => {
    const processorSchemaObj = {} as { [key: string]: Schema };
    processorConfig.fields.forEach((field) => {
      processorSchemaObj[field.id] = getFieldSchema(field.type);
    });
    processorsSchemaObj[processorConfig.id] = yup.object(processorSchemaObj);
  });

  return yup.object(processorsSchemaObj);
}

/*
 **************** Yup (validation) utils **********************
 */

function getFieldSchema(fieldType: ConfigFieldType): Schema {
  let baseSchema: Schema;
  switch (fieldType) {
    case 'string':
    case 'select': {
      baseSchema = yup.string().min(1, 'Too short').max(70, 'Too long');
      break;
    }
    case 'model': {
      baseSchema = yup.object().shape({
        id: yup.string().min(1, 'Too short').max(70, 'Too long').required(),
        category: yup.string().required(),
      });
      break;
    }
    case 'map': {
      baseSchema = yup.array().of(
        yup.object().shape({
          key: yup.string().min(1, 'Too short').max(70, 'Too long').required(),
          value: yup
            .string()
            .min(1, 'Too short')
            .max(70, 'Too long')
            .required(),
        })
      );
      break;
    }
    case 'json': {
      baseSchema = yup.string().test('json', 'Invalid JSON', (value) => {
        try {
          // @ts-ignore
          JSON.parse(value);
          return true;
        } catch (error) {
          return false;
        }
      });

      break;
    }
  }

  // TODO: make optional schema if we support optional fields in the future
  // return field.optional
  //   ? baseSchema.optional()
  //   : baseSchema.required('Required');

  return baseSchema.required('Required');
}
