/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import { EuiFieldText, EuiFormRow, EuiLink, EuiText } from '@elastic/eui';
import { IConfigField, WorkspaceFormValues } from '../../../../../common';
import { getInitialValue } from '../../../../utils';

interface TextFieldProps {
  field: IConfigField;
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  onFormChange: () => void;
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
          <EuiFormRow
            key={props.fieldPath}
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
            error={getIn(errors, field.name)}
            isInvalid={getIn(errors, field.name) && getIn(touched, field.name)}
          >
            <EuiFieldText
              {...field}
              placeholder={props.field.placeholder || ''}
              compressed={false}
              value={field.value || getInitialValue(props.field.type)}
              onChange={(e) => {
                form.setFieldValue(props.fieldPath, e.target.value);
                props.onFormChange();
              }}
            />
          </EuiFormRow>
        );
      }}
    </Field>
  );
}
