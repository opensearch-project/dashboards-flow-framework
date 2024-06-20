/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiTitle } from '@elastic/eui';
import { useFormikContext } from 'formik';
import { IConfigField, WorkspaceFormValues } from '../../../../../common';
import { JsonField } from '../input_fields';

interface ConfigureSearchRequestProps {
  setQuery: (query: string) => void;
  onFormChange: () => void;
}

/**
 * Input component for configuring a search request
 */
export function ConfigureSearchRequest(props: ConfigureSearchRequestProps) {
  const { values } = useFormikContext<WorkspaceFormValues>();

  // Hook to listen when the query form value changes.
  // Try to set the query request if possible
  useEffect(() => {
    if (values?.search?.request) {
      props.setQuery(values.search.request);
    }
  }, [values?.search?.request]);

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h2>Configure query</h2>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <JsonField
          // We want to integrate query into the form, but not persist in the config.
          // So, we create the ConfigField explicitly inline, instead of pulling
          // from the config.
          field={
            {
              label: 'Define query',
            } as IConfigField
          }
          fieldPath={'search.request'}
          onFormChange={props.onFormChange}
          editorHeight="25vh"
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
