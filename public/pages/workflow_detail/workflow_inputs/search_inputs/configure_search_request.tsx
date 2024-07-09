/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { useFormikContext } from 'formik';
import { IConfigField, WorkspaceFormValues } from '../../../../../common';
import { JsonField } from '../input_fields';
import { AppState, catIndices, useAppDispatch } from '../../../../store';

interface ConfigureSearchRequestProps {
  setQuery: (query: string) => void;
  onFormChange: () => void;
}

/**
 * Input component for configuring a search request
 */
export function ConfigureSearchRequest(props: ConfigureSearchRequestProps) {
  const dispatch = useAppDispatch();

  // Form state
  const { values } = useFormikContext<WorkspaceFormValues>();
  const indexName = values.ingest.index.name;
  const ingestEnabled = values.ingest.enabled;

  // All indices state
  const indices = useSelector((state: AppState) => state.opensearch.indices);

  // Selected index state
  const [selectedIndex, setSelectedIndex] = useState<string | undefined>(
    undefined
  );

  // Hook to listen when the query form value changes.
  // Try to set the query request if possible
  useEffect(() => {
    if (values?.search?.request) {
      props.setQuery(values.search.request);
    }
  }, [values?.search?.request]);

  // Initialization hook to fetch available indices (if applicable)
  useEffect(() => {
    if (!ingestEnabled) {
      // Fetch all indices besides system indices
      dispatch(catIndices('*,-.*'));
    }
  }, []);

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h2>Configure query</h2>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFormRow label="Retrieval index">
          {ingestEnabled ? (
            <EuiFieldText value={indexName} readOnly={true} />
          ) : (
            <EuiSuperSelect
              options={Object.values(indices).map(
                (option) =>
                  ({
                    value: option.name,
                    inputDisplay: <EuiText>{option.name}</EuiText>,
                    disabled: false,
                  } as EuiSuperSelectOption<string>)
              )}
              valueOfSelected={selectedIndex}
              onChange={(option) => {
                setSelectedIndex(option);
              }}
              isInvalid={selectedIndex !== undefined}
            />
          )}
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <JsonField
          label="Define query"
          fieldPath={'search.request'}
          onFormChange={props.onFormChange}
          editorHeight="25vh"
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
