/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { useFormikContext } from 'formik';
import {
  EuiCodeEditor,
  EuiComboBox,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButton,
  EuiSwitch,
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
import { searchIndex, useAppDispatch } from '../../../../store';
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

  // Form state
  const { values } = useFormikContext<WorkflowFormValues>();

  // use custom query state
  const [useCustomQuery, setUseCustomQuery] = useState<boolean>(false);

  // query response state
  // TODO: clean up how/what responses we are persisting and where.
  const [queryResponse, setQueryResponse] = useState<
    SearchResponse | undefined
  >(undefined);

  // Standalone / sandboxed search request state. Users can test things out
  // without updating the base form / persisted value. We default to different values
  // based on the context (ingest or search), and update based on changes to the context
  // (ingest v. search), or if the parent form values are changed.
  const [tempRequest, setTempRequest] = useState<string>('');
  useEffect(() => {
    setTempRequest(
      props.selectedStep === CONFIG_STEP.INGEST
        ? customStringify(FETCH_ALL_QUERY)
        : values?.search?.request || '{}'
    );
  }, [props.selectedStep]);
  useEffect(() => {
    if (
      !isEmpty(values?.search?.request) &&
      props.selectedStep === CONFIG_STEP.SEARCH
    ) {
      setTempRequest(values?.search?.request);
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
                    <EuiText size="m">Search</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiSmallButton
                      fill={true}
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
                <EuiComboBox
                  fullWidth={false}
                  style={{ width: '250px' }}
                  compressed={true}
                  singleSelection={{ asPlainText: true }}
                  isClearable={false}
                  options={
                    props.hasSearchPipeline &&
                    props.selectedStep === CONFIG_STEP.SEARCH
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
              <EuiFlexItem grow={false}>
                <EuiSwitch
                  label={`Use custom query`}
                  checked={useCustomQuery}
                  onChange={(e) => setUseCustomQuery(!useCustomQuery)}
                />
              </EuiFlexItem>
              {useCustomQuery && (
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
                        setTempRequest(
                          customStringify(JSON.parse(tempRequest))
                        );
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
              )}
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
                {/**
                 * TODO: clean up how/what responses we are persisting
                 */}
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
