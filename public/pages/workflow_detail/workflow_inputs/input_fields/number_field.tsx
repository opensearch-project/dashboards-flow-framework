/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import {
  EuiCompressedFormRow,
  EuiLink,
  EuiText,
  EuiFieldNumber,
} from '@elastic/eui';
import { WorkspaceFormValues } from '../../../../../common';
import { camelCaseToTitleString, getInitialValue } from '../../../../utils';

interface NumberFieldProps {
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  label?: string;
  helpLink?: string;
  helpText?: string;
  placeholder?: string;
  showError?: boolean;
}

/**
 * An input field for a component where users input numbers
 */
export function NumberField(props: NumberFieldProps) {
  const { errors, touched } = useFormikContext<WorkspaceFormValues>();

  return (
    <Field name={props.fieldPath}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiCompressedFormRow
            key={props.fieldPath}
            label={props.label || camelCaseToTitleString(field.name)}
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
            error={props.showError && getIn(errors, field.name)}
            isInvalid={getIn(errors, field.name) && getIn(touched, field.name)}
          >
            <EuiFieldNumber
              {...field}
              placeholder={props.placeholder || ''}
              compressed={false}
              value={field.value || getInitialValue('number')}
              onChange={(e) => {
                form.setFieldValue(props.fieldPath, e.target.value);
              }}
            />
          </EuiCompressedFormRow>
        );
      }}
    </Field>
  );
}
