/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import { useFormikContext } from 'formik';
import {
  EuiCodeEditor,
  EuiComboBox,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiText,
} from '@elastic/eui';
import {
  CONFIG_STEP,
  customStringify,
  FETCH_ALL_QUERY,
  QueryParam,
  SearchResponse,
  WorkflowFormValues,
} from '../../../../../common';
import { AppState, searchIndex, useAppDispatch } from '../../../../store';
import {
  containsEmptyValues,
  containsSameValues,
  getDataSourceId,
  getPlaceholdersFromQuery,
  injectParameters,
} from '../../../../utils';
import { QueryParamsList, Results } from '../../../../general_components';

interface QueryProps {
  hasSearchPipeline: boolean;
  hasIngestResources: boolean;
  selectedStep: CONFIG_STEP;
}

const SEARCH_OPTIONS = [
  {
    label: 'FULL search pipeline',
  },
  {
    label: 'No search pipeline',
  },
];

/**
 * The search component for the Tools panel.
 * Lets users configure query parameters, execute search, and view responses.
 */
export function Query(props: QueryProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();

  const { loading } = useSelector((state: AppState) => state.opensearch);

  // Form state
  const { values } = useFormikContext<WorkflowFormValues>();

  // query response state
  const [queryResponse, setQueryResponse] = useState<
    SearchResponse | undefined
  >(undefined);

  // Standalone / sandboxed search request state. Users can test things out
  // without updating the base form / persisted value.
  // Update if the parent form values are changed, or if a newly-created search pipeline is detected.
  const [tempRequest, setTempRequest] = useState<string>('');
  useEffect(() => {
    if (!isEmpty(values?.search?.request)) {
      setTempRequest(values?.search?.request);
    } else {
      setTempRequest(customStringify(FETCH_ALL_QUERY));
    }
  }, [values?.search?.request]);

  // state for if to execute search w/ or w/o any configured search pipeline.
  // default based on if there is an available search pipeline or not.
  const [includePipeline, setIncludePipeline] = useState<boolean>(false);
  useEffect(() => {
    setIncludePipeline(props.hasSearchPipeline);
  }, [props.hasSearchPipeline]);

  // query params state
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);

  // Do a few things when the request is changed:
  // 1. Check if there is a new set of query parameters, and if so,
  //    reset the form.
  // 2. Clear any stale results
  useEffect(() => {
    const placeholders = getPlaceholdersFromQuery(tempRequest);
    if (
      !containsSameValues(
        placeholders,
        queryParams.map((queryParam) => queryParam.name)
      )
    ) {
      setQueryParams(
        placeholders.map((placeholder) => ({
          name: placeholder,
          type: 'Text',
          value: '',
        }))
      );
    }
    setQueryResponse(undefined);
  }, [tempRequest]);

  // empty states
  const noSearchIndex = isEmpty(values?.search?.index?.name);
  const noSearchRequest = isEmpty(values?.search?.request);
  const onIngestAndInvalid =
    props.selectedStep === CONFIG_STEP.INGEST && !props.hasIngestResources;
  const onSearchAndInvalid =
    props.selectedStep === CONFIG_STEP.SEARCH &&
    (noSearchIndex || noSearchRequest);
  const indexToSearch =
    props.selectedStep === CONFIG_STEP.INGEST
      ? values?.ingest?.index?.name
      : values?.search?.index?.name;

  return (
    <>
      {onIngestAndInvalid || onSearchAndInvalid ? (
        <EuiEmptyPrompt
          title={<h2>Missing search configurations</h2>}
          titleSize="s"
          body={
            <>
              <EuiText size="s">
                {onIngestAndInvalid
                  ? `Create an index and ingest data first.`
                  : `Configure a search request and an index to search against first.`}
              </EuiText>
            </>
          }
        />
      ) : (
        <EuiFlexGroup direction="row">
          <EuiFlexItem>
            <EuiFlexGroup direction="column" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiFlexGroup direction="row" justifyContent="spaceBetween">
                  <EuiFlexItem grow={false}>
                    <EuiFlexGroup direction="row" justifyContent="flexStart">
                      <EuiFlexItem grow={false}>
                        <EuiText size="m">Search</EuiText>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiComboBox
                          fullWidth={false}
                          style={{ width: '250px' }}
                          compressed={true}
                          singleSelection={{ asPlainText: true }}
                          isClearable={false}
                          options={
                            props.hasSearchPipeline
                              ? SEARCH_OPTIONS
                              : [SEARCH_OPTIONS[1]]
                          }
                          selectedOptions={
                            props.hasSearchPipeline &&
                            includePipeline &&
                            props.selectedStep === CONFIG_STEP.SEARCH
                              ? [SEARCH_OPTIONS[0]]
                              : [SEARCH_OPTIONS[1]]
                          }
                          onChange={(options) => {
                            setIncludePipeline(!includePipeline);
                          }}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiSmallButton
                      data-test-subj="searchButton"
                      fill={true}
                      isLoading={loading}
                      disabled={
                        containsEmptyValues(queryParams) ||
                        isEmpty(indexToSearch)
                      }
                      onClick={() => {
                        dispatch(
                          searchIndex({
                            apiBody: {
                              index: indexToSearch,
                              body: injectParameters(queryParams, tempRequest),
                              searchPipeline:
                                props.hasSearchPipeline &&
                                includePipeline &&
                                props.selectedStep === CONFIG_STEP.SEARCH &&
                                !isEmpty(values?.search?.pipelineName)
                                  ? values?.search?.pipelineName
                                  : '_none',
                            },
                            dataSourceId,
                          })
                        )
                          .unwrap()
                          .then(async (resp: SearchResponse) => {
                            setQueryResponse(resp);
                          })
                          .catch((error: any) => {
                            setQueryResponse(undefined);
                            console.error('Error running query: ', error);
                          });
                      }}
                    >
                      Search
                    </EuiSmallButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup direction="row" justifyContent="spaceBetween">
                  <EuiFlexItem grow={false}>
                    <EuiText size="s">Query</EuiText>
                  </EuiFlexItem>
                  {props.selectedStep === CONFIG_STEP.SEARCH &&
                    !isEmpty(values?.search?.request) &&
                    values?.search?.request !== tempRequest && (
                      <EuiFlexItem grow={false} style={{ marginBottom: '0px' }}>
                        <EuiSmallButtonEmpty
                          disabled={false}
                          onClick={() => {
                            setTempRequest(values?.search?.request);
                          }}
                        >
                          Revert to query definition
                        </EuiSmallButtonEmpty>
                      </EuiFlexItem>
                    )}
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={true}>
                <EuiCodeEditor
                  mode="json"
                  theme="textmate"
                  width="100%"
                  height={'100%'}
                  value={tempRequest}
                  onChange={(input) => {
                    setTempRequest(input);
                  }}
                  onBlur={() => {
                    try {
                      setTempRequest(customStringify(JSON.parse(tempRequest)));
                    } catch (error) {}
                  }}
                  readOnly={false}
                  setOptions={{
                    fontSize: '14px',
                    useWorker: true,
                    highlightActiveLine: true,
                    highlightSelectedWord: true,
                    highlightGutterLine: true,
                    wrap: true,
                  }}
                  aria-label="Code Editor"
                  tabSize={2}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                {/**
                 * This may return nothing if the list of params are empty
                 */}
                <QueryParamsList
                  queryParams={queryParams}
                  setQueryParams={setQueryParams}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup direction="column" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiText size="m">Results</EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                {queryResponse === undefined || isEmpty(queryResponse) ? (
                  <EuiEmptyPrompt
                    title={<h2>No results</h2>}
                    titleSize="s"
                    body={
                      <>
                        <EuiText size="s">Run search to view results.</EuiText>
                      </>
                    }
                  />
                ) : (
                  <Results response={queryResponse} />
                )}
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </>
  );
}
