/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFormRow,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui';
import { Field, FieldProps, useFormikContext } from 'formik';
import {
  IComponentField,
  WorkspaceFormValues,
  getInitialValue,
  isFieldInvalid,
} from '../../../../../common';

// TODO: Should be fetched from global state.
// Need to have a way to determine where to fetch this dynamic data.
const existingIndices = [
  {
    value: 'index-1',
    inputDisplay: <EuiText>my-index-1</EuiText>,
    disabled: false,
  },
  {
    value: 'index-2',
    inputDisplay: <EuiText>my-index-2</EuiText>,
    disabled: false,
  },
] as Array<EuiSuperSelectOption<string>>;

interface SelectFieldProps {
  field: IComponentField;
  componentId: string;
  onFormChange: () => void;
}

/**
 * An input field for a component where users select from a list of available
 * options.
 */
export function SelectField(props: SelectFieldProps) {
  const options = existingIndices;
  const formField = `${props.componentId}.${props.field.name}`;
  const { errors, touched } = useFormikContext<WorkspaceFormValues>();

  return (
    <Field name={formField}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiFormRow label={props.field.label}>
            <EuiSuperSelect
              options={options}
              valueOfSelected={field.value || getInitialValue(props.field.type)}
              onChange={(option) => {
                form.setFieldValue(formField, option);
                props.onFormChange();
              }}
              isInvalid={isFieldInvalid(
                props.componentId,
                props.field.name,
                errors,
                touched
              )}
            />
          </EuiFormRow>
        );
      }}
    </Field>
  );
}
