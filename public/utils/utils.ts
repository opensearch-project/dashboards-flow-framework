/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormikValues } from 'formik';
import { EuiFilterSelectItem } from '@elastic/eui';
import { Schema, ObjectSchema } from 'yup';
import * as yup from 'yup';
import {
  IComponent,
  IComponentData,
  IComponentField,
  WorkspaceFormValues,
  WORKFLOW_STATE,
  ReactFlowComponent,
  Workflow,
  WorkflowTemplate,
  ModelFormValue,
  WorkflowConfig,
  WorkflowFormValues,
  WorkflowSchema,
  IngestConfig,
  SearchConfig,
  EnrichConfig,
  ConfigFieldType,
  ConfigFieldValue,
  WorkflowSchemaObj,
  IConfigField,
  IndexConfig,
} from '../../common';

// Append 16 random characters
export function generateId(prefix: string): string {
  const uniqueChar = () => {
    // eslint-disable-next-line no-bitwise
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${prefix}_${uniqueChar()}${uniqueChar()}${uniqueChar()}${uniqueChar()}`;
}

// Adding any instance metadata. Converting the base IComponent obj into
// an instance-specific IComponentData obj.
export function initComponentData(
  data: IComponent,
  componentId: string
): IComponentData {
  return {
    ...data,
    id: componentId,
  } as IComponentData;
}

/*
 **************** Formik / form utils **********************
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
    // TODO: implement for the other sub-categories
    ingestFormikValues['enrich'] = enrichConfigToFormik(ingestConfig.enrich);
  }
  return ingestFormikValues;
}

function enrichConfigToFormik(enrichConfig: EnrichConfig): FormikValues {
  let formValues = {} as FormikValues;

  enrichConfig.processors.forEach((processorConfig) => {
    let fieldValues = {} as FormikValues;
    processorConfig.fields.forEach((field) => {
      fieldValues[field.id] = field.value || getInitialValue(field.type);
    });
    formValues[processorConfig.id] = fieldValues;
  });

  return formValues;
}

// TODO: implement this
function searchConfigToFormik(
  searchConfig: SearchConfig | undefined
): FormikValues {
  let searchFormikValues = {} as FormikValues;
  return searchFormikValues;
}

// TODO: this may need more tuning. Currently this is force-converting the FormikValues obj
// into a WorkflowConfig obj. It takes the assumption the form will include all possible
// config values, including defaults.
export function formikToUiConfig(
  formValues: WorkflowFormValues
): WorkflowConfig {
  const workflowConfig = {} as WorkflowConfig;
  workflowConfig['ingest'] = formValues.ingest as IngestConfig;
  workflowConfig['search'] = formValues.search as SearchConfig;
  return workflowConfig;
}

/*
 **************** Schema / validation utils **********************
 */

// TODO: implement this. Refer to getComponentSchema() below
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
    ingestSchemaObj['enrich'] = enrichConfigToSchema(ingestConfig.enrich);
    ingestSchemaObj['index'] = indexConfigToSchema(ingestConfig.index);
  }
  return yup.object(ingestSchemaObj);
}

function enrichConfigToSchema(enrichConfig: EnrichConfig): Schema {
  const enrichSchemaObj = {} as { [key: string]: Schema };
  enrichConfig.processors.forEach((processorConfig) => {
    const processorSchemaObj = {} as { [key: string]: Schema };
    processorConfig.fields.forEach((field) => {
      processorSchemaObj[field.id] = getFieldSchema(field);
    });
    enrichSchemaObj[processorConfig.id] = yup.object(processorSchemaObj);
  });

  return yup.object(enrichSchemaObj);
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

// TODO: below, we are hardcoding to only persisting and validating create fields.
// If we support both, we will need to dynamically update.
// Converting stored values in component data to initial formik values
export function componentDataToFormik(data: IComponentData): FormikValues {
  const formikValues = {} as FormikValues;
  data.createFields?.forEach((field) => {
    formikValues[field.id] = field.value || getInitialValue(field.type);
  });
  return formikValues;
}

// TODO: below, we are hardcoding to only persisting and validating create fields.
// If we support both, we will need to dynamically update.
// Injecting the current form values into the component data
export function formikToComponentData(
  origData: IComponentData,
  formValues: FormikValues
): IComponentData {
  return {
    ...origData,
    createFields: origData.createFields?.map(
      (createField: IComponentField) => ({
        ...createField,
        value: formValues[createField.id],
      })
    ),
  } as IComponentData;
}

// Helper fn to remove state-related fields from a workflow and have a stateless template
// to export and/or pass around, use when updating, etc.
export function reduceToTemplate(workflow: Workflow): WorkflowTemplate {
  const {
    id,
    lastUpdated,
    lastLaunched,
    state,
    resourcesCreated,
    ...workflowTemplate
  } = workflow;
  return workflowTemplate;
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
    case 'json': {
      return {};
    }
  }
}

// Process the raw ReactFlow nodes.
// De-select them all, and propagate the form data to the internal node data
export function processNodes(
  nodes: ReactFlowComponent[],
  formValues: WorkspaceFormValues
): ReactFlowComponent[] {
  return nodes.map((node: ReactFlowComponent) => {
    return {
      ...node,
      selected: false,
      data: formikToComponentData(
        { ...node.data, selected: false },
        formValues[node.id]
      ),
    };
  });
}

/*
 **************** Yup (validation) utils **********************
 */

// TODO: below, we are hardcoding to only persisting and validating create fields.
// If we support both, we will need to dynamically update.
export function getComponentSchema(data: IComponentData): ObjectSchema<any> {
  const schemaObj = {} as { [key: string]: Schema };
  data.createFields?.forEach((field) => {
    schemaObj[field.id] = getFieldSchema(field);
  });
  return yup.object(schemaObj);
}

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

export function getStateOptions(): EuiFilterSelectItem[] {
  return [
    // @ts-ignore
    {
      name: WORKFLOW_STATE.NOT_STARTED,
      checked: 'on',
    } as EuiFilterSelectItem,
    // @ts-ignore
    {
      name: WORKFLOW_STATE.PROVISIONING,
      checked: 'on',
    } as EuiFilterSelectItem,
    // @ts-ignore
    {
      name: WORKFLOW_STATE.FAILED,
      checked: 'on',
    } as EuiFilterSelectItem,
    // @ts-ignore
    {
      name: WORKFLOW_STATE.COMPLETED,
      checked: 'on',
    } as EuiFilterSelectItem,
  ];
}
