/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { EuiCodeEditor, EuiFormRow, EuiLink, EuiText } from '@elastic/eui';
import { customStringify } from '../../../../../common';

interface SimplifiedJsonFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  helpLink?: string;
  helpText?: string;
  editorHeight?: string;
  readOnly?: boolean;
  isInvalid?: boolean;
  error?: string;
}

/**
 * A simplified version of JsonField that works outside Formik context
 */
export function SimplifiedJsonField(props: SimplifiedJsonFieldProps) {
  // temp input state. only format when users click out of the code editor
  const [jsonStr, setJsonStr] = useState<string>(props.value || '{}');
  useEffect(() => {
    setJsonStr(props.value);
  }, [props.value]);

  return (
    <EuiFormRow
      fullWidth={true}
      label={props.label || ''}
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
      error={props.error}
      isInvalid={props.isInvalid}
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
            const formattedJson = customStringify(JSON.parse(jsonStr));
            setJsonStr(formattedJson);
            props.onChange(formattedJson);
          } catch (error) {}
        }}
        readOnly={props.readOnly || false}
        setOptions={{
          fontSize: '14px',
          highlightActiveLine: !props.readOnly,
          highlightSelectedWord: !props.readOnly,
          highlightGutterLine: !props.readOnly,
          wrap: true,
        }}
        aria-label="Code Editor"
        tabSize={2}
      />
    </EuiFormRow>
  );
}
