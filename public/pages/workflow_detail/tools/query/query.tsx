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
  EuiContextMenu,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiText,
} from '@elastic/eui';
import {
  customStringify,
  QUERY_PRESETS,
  QueryParam,
  QueryPreset,
  SearchResponse,
  SearchResponseVerbose,
  WorkflowFormValues,
} from '../../../../../common';
import {
  AppState,
  searchIndex,
  setSearchPipelineErrors,
  useAppDispatch,
} from '../../../../store';
import {
  containsEmptyValues,
  containsSameValues,
  getDataSourceId,
  getPlaceholdersFromQuery,
  getSearchPipelineErrors,
  injectParameters,
  useDataSourceVersion,
} from '../../../../utils';
import { QueryParamsList, Results } from '../../../../general_components';

interface QueryProps {
  hasSearchPipeline: boolean;
  hasIngestResources: boolean;
  queryRequest: string;
  setQueryRequest: (queryRequest: string) => void;
  queryResponse: SearchResponse | undefined;
  setQueryResponse: (queryResponse: SearchResponse | undefined) => void;
  queryParams: QueryParam[];
  setQueryParams: (queryParams: QueryParam[]) => void;
}

const SEARCH_OPTIONS = [
  {
    label: 'With search pipeline',
  },
  {
    label: 'Without search pipeline',
  },
];

/**
 * The search component for the Tools panel.
 * Lets users configure query parameters, execute search, and view responses.
 */
export function Query(props: QueryProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const dataSourceVersion = useDataSourceVersion(dataSourceId);
  const { loading } = useSelector((state: AppState) => state.opensearch);
  const { values } = useFormikContext<WorkflowFormValues>();

  // popover state
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  // state for if to execute search w/ or w/o any configured search pipeline.
  // default based on if there is an available search pipeline or not.
  const [includePipeline, setIncludePipeline] = useState<boolean>(false);
  useEffect(() => {
    setIncludePipeline(props.hasSearchPipeline);
  }, [props.hasSearchPipeline]);

  // Check if there is a new set of query parameters, and if so, reset the form
  useEffect(() => {
    const placeholders = getPlaceholdersFromQuery(props.queryRequest);
    if (
      !containsSameValues(
        placeholders,
        props.queryParams.map((queryParam) => queryParam.name)
      )
    ) {
      props.setQueryParams(
        placeholders.map((placeholder) => ({
          name: placeholder,
          type: 'Text',
          value: '',
        }))
      );
    }
  }, [props.queryRequest]);

  const ingestEnabled = values?.ingest?.enabled as boolean;
  const ingestNotCreated = ingestEnabled && !props.hasIngestResources;
  const searchNotConfigured =
    !ingestEnabled && isEmpty(values?.search?.index?.name);
  const noConfiguredIndex = ingestNotCreated || searchNotConfigured;
  const indexToSearch =
    ingestEnabled && props.hasIngestResources
      ? values?.ingest?.index?.name
      : !isEmpty(values?.search?.index?.name)
      ? values?.search?.index?.name
      : values?.ingest?.index?.name;

  return (
    <>
      {noConfiguredIndex ? (
        <EuiEmptyPrompt
          title={<h2>Missing search configurations</h2>}
          titleSize="s"
          body={
            <>
              <EuiText size="s">
                {ingestNotCreated
                  ? `Create an index and ingest data first.`
                  : `Configure a search request and an index to search against first.`}
              </EuiText>
            </>
          }
        />
      ) : (
        <EuiFlexGroup direction="row" style={{ paddingBottom: '24px' }}>
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
                            includePipeline
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
                        containsEmptyValues(props.queryParams) ||
                        isEmpty(indexToSearch)
                      }
                      onClick={() => {
                        dispatch(
                          searchIndex({
                            apiBody: {
                              index: indexToSearch,
                              body: injectParameters(
                                props.queryParams,
                                props.queryRequest
                              ),
                              searchPipeline: includePipeline
                                ? values?.search?.pipelineName
                                : '_none',
                            },
                            dataSourceId,
                            dataSourceVersion,
                            verbose: includePipeline,
                          })
                        )
                          .unwrap()
                          .then(
                            async (
                              resp: SearchResponse | SearchResponseVerbose
                            ) => {
                              if (includePipeline) {
                                const searchPipelineErrors = getSearchPipelineErrors(
                                  resp as SearchResponseVerbose
                                );
                                // The errors map may be empty; in which case, this dispatch will clear
                                // any older errors.
                                dispatch(
                                  setSearchPipelineErrors({
                                    errors: searchPipelineErrors,
                                  })
                                );
                              } else {
                                setSearchPipelineErrors({ errors: {} });
                              }

                              props.setQueryResponse(resp);
                            }
                          )
                          .catch((error: any) => {
                            props.setQueryResponse(undefined);
                            setSearchPipelineErrors({ errors: {} });
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
                  <EuiFlexItem grow={false}>
                    <EuiFlexGroup direction="row" gutterSize="s">
                      {!isEmpty(values?.search?.request) &&
                        values?.search?.request !== props.queryRequest && (
                          <EuiFlexItem
                            grow={false}
                            style={{ marginBottom: '0px' }}
                          >
                            <EuiSmallButtonEmpty
                              disabled={false}
                              onClick={() => {
                                props.setQueryRequest(values?.search?.request);
                              }}
                            >
                              Revert to original query
                            </EuiSmallButtonEmpty>
                          </EuiFlexItem>
                        )}
                      <EuiFlexItem grow={false}>
                        <EuiPopover
                          button={
                            <EuiSmallButton
                              onClick={() => setPopoverOpen(!popoverOpen)}
                              data-testid="inspectorQueryPresetButton"
                              iconSide="right"
                              iconType="arrowDown"
                            >
                              Query samples
                            </EuiSmallButton>
                          }
                          isOpen={popoverOpen}
                          closePopover={() => setPopoverOpen(false)}
                          anchorPosition="downLeft"
                        >
                          <EuiContextMenu
                            size="s"
                            initialPanelId={0}
                            panels={[
                              {
                                id: 0,
                                items: QUERY_PRESETS.map(
                                  (preset: QueryPreset) => ({
                                    name: preset.name,
                                    onClick: () => {
                                      props.setQueryRequest(preset.query);
                                      setPopoverOpen(false);
                                    },
                                  })
                                ),
                              },
                            ]}
                          />
                        </EuiPopover>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={true}>
                <EuiCodeEditor
                  mode="json"
                  theme="textmate"
                  width="100%"
                  height={'100%'}
                  value={props.queryRequest}
                  onChange={(input) => {
                    props.setQueryRequest(input);
                  }}
                  // format the JSON on blur
                  onBlur={() => {
                    try {
                      props.setQueryRequest(
                        customStringify(JSON.parse(props.queryRequest))
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
              <EuiFlexItem grow={false}>
                {/**
                 * This may return nothing if the list of params are empty
                 */}
                <QueryParamsList
                  queryParams={props.queryParams}
                  setQueryParams={props.setQueryParams}
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
                {props.queryResponse === undefined ||
                isEmpty(props.queryResponse) ? (
                  <EuiEmptyPrompt
                    title={<h2>No results</h2>}
                    titleSize="s"
                    body={
                      <>
                        <EuiText size="s">
                          Run a search to view results.
                        </EuiText>
                      </>
                    }
                  />
                ) : (
                  <Results response={props.queryResponse} />
                )}
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </>
  );
}
