/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Field, FieldProps } from 'formik';
import {
  EuiCompressedFormRow,
  EuiCompressedRadioGroup,
  EuiLink,
  EuiRadioGroupOption,
  EuiText,
} from '@elastic/eui';
import { camelCaseToTitleString } from '../../../../utils';

interface BooleanFieldProps {
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  enabledOption: EuiRadioGroupOption;
  disabledOption: EuiRadioGroupOption;
  label?: string;
  helpLink?: string;
  helpText?: string;
  showLabel?: boolean;
}

/**
 * An input field for a boolean value. Implemented as an EuiCompressedRadioGroup with 2 mutually exclusive options.
 */
export function BooleanField(props: BooleanFieldProps) {
  return (
    <Field name={props.fieldPath}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiCompressedFormRow
            key={props.fieldPath}
            label={
              props.showLabel &&
              (props.label || camelCaseToTitleString(field.name))
            }
            labelAppend={
              props.helpLink ? (
                <EuiText size="xs">
                  <EuiLink href={props.helpLink} target="_blank">
                    Learn more
                  </EuiLink>
                </EuiText>
              ) : undefined
            }
            helpText={props.helpText || undefined}
            isInvalid={false}
          >
            <EuiCompressedRadioGroup
              options={[props.enabledOption, props.disabledOption]}
              idSelected={
                field.value === undefined || field.value === true
                  ? props.enabledOption.id
                  : props.disabledOption.id
              }
              onChange={(id) => {
                form.setFieldValue(field.name, !field.value);
              }}
            />
          </EuiCompressedFormRow>
        );
      }}
    </Field>
  );
}
