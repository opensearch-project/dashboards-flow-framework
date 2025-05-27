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
  EuiHorizontalRule,
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
  SearchPipelineConfig,
  SearchResponse,
  SearchResponseVerbose,
  WorkflowConfig,
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
  formikToSearchPipeline,
  formikToSearchRequestPipeline,
  getDataSourceId,
  getPlaceholdersFromQuery,
  getSearchPipelineErrors,
  injectParameters,
  useDataSourceVersion,
} from '../../../../utils';
import { QueryParamsList, Results } from '../../../../general_components';

interface QueryProps {
  uiConfig: WorkflowConfig | undefined;
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
    label: 'No transformations',
  },
  {
    label: 'Just query transformations',
  },
  {
    label: 'All transformations',
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

  // search options state. Default to include the full pipeline (with all search req/resp transformations)
  // if the pipeline exists.
  const [selectedSearchOption, setSelectedSearchOption] = useState<{
    label: string;
  }>(SEARCH_OPTIONS[0]);
  useEffect(() => {
    if (props.hasSearchPipeline) {
      setSelectedSearchOption(SEARCH_OPTIONS[2]);
    }
  }, [props.hasSearchPipeline]);

  // the final constructed search pipeline to search against (if any). Users can toggle
  // to only run against a subset of search processors that exist in the created pipeline
  const [finalSearchPipeline, setFinalSearchPipeline] = useState<
    SearchPipelineConfig | undefined
  >(undefined);
  useEffect(() => {
    // no transformation: empty pipeline
    if (selectedSearchOption === SEARCH_OPTIONS[0]) {
      setFinalSearchPipeline(undefined);
      // partial transformation: create custom search pipeline config
    } else if (selectedSearchOption === SEARCH_OPTIONS[1]) {
      if (values !== undefined && props.uiConfig !== undefined) {
        const searchRequestPipeline = formikToSearchRequestPipeline(
          values,
          props.uiConfig
        );
        setFinalSearchPipeline(searchRequestPipeline);
      }
      // full transformation: create full search pipeline config
    } else if (selectedSearchOption === SEARCH_OPTIONS[2]) {
      if (values !== undefined && props.uiConfig !== undefined) {
        const searchPipeline = formikToSearchPipeline(values, props.uiConfig);
        setFinalSearchPipeline(searchPipeline);
      }
    }
  }, [selectedSearchOption, props.uiConfig, values]);

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
        <EuiFlexGroup direction="column" style={{ paddingBottom: '36px' }}>
          <EuiFlexItem>
            <EuiFlexGroup direction="column" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiFlexGroup direction="row" gutterSize="s">
                  <EuiFlexItem grow={true}>
                    <EuiComboBox
                      fullWidth={true}
                      compressed={true}
                      singleSelection={{ asPlainText: true }}
                      isClearable={false}
                      options={
                        props.hasSearchPipeline
                          ? SEARCH_OPTIONS
                          : [SEARCH_OPTIONS[0]]
                      }
                      selectedOptions={[selectedSearchOption]}
                      onChange={(options) => {
                        setSelectedSearchOption(options[0]);
                      }}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiSmallButton
                      data-test-subj="searchButton"
                      fill={false}
                      isLoading={loading}
                      iconType={'play'}
                      iconSide="left"
                      disabled={
                        containsEmptyValues(props.queryParams) ||
                        isEmpty(indexToSearch)
                      }
                      onClick={() => {
                        dispatch(
                          searchIndex({
                            apiBody: {
                              index: indexToSearch,
                              body: JSON.stringify({
                                ...JSON.parse(
                                  injectParameters(
                                    props.queryParams,
                                    props.queryRequest
                                  )
                                ),
                                search_pipeline: finalSearchPipeline || {},
                              }),
                            },
                            dataSourceId,
                            dataSourceVersion,
                            verbose: finalSearchPipeline !== undefined,
                          })
                        )
                          .unwrap()
                          .then(
                            async (
                              resp: SearchResponse | SearchResponseVerbose
                            ) => {
                              if (finalSearchPipeline !== undefined) {
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
                      Run test
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
                          style={{ marginRight: '-8px' }}
                          button={
                            <EuiSmallButtonEmpty
                              onClick={() => setPopoverOpen(!popoverOpen)}
                              data-testid="inspectorQueryPresetButton"
                              iconSide="right"
                              iconType="arrowDown"
                            >
                              Query samples
                            </EuiSmallButtonEmpty>
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
              <EuiFlexItem grow={false}>
                {/**
                 * This may return nothing if the list of params are empty
                 */}
                <QueryParamsList
                  queryParams={props.queryParams}
                  setQueryParams={props.setQueryParams}
                />
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
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiHorizontalRule size="full" margin="s" />
          <EuiFlexItem>
            <EuiFlexGroup direction="column" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiText size="m">Results</EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                {props.queryResponse === undefined ||
                isEmpty(props.queryResponse) ? (
                  <EuiEmptyPrompt
                    iconType="search"
                    body={
                      <>
                        <EuiText size="s">
                          Use your sample query or write another one to test out
                          your search flow
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
