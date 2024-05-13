/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormikErrors, FormikTouched, FormikValues } from 'formik';
import { EuiFilterSelectItem } from '@elastic/eui';
import { Schema, ObjectSchema } from 'yup';
import * as yup from 'yup';
import {
  FieldType,
  FieldValue,
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
 **************** Formik (form) utils **********************
 */

// TODO: implement this. Refer to formikToComponentData() below
export function uiConfigToFormik(config: WorkflowConfig): WorkflowFormValues {
  const formikValues = {} as WorkflowFormValues;
  formikValues['ingest'] = {};
  formikValues['search'] = {};
  return formikValues;
}

// TODO: implement this. Refer to getComponentSchema() below
export function uiConfigToSchema(config: WorkflowConfig): WorkflowSchema {
  const schemaObj = {} as { [key: string]: ObjectSchema<any> };
  schemaObj['ingest'] = {} as ObjectSchema<any>;
  schemaObj['search'] = {} as ObjectSchema<any>;
  return yup.object(schemaObj) as WorkflowSchema;
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
export function getInitialValue(fieldType: FieldType): FieldValue {
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

export function isFieldInvalid(
  componentId: string,
  fieldName: string,
  errors: FormikErrors<WorkspaceFormValues>,
  touched: FormikTouched<WorkspaceFormValues>
): boolean {
  return (
    errors[componentId]?.[fieldName] !== undefined &&
    touched[componentId]?.[fieldName] !== undefined
  );
}

export function getFieldError(
  componentId: string,
  fieldName: string,
  errors: FormikErrors<WorkspaceFormValues>
): string | undefined {
  return errors[componentId]?.[fieldName] as string | undefined;
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

function getFieldSchema(field: IComponentField): Schema {
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
