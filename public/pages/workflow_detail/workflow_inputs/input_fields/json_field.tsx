/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import { EuiCodeEditor, EuiCompressedFormRow, EuiLink, EuiText } from '@elastic/eui';
import { WorkspaceFormValues } from '../../../../../common';

interface JsonFieldProps {
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  onFormChange: () => void;
  label?: string;
  helpLink?: string;
  helpText?: string;
  editorHeight?: string;
  readOnly?: boolean;
}

/**
 * An input field for a component where users manually enter
 * in some custom JSON
 */
export function JsonField(props: JsonFieldProps) {
  const { errors, touched, values } = useFormikContext<WorkspaceFormValues>();

  // temp input state. only format when users click out of the code editor
  const [jsonStr, setJsonStr] = useState<string>('{}');

  // initializing the text to be the stringified form value
  useEffect(() => {
    if (props.fieldPath && values) {
      const formValue = getIn(values, props.fieldPath) as string;
      if (formValue) {
        setJsonStr(formValue);
      }
    }
  }, [props.fieldPath, values]);

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
            error={getIn(errors, field.name)}
            isInvalid={getIn(errors, field.name) && getIn(touched, field.name)}
          >
            <EuiCodeEditor
              mode="json"
              theme="textmate"
              width="100%"
              height={props.editorHeight || '15vh'}
              value={jsonStr}
              onChange={(input) => {
                setJsonStr(input);
              }}
              onBlur={() => {
                try {
                  form.setFieldValue(
                    field.name,
                    JSON.stringify(JSON.parse(jsonStr), undefined, 2)
                  );
                } catch (error) {
                  form.setFieldValue(field.name, jsonStr);
                } finally {
                  form.setFieldTouched(field.name);
                  props.onFormChange();
                }
              }}
              readOnly={props.readOnly || false}
              setOptions={{
                fontSize: '14px',
              }}
              aria-label="Code Editor"
              tabSize={2}
            />
          </EuiCompressedFormRow>
        );
      }}
    </Field>
  );
}
