/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, FieldProps, useFormikContext } from 'formik';
import {
  EuiFormRow,
  EuiLink,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui';
import {
  IComponentField,
  WorkspaceFormValues,
  getInitialValue,
  isFieldInvalid,
} from '../../../../../common';
import { AppState } from '../../../../store';

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
  // Redux store state
  // Initial store is fetched when loading base <DetectorDetail /> page. We don't
  // re-fetch here as it could overload client-side if user clicks back and forth /
  // keeps re-rendering this component (and subsequently re-fetching data) as they're building flows
  const models = useSelector((state: AppState) => state.models.models);

  // Options state
  const [options, setOptions] = useState<string[]>([]);

  // Populate options depending on the select type
  useEffect(() => {
    if (props.field.selectType === 'model' && models) {
      setOptions(Object.keys(models));
    }
  }, [models]);

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
