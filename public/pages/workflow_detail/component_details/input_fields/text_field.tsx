/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { EuiFieldText, EuiFormRow, EuiLink, EuiText } from '@elastic/eui';
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
  const formField = `${props.componentId}.${props.field.id}`;
  const { errors, touched } = useFormikContext<WorkspaceFormValues>();

  return (
    <Field name={formField}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiFormRow
            key={formField}
            label={props.field.label}
            labelAppend={
              props.field.helpLink ? (
                <EuiText size="xs">
                  <EuiLink href={props.field.helpLink} target="_blank">
                    Learn more
                  </EuiLink>
                </EuiText>
              ) : undefined
            }
            helpText={props.field.helpText || undefined}
            error={getFieldError(props.componentId, props.field.id, errors)}
            isInvalid={isFieldInvalid(
              props.componentId,
              props.field.id,
              errors,
              touched
            )}
          >
            <EuiFieldText
              {...field}
              placeholder={props.field.placeholder || ''}
              compressed={false}
              value={field.value || getInitialValue(props.field.type)}
              onChange={(e) => {
                form.setFieldValue(formField, e.target.value);
                props.onFormChange();
              }}
            />
          </EuiFormRow>
        );
      }}
    </Field>
  );
}
