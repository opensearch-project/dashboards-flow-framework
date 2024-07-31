/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFormikContext, getIn } from 'formik';
import {
  EuiButton,
  EuiCodeBlock,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { WorkspaceFormValues } from '../../../../../common';
import { JsonField } from '../input_fields';
import { AppState, catIndices, useAppDispatch } from '../../../../store';
import { useLocation } from 'react-router-dom';
import { getDataSourceFromURL } from '../../../../utils/helpers';

interface ConfigureSearchRequestProps {
  setQuery: (query: string) => void;
  onFormChange: () => void;
}

/**
 * Input component for configuring a search request
 */
export function ConfigureSearchRequest(props: ConfigureSearchRequestProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const MDSQueryParams = getDataSourceFromURL(location);
  const dataSourceId = MDSQueryParams.dataSourceId;

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

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

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
      dispatch(catIndices({pattern:'*,-.*',dataSourceId: dataSourceId}));
    }
  }, []);

  return (
    <>
      {isEditModalOpen && (
        <EuiModal
          onClose={() => setIsEditModalOpen(false)}
          style={{ width: '70vw' }}
        >
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <p>{`Edit query`}</p>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <JsonField
              label="Query"
              fieldPath={'search.request'}
              onFormChange={props.onFormChange}
              editorHeight="25vh"
              readOnly={false}
            />
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButton
              onClick={() => setIsEditModalOpen(false)}
              fill={false}
              color="primary"
            >
              Close
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      )}
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
                isInvalid={selectedIndex === undefined}
              />
            )}
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill={false}
            style={{ width: '100px' }}
            size="s"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiCodeBlock language="json" fontSize="m" isCopyable={false}>
            {getIn(values, 'search.request')}
          </EuiCodeBlock>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
