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

// Converting stored values in component data to initial formik values
export function componentDataToFormik(data: IComponentData): FormikValues {
  const formikValues = {} as FormikValues;
  data.fields?.forEach((field) => {
    formikValues[field.name] = field.value || getInitialValue(field.type);
  });
  return formikValues;
}

export function formikToComponentData(
  data: IComponentData,
  values: FormikValues
): IComponentData {
  // TODO: populate data.fields with updated values based on the formik values
  // We will need this when submitting to the backend.
  return data;
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

/*
 **************** Yup (validation) utils **********************
 */

export function getComponentSchema(data: IComponentData): ObjectSchema<any> {
  const schemaObj = {} as { [key: string]: Schema };
  data.fields?.forEach((field) => {
    schemaObj[field.name] = getFieldSchema(field);
  });
  return yup.object(schemaObj);
}

// TODO: finalize validations for different field types. May need
// to refer to some backend implementations or OpenSearch documentation
function getFieldSchema(field: IComponentField): Schema {
  let baseSchema: Schema;
  switch (field.type) {
    case 'string':
    case 'select': {
      baseSchema = yup.string().min(1, 'Too short').max(70, 'Too long');
      break;
    }
    case 'json': {
      baseSchema = yup.object().json();
      break;
    }
  }
  return field.optional
    ? baseSchema.optional()
    : baseSchema.required('Required');
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
