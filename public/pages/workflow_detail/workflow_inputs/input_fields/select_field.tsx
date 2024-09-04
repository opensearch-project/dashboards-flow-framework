/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import {
  EuiCompressedFormRow,
  EuiCompressedSuperSelect,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui';
import { WorkspaceFormValues, IConfigField } from '../../../../../common';
import { camelCaseToTitleString } from '../../../../utils';

interface SelectFieldProps {
  field: IConfigField;
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  onSelectChange?: (option: string) => void;
}

/**
 * A generic select field from a list of preconfigured options
 */
export function SelectField(props: SelectFieldProps) {
  const { errors, touched } = useFormikContext<WorkspaceFormValues>();

  return (
    <Field name={props.fieldPath}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiCompressedFormRow label={camelCaseToTitleString(props.field.id)}>
            <EuiCompressedSuperSelect
              options={
                props.field.selectOptions
                  ? props.field.selectOptions.map(
                      (option) =>
                        ({
                          value: option,
                          inputDisplay: (
                            <>
                              <EuiText size="s">{option}</EuiText>
                            </>
                          ),
                          dropdownDisplay: <EuiText size="s">{option}</EuiText>,
                          disabled: false,
                        } as EuiSuperSelectOption<string>)
                    )
                  : []
              }
              valueOfSelected={field.value || ''}
              onChange={(option: string) => {
                form.setFieldTouched(props.fieldPath, true);
                form.setFieldValue(props.fieldPath, option);
                if (props.onSelectChange) {
                  props.onSelectChange(option);
                }
              }}
              isInvalid={
                getIn(errors, field.name) && getIn(touched, field.name)
                  ? true
                  : undefined
              }
            />
          </EuiCompressedFormRow>
        );
      }}
    </Field>
  );
}
