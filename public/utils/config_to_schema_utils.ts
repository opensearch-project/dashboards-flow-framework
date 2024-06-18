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
  IConfigField,
  IndexConfig,
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
    // TODO: implement for the other sub-categories
    ingestSchemaObj['enrich'] = processorsConfigToSchema(ingestConfig.enrich);
    ingestSchemaObj['index'] = indexConfigToSchema(ingestConfig.index);
  }
  return yup.object(ingestSchemaObj);
}

function processorsConfigToSchema(processorsConfig: ProcessorsConfig): Schema {
  const processorsSchemaObj = {} as { [key: string]: Schema };
  processorsConfig.processors.forEach((processorConfig) => {
    const processorSchemaObj = {} as { [key: string]: Schema };
    processorConfig.fields.forEach((field) => {
      processorSchemaObj[field.id] = getFieldSchema(field);
    });
    processorsSchemaObj[processorConfig.id] = yup.object(processorSchemaObj);
  });

  return yup.object(processorsSchemaObj);
}

function indexConfigToSchema(indexConfig: IndexConfig): Schema {
  const indexSchemaObj = {} as { [key: string]: Schema };
  indexSchemaObj['name'] = getFieldSchema(indexConfig.name);
  return yup.object(indexSchemaObj);
}

// TODO: implement this
function searchConfigToSchema(
  searchConfig: SearchConfig | undefined
): ObjectSchema<any> {
  const searchSchemaObj = {} as { [key: string]: Schema };

  return yup.object(searchSchemaObj);
}

/*
 **************** Yup (validation) utils **********************
 */

function getFieldSchema(field: IConfigField): Schema {
  let baseSchema: Schema;
  switch (field.type) {
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
      baseSchema = yup.object().json();
      break;
    }
  }

  // TODO: make optional schema if we support optional fields in the future
  // return field.optional
  //   ? baseSchema.optional()
  //   : baseSchema.required('Required');

  return baseSchema.required('Required');
}
