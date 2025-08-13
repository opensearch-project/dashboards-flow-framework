/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';
import { Formik, getIn, useFormikContext } from 'formik';
import * as yup from 'yup';
import { isEmpty, get } from 'lodash';
import {
  EuiSmallButton,
  EuiContextMenu,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPopover,
  EuiSmallButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiEmptyPrompt,
  EuiCallOut,
  EuiSpacer,
  EuiTabs,
  EuiTab,
  EuiBetaBadge,
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import {
  customStringify,
  IConfigField,
  QUERY_PRESETS,
  QueryParam,
  QueryPreset,
  RequestFormValues,
  SearchResponse,
  WorkflowFormValues,
} from '../../../../../common';
import {
  containsEmptyValues,
  containsSameValues,
  getDataSourceId,
  getFieldSchema,
  getInitialValue,
  getPlaceholdersFromQuery,
  injectParameters,
  injectPlaceholdersInQueryString,
} from '../../../../utils';
import {
  AppState,
  searchIndex,
  searchAgents,
  useAppDispatch,
} from '../../../../store';
import { QueryParamsList, Results } from '../../../../general_components';
import '../../../../global-styles.scss';
import { AgentConfigurationForm } from './agent_configuration_form';

interface EditQueryModalProps {
  queryFieldPath: string;
  setModalOpen(isOpen: boolean): void;
}

enum QueryEditorTab {
  QUERY = 'query',
  AGENT = 'agent',
}

/**
 * Basic modal for configuring a query. Provides a dropdown to select from
 * a set of pre-defined queries targeted for different use cases.
 */
export function EditQueryModal(props: EditQueryModalProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { loading } = useSelector((state: AppState) => state.opensearch);

  // sub-form values/schema
  const requestFormValues = {
    request: getInitialValue('json'),
  } as RequestFormValues;
  const requestFormSchema = yup.object({
    request: getFieldSchema({
      type: 'json',
    } as IConfigField),
  }) as yup.Schema;

  // persist standalone values. update / initialize when it is first opened
  const [tempRequest, setTempRequest] = useState<string>('{}');
  const [tempErrors, setTempErrors] = useState<boolean>(false);

  // Form state
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();

  // popover state
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  // optional search panel state. allows searching within the modal
  const [searchPanelOpen, setSearchPanelOpen] = useState<boolean>(true);

  // results state
  const [queryResponse, setQueryResponse] = useState<
    SearchResponse | undefined
  >(undefined);
  const [tempResultsError, setTempResultsError] = useState<string>('');

  // query/request params state
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);

  // Agent-related state
  const [isAgenticSearch, setIsAgenticSearch] = useState<boolean>(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<QueryEditorTab>(
    QueryEditorTab.QUERY
  );

  const isAgenticSearchQuery = (query: string): boolean => {
    try {
      const parsedQuery = JSON.parse(query);
      return !!get(parsedQuery, 'query.agentic');
    } catch (e) {
      return false;
    }
  };

  const injectAgentId = (agentId: string, request: any) => {
    try {
      let updatedQuery = JSON.parse(request);
      updatedQuery.query.agentic = {
        ...updatedQuery.query.agentic,
        agent_id: agentId,
      };
      return customStringify(updatedQuery);
    } catch (e) {
      console.error('Error updating agent in query: ', e);
    }
  };

  // Do a few things when the request is changed:
  // 1. Check if there is a new set of query parameters, and if so,
  //    reset the form.
  // 2. Clear any persisted error
  // 3. Clear any stale results
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
    setTempResultsError('');
    setQueryResponse(undefined);
  }, [tempRequest]);

  // Clear any error if the parameters have been updated in any way
  useEffect(() => {
    setTempResultsError('');
  }, [queryParams]);

  // Check if the query is an agentic search when it changes
  useEffect(() => {
    const isAgentic = isAgenticSearchQuery(tempRequest);
    setIsAgenticSearch(isAgentic);
    if (isAgentic) {
      try {
        const parsedQuery = JSON.parse(tempRequest);
        const agentId = get(parsedQuery, 'query.agentic.agent_id');
        if (agentId) {
          setSelectedAgentId(agentId);
        }
      } catch (e) {}
    }
  }, [tempRequest]);

  // Fetch agents when agent tab is selected
  useEffect(() => {
    if (selectedTab === QueryEditorTab.AGENT) {
      dispatch(
        searchAgents({
          apiBody: {},
          dataSourceId,
        })
      );
    }
  }, [selectedTab, dataSourceId, dispatch]);

  function executeSearch() {
    dispatch(
      searchIndex({
        apiBody: {
          index: values?.search?.index?.name,
          body: injectParameters(queryParams, tempRequest),
          // Run the query independent of the pipeline inside this modal
          searchPipeline: '_none',
        },
        dataSourceId,
      })
    )
      .unwrap()
      .then(async (resp: SearchResponse) => {
        setQueryResponse(resp);
        setTempResultsError('');
      })
      .catch((error: any) => {
        setQueryResponse(undefined);
        const errorMsg = `Error running query: ${error}`;
        setTempResultsError(errorMsg);
        console.error(errorMsg);
      });
  }

  return (
    <Formik
      enableReinitialize={false}
      initialValues={requestFormValues}
      validationSchema={requestFormSchema}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      {(formikProps) => {
        // override to parent form value when changes detected
        useEffect(() => {
          formikProps.setFieldValue(
            'request',
            getIn(values, props.queryFieldPath)
          );
        }, [getIn(values, props.queryFieldPath)]);

        // update tempRequest when form changes are detected
        useEffect(() => {
          setTempRequest(getIn(formikProps.values, 'request'));
        }, [getIn(formikProps.values, 'request')]);

        // update tempErrors if errors detected
        useEffect(() => {
          setTempErrors(!isEmpty(formikProps.errors));
        }, [formikProps.errors]);

        return (
          <EuiModal
            onClose={() => props.setModalOpen(false)}
            className="configuration-modal"
            data-testid="editQueryModal"
            maxWidth={false}
          >
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <p>{`Define query`}</p>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody data-testid="editQueryModalBody">
              <EuiFlexGroup direction="row">
                <EuiFlexItem>
                  <EuiFlexGroup direction="column">
                    <EuiFlexItem grow={false}>
                      <EuiTabs>
                        <EuiTab
                          onClick={() => {
                            setSelectedTab(QueryEditorTab.QUERY);
                          }}
                          isSelected={selectedTab === QueryEditorTab.QUERY}
                          data-test-subj="queryTab"
                        >
                          Query Definition
                        </EuiTab>
                        {isAgenticSearch && (
                          <EuiTab
                            onClick={() => setSelectedTab(QueryEditorTab.AGENT)}
                            isSelected={selectedTab === QueryEditorTab.AGENT}
                            data-test-subj="agentTab"
                          >
                            <EuiFlexGroup gutterSize="xs" alignItems="center">
                              <EuiFlexItem grow={false}>
                                Agent Configuration
                              </EuiFlexItem>
                              <EuiFlexItem grow={false}>
                                <EuiBetaBadge
                                  label="Experimental"
                                  tooltipContent="This feature is experimental and may change in future releases"
                                  size="s"
                                />
                              </EuiFlexItem>
                            </EuiFlexGroup>
                          </EuiTab>
                        )}
                      </EuiTabs>
                    </EuiFlexItem>

                    {selectedTab === QueryEditorTab.QUERY && (
                      <EuiFlexItem grow={false}>
                        <EuiFlexGroup
                          direction="row"
                          justifyContent="spaceBetween"
                        >
                          <EuiFlexItem grow={false}>
                            <EuiText size="m">Query definition</EuiText>
                          </EuiFlexItem>
                          <EuiFlexItem grow={false}>
                            <EuiFlexGroup direction="row" gutterSize="s">
                              <EuiFlexItem grow={false}>
                                <EuiPopover
                                  button={
                                    <EuiSmallButton
                                      onClick={() =>
                                        setPopoverOpen(!popoverOpen)
                                      }
                                      data-testid="searchQueryPresetButton"
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
                                              const queryString = injectPlaceholdersInQueryString(
                                                preset.query
                                              );
                                              formikProps.setFieldValue(
                                                'request',
                                                queryString
                                              );
                                              setPopoverOpen(false);

                                              // Check if this is an agentic search query - no additional action needed
                                              preset.name === 'Agentic search';
                                            },
                                          })
                                        ),
                                      },
                                    ]}
                                  />
                                </EuiPopover>
                              </EuiFlexItem>
                              <EuiFlexItem grow={false}>
                                <EuiSmallButton
                                  data-testid="showOrHideSearchPanelButton"
                                  fill={false}
                                  iconType={
                                    searchPanelOpen ? 'menuRight' : 'menuLeft'
                                  }
                                  iconSide="right"
                                  onClick={() => {
                                    setSearchPanelOpen(!searchPanelOpen);
                                  }}
                                >
                                  Test query
                                </EuiSmallButton>
                              </EuiFlexItem>
                            </EuiFlexGroup>
                          </EuiFlexItem>
                        </EuiFlexGroup>
                      </EuiFlexItem>
                    )}

                    {selectedTab === QueryEditorTab.AGENT && (
                      <EuiFlexItem>
                        <AgentConfigurationForm
                          selectedAgentId={selectedAgentId}
                          onAgentSelected={(agentId: string) => {
                            setSelectedAgentId(agentId);
                            const requestWithAgentId = injectAgentId(
                              agentId,
                              formikProps.values.request
                            );
                            if (requestWithAgentId !== undefined) {
                              formikProps.setFieldValue(
                                'request',
                                requestWithAgentId
                              );
                            }
                          }}
                          selectedIndex={values?.search?.index?.name}
                        />
                      </EuiFlexItem>
                    )}

                    {selectedTab === QueryEditorTab.QUERY && (
                      <EuiFlexItem>
                        <JsonField
                          label="Query"
                          fieldPath={'request'}
                          editorHeight="50vh"
                          readOnly={false}
                        />
                      </EuiFlexItem>
                    )}
                  </EuiFlexGroup>
                </EuiFlexItem>
                {searchPanelOpen && (
                  <EuiFlexItem>
                    <EuiFlexGroup direction="column">
                      <EuiFlexItem grow={false}>
                        <EuiFlexGroup
                          direction="row"
                          justifyContent="spaceBetween"
                        >
                          <EuiFlexItem grow={false}>
                            <EuiText size="m">Test query</EuiText>
                          </EuiFlexItem>
                          {!isEmpty(queryResponse) && (
                            <EuiFlexItem grow={false}>
                              <EuiSmallButtonEmpty
                                isLoading={loading}
                                disabled={containsEmptyValues(queryParams)}
                                onClick={() => executeSearch()}
                              >
                                <EuiText size="m">Search</EuiText>
                              </EuiSmallButtonEmpty>
                            </EuiFlexItem>
                          )}
                        </EuiFlexGroup>
                      </EuiFlexItem>
                      {/**
                       * This may return nothing if the list of params are empty
                       */}
                      <QueryParamsList
                        queryParams={queryParams}
                        setQueryParams={setQueryParams}
                      />
                      <EuiFlexItem>
                        <>
                          <EuiText size="s">Results</EuiText>
                          {(queryResponse === undefined ||
                            isEmpty(queryResponse)) &&
                          isEmpty(tempResultsError) ? (
                            <EuiEmptyPrompt
                              title={<h2>No results</h2>}
                              titleSize="s"
                              body={
                                <>
                                  <EuiText size="s">
                                    Run a search to view results.
                                  </EuiText>
                                  <EuiSpacer size="m" />
                                  <EuiSmallButton
                                    fill={false}
                                    isLoading={loading}
                                    disabled={containsEmptyValues(queryParams)}
                                    onClick={() => executeSearch()}
                                  >
                                    Search
                                  </EuiSmallButton>
                                </>
                              }
                            />
                          ) : (queryResponse === undefined ||
                              isEmpty(queryResponse)) &&
                            !isEmpty(tempResultsError) ? (
                            <EuiCallOut
                              color="danger"
                              title={tempResultsError}
                            />
                          ) : (
                            <Results
                              response={queryResponse as SearchResponse}
                            />
                          )}
                        </>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiSmallButtonEmpty
                onClick={() => props.setModalOpen(false)}
                color="primary"
                data-testid="cancelSearchQueryButton"
              >
                Cancel
              </EuiSmallButtonEmpty>
              <EuiSmallButton
                onClick={() => {
                  setFieldValue(props.queryFieldPath, tempRequest);
                  setFieldTouched(props.queryFieldPath, true);
                  props.setModalOpen(false);
                }}
                isDisabled={tempErrors} // blocking update until valid input is given
                fill={true}
                color="primary"
                data-testid="updateSearchQueryButton"
              >
                Confirm
              </EuiSmallButton>
            </EuiModalFooter>
          </EuiModal>
        );
      }}
    </Formik>
  );
}
