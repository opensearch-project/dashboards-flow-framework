/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiCodeEditor,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiTitle,
} from '@elastic/eui';
import { Field, FieldProps } from 'formik';

interface ConfigureSearchRequestProps {
  setQuery: (query: {}) => void;
}

/**
 * Input component for configuring a search request
 */
export function ConfigureSearchRequest(props: ConfigureSearchRequestProps) {
  const indexFieldPath = 'ingest.index.name';

  // query state
  const [queryStr, setQueryStr] = useState<string>('{}');

  useEffect(() => {
    try {
      const query = JSON.parse(queryStr);
      props.setQuery(query);
    } catch (e) {
      props.setQuery({});
    }
  }, [queryStr]);

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h2>Configure query</h2>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup direction="column">
          <EuiFlexItem grow={false}>
            <Field name={indexFieldPath}>
              {({ field, form }: FieldProps) => {
                return (
                  // TODO: make this dynamic depending on if ingest is defined or not.
                  // 1/ (incomplete) if no ingest, make this a dropdown to select existing indices
                  // 2/ (complete) if ingest, show the defined index from ingest config, make it readonly
                  <EuiFormRow key={indexFieldPath} label={'Retrieval index'}>
                    <EuiFieldText
                      {...field}
                      compressed={false}
                      value={field.value}
                      readOnly={true}
                    />
                  </EuiFormRow>
                );
              }}
            </Field>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiCodeEditor
              mode="json"
              theme="textmate"
              width="100%"
              height="25vh"
              value={queryStr}
              onChange={(input) => {
                setQueryStr(input);
              }}
              readOnly={false}
              setOptions={{
                fontSize: '14px',
              }}
              aria-label="Code Editor"
              tabSize={2}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
