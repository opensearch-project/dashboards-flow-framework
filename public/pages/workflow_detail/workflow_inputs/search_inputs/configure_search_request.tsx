/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFormikContext } from 'formik';
import {
  EuiButton,
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
import { SearchHit, WorkflowFormValues } from '../../../../../common';
import { JsonField } from '../input_fields';
import {
  AppState,
  catIndices,
  searchIndex,
  useAppDispatch,
} from '../../../../store';

interface ConfigureSearchRequestProps {
  setQuery: (query: string) => void;
  setQueryResponse: (queryResponse: string) => void;
  onFormChange: () => void;
}

/**
 * Input component for configuring a search request
 */
export function ConfigureSearchRequest(props: ConfigureSearchRequestProps) {
  const dispatch = useAppDispatch();

  // Form state
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();
  const ingestEnabled = values.ingest.enabled;
  const searchIndexNameFormPath = 'search.index.name';

  // All indices state
  const indices = useSelector((state: AppState) => state.opensearch.indices);

  // Selected index state
  const [selectedIndex, setSelectedIndex] = useState<string | undefined>(
    values.search.index.name
  );

  // initial load: set the search index value, if not already set
  useEffect(() => {
    if (values.ingest.enabled) {
      setFieldValue(searchIndexNameFormPath, values.ingest.index.name);
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

  // Initialization hook to fetch available indices (if applicable)
  useEffect(() => {
    if (!ingestEnabled) {
      // Fetch all indices besides system indices
      dispatch(catIndices('*,-.*'));
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
              <EuiFieldText value={values.ingest.index.name} readOnly={true} />
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
                  setFieldValue(searchIndexNameFormPath, option);
                  setFieldTouched(searchIndexNameFormPath, true);
                  props.onFormChange();
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
          <JsonField
            label="Query"
            fieldPath={'search.request'}
            onFormChange={props.onFormChange}
            editorHeight="25vh"
            readOnly={true}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill={false}
            style={{ width: '100px' }}
            size="s"
            onClick={() => {
              // for this test query, we don't want to involve any configured search pipelines, if any exist
              // see https://opensearch.org/docs/latest/search-plugins/search-pipelines/using-search-pipeline/#disabling-the-default-pipeline-for-a-request
              dispatch(
                searchIndex({
                  index: values.search.index.name,
                  body: values.search.request,
                  searchPipeline: '_none',
                })
              )
                .unwrap()
                .then(async (resp) => {
                  props.setQueryResponse(
                    JSON.stringify(
                      resp.hits.hits.map((hit: SearchHit) => hit._source),
                      undefined,
                      2
                    )
                  );
                })
                .catch((error: any) => {
                  props.setQueryResponse('');
                  console.error('Error running query: ', error);
                });
            }}
          >
            Test
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
