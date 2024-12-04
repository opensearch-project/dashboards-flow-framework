/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import {
  EuiCompressedFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiCompressedSuperSelect,
  EuiSuperSelectOption,
  EuiText,
  EuiCodeBlock,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import { WorkflowFormValues } from '../../../../../common';
import { AppState } from '../../../../store';
import { EditQueryModal } from './edit_query_modal';

interface ConfigureSearchRequestProps {
  setQuery: (query: string) => void;
  setQueryResponse: (queryResponse: string) => void;
}

/**
 * Input component for configuring a search request
 */
export function ConfigureSearchRequest(props: ConfigureSearchRequestProps) {
  // Form state
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();
  const ingestEnabled = values?.ingest?.enabled;
  const searchIndexNameFormPath = 'search.index.name';

  // All indices state
  const indices = useSelector((state: AppState) => state.opensearch.indices);

  // Selected index state
  const [selectedIndex, setSelectedIndex] = useState<string | undefined>(
    values?.search?.index?.name
  );

  // initial load: set the search index value, if not already set
  useEffect(() => {
    if (values?.ingest?.enabled) {
      setFieldValue(searchIndexNameFormPath, values?.ingest?.index?.name);
    }
  }, []);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Hook to listen when the query form value changes.
  // Try to set the query request if possible
  useEffect(() => {
    if (values?.search?.request) {
      props.setQuery(values.search.request);
    }
  }, [values?.search?.request]);

  return (
    <>
      {isEditModalOpen && (
        <EditQueryModal
          setModalOpen={setIsEditModalOpen}
          queryFieldPath="search.request"
        />
      )}
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            <h3>Configure query</h3>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiCompressedFormRow label="Retrieval index">
            {ingestEnabled ? (
              <EuiCompressedFieldText
                value={values?.ingest?.index?.name}
                readOnly={true}
              />
            ) : (
              <EuiCompressedSuperSelect
                options={Object.values(indices).map(
                  (option) =>
                    ({
                      value: option.name,
                      inputDisplay: <EuiText size="s">{option.name}</EuiText>,
                      disabled: false,
                    } as EuiSuperSelectOption<string>)
                )}
                valueOfSelected={selectedIndex}
                onChange={(option) => {
                  setSelectedIndex(option);
                  setFieldValue(searchIndexNameFormPath, option);
                  setFieldTouched(searchIndexNameFormPath, true);
                }}
                isInvalid={selectedIndex === undefined}
              />
            )}
          </EuiCompressedFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup direction="row" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                <h4>Query definition</h4>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup direction="row" gutterSize="none">
                <EuiFlexItem>
                  <EuiSmallButtonEmpty
                    style={{ width: '100px' }}
                    onClick={() => setIsEditModalOpen(true)}
                    data-testid="queryEditButton"
                    iconType="pencil"
                    iconSide="left"
                  >
                    Edit
                  </EuiSmallButtonEmpty>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={true} style={{ marginTop: '0px' }}>
          <EuiCodeBlock
            fontSize="s"
            language="json"
            overflowHeight={300}
            isCopyable={false}
            whiteSpace="pre"
            paddingSize="none"
          >
            {getIn(values, 'search.request')}
          </EuiCodeBlock>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
