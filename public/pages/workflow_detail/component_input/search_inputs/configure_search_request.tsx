/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
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
  EuiCallOut,
} from '@elastic/eui';
import { WorkflowFormValues } from '../../../../../common';
import { AppState } from '../../../../store';
import { EditQueryModal } from './edit_query_modal';
import { SearchRequest } from '../../../../component_types/other';
import { useAppDispatch } from '../../../../store';
import { getDataSourceId } from '../../../../utils/utils';
import { getIndex } from '../../../../store/reducers/opensearch_reducer';
interface KnnValidationResult {
  isValid: boolean;
  warningMessage?: string;
}

interface ConfigureSearchRequestProps {
  disabled: boolean;
}

/**
 * Input component for configuring a search request
 */
export function ConfigureSearchRequest(props: ConfigureSearchRequestProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
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

  // Add knn validation state
  const searchRequest = new SearchRequest();
  const indexDetailsState = useSelector(
    (state: AppState) => state.opensearch.indexDetails
  );
  const [validationResult, setValidationResult] = useState<KnnValidationResult>(
    { isValid: true }
  );

  // initial load: set the search index value, if not already set
  useEffect(() => {
    if (values?.ingest?.enabled) {
      setFieldValue(searchIndexNameFormPath, values?.ingest?.index?.name);
    }
  }, []);

  useEffect(() => {
    if (selectedIndex) {
      dispatch(getIndex({ index: selectedIndex, dataSourceId }));
    }
  }, [selectedIndex]);

  // validate Knn query
  useEffect(() => {
    if (
      selectedIndex &&
      values?.search?.request &&
      indexDetailsState[selectedIndex]
    ) {
      try {
        const indexSettings = JSON.stringify(
          indexDetailsState[selectedIndex]?.settings || {}
        );

        // Make sure your query is properly formatted for the validation
        const queryString =
          typeof values.search.request === 'string'
            ? values.search.request
            : JSON.stringify(values.search.request);

        // Validate the query
        const result = searchRequest.validateKnnQueryToHaveValidKnnIndex(
          queryString,
          indexSettings
        );

        setValidationResult(result);
      } catch (error) {
        console.error('Error validating KNN query:', error);
        setValidationResult({ isValid: true });
      }
    }
  }, [selectedIndex, values?.search?.request, indexDetailsState]);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

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
          <EuiCompressedFormRow label="Index" fullWidth={true}>
            {ingestEnabled ? (
              <EuiCompressedFieldText
                value={values?.ingest?.index?.name}
                readOnly={true}
                fullWidth={true}
              />
            ) : (
              <EuiCompressedSuperSelect
                fullWidth={true}
                options={Object.values(indices || {}).map(
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
                isInvalid={isEmpty(selectedIndex)}
                disabled={props.disabled}
              />
            )}
          </EuiCompressedFormRow>
        </EuiFlexItem>
        {!validationResult.isValid && validationResult.warningMessage && (
          <EuiFlexItem>
            <EuiCallOut
              title="Vector search might not be working"
              color="warning"
              iconType="alert"
              size="s"
            >
              {validationResult.warningMessage}
            </EuiCallOut>
          </EuiFlexItem>
        )}
        <EuiFlexItem>
          <EuiFlexGroup direction="row" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiText size="xs">Query</EuiText>
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
                    isDisabled={props.disabled}
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
