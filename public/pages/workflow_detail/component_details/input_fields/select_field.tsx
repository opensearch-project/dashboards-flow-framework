/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFormRow,
  EuiLink,
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
  const selectOptions = (props.field.selectOptions || []).map(
    (option) =>
      ({
        value: option,
        inputDisplay: <EuiText>{option}</EuiText>,
        disabled: false,
      } as EuiSuperSelectOption<string>)
  );

  const formField = `${props.componentId}.${props.field.name}`;
  const { errors, touched } = useFormikContext<WorkspaceFormValues>();

  return (
    <Field name={formField}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiFormRow
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
          >
            <EuiSuperSelect
              options={selectOptions}
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
