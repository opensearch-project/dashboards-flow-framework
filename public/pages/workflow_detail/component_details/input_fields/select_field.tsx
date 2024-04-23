/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Field, FieldProps, useFormikContext } from 'formik';
import {
  EuiFormRow,
  EuiLink,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui';
import { IComponentField, WorkspaceFormValues } from '../../../../../common';
import { getInitialValue, isFieldInvalid } from '../../../../utils';

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
  // Options state
  const [options, setOptions] = useState<string[]>([]);

  // Populate options depending on the select type
  useEffect(() => {
    // TODO: figure out how we want to utilize select types to customize the options
    if (props.field.selectType === 'model') {
    }
  }, []);

  const formField = `${props.componentId}.${props.field.id}`;
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
              options={options.map(
                (option) =>
                  ({
                    value: option,
                    inputDisplay: <EuiText>{option}</EuiText>,
                    disabled: false,
                  } as EuiSuperSelectOption<string>)
              )}
              valueOfSelected={field.value || getInitialValue(props.field.type)}
              onChange={(option) => {
                form.setFieldValue(formField, option);
                props.onFormChange();
              }}
              isInvalid={isFieldInvalid(
                props.componentId,
                props.field.id,
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
