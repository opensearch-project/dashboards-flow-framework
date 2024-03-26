/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { EuiFieldText, EuiFormRow } from '@elastic/eui';
import {
  IComponentField,
  WorkspaceFormValues,
  getFieldError,
  getInitialValue,
  isFieldInvalid,
} from '../../../../../common';

interface TextFieldProps {
  field: IComponentField;
  componentId: string;
  onFormChange: () => void;
}

/**
 * An input field for a component where users input plaintext
 */
export function TextField(props: TextFieldProps) {
  const formField = `${props.componentId}.${props.field.name}`;
  const { errors, touched } = useFormikContext<WorkspaceFormValues>();

  return (
    <Field name={formField}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiFormRow
            key={formField}
            label={props.field.label}
            error={getFieldError(props.componentId, props.field.name, errors)}
            isInvalid={isFieldInvalid(
              props.componentId,
              props.field.name,
              errors,
              touched
            )}
          >
            <EuiFieldText
              {...field}
              placeholder={props.field.placeholder || ''}
              compressed={false}
              value={field.value || getInitialValue(props.field.type)}
              onChange={(e) => form.setFieldValue(formField, e.target.value)}
              onBlur={() => props.onFormChange()}
            />
          </EuiFormRow>
        );
      }}
    </Field>
  );
}
