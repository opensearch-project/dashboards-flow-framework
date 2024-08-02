/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import { EuiFieldText, EuiCompressedFormRow, EuiLink, EuiText } from '@elastic/eui';
import { WorkspaceFormValues } from '../../../../../common';
import { getInitialValue } from '../../../../utils';

interface TextFieldProps {
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  onFormChange: () => void;
  label?: string;
  helpLink?: string;
  helpText?: string;
  placeholder?: string;
  showError?: boolean;
}

/**
 * An input field for a component where users input plaintext
 */
export function TextField(props: TextFieldProps) {
  const { errors, touched } = useFormikContext<WorkspaceFormValues>();

  return (
    <Field name={props.fieldPath}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiCompressedFormRow
            key={props.fieldPath}
            label={props.label}
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
            <EuiFieldText
              {...field}
              placeholder={props.placeholder || ''}
              compressed={false}
              value={field.value || getInitialValue('string')}
              onChange={(e) => {
                form.setFieldValue(props.fieldPath, e.target.value);
                props.onFormChange();
              }}
            />
          </EuiCompressedFormRow>
        );
      }}
    </Field>
  );
}
