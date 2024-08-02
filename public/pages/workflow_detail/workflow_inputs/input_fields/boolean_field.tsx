/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Field, FieldProps } from 'formik';
import { EuiCompressedRadioGroup, EuiRadioGroupOption } from '@elastic/eui';

interface BooleanFieldProps {
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  onFormChange: () => void;
  enabledOption: EuiRadioGroupOption;
  disabledOption: EuiRadioGroupOption;
}

/**
 * An input field for a boolean value. Implemented as an EuiCompressedRadioGroup with 2 mutually exclusive options.
 */
export function BooleanField(props: BooleanFieldProps) {
  return (
    <Field name={props.fieldPath}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiCompressedRadioGroup
            options={[props.enabledOption, props.disabledOption]}
            idSelected={
              field.value === undefined || field.value === true
                ? props.enabledOption.id
                : props.disabledOption.id
            }
            onChange={(id) => {
              form.setFieldValue(field.name, !field.value);
              props.onFormChange();
            }}
          />
        );
      }}
    </Field>
  );
}
