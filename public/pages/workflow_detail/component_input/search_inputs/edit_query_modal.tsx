/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Formik, getIn, useFormikContext } from 'formik';
import * as yup from 'yup';
import { isEmpty } from 'lodash';
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
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import {
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
import { AppState, searchIndex, useAppDispatch } from '../../../../store';
import { QueryParamsList, Results } from '../../../../general_components';
import '../../../../global-styles.scss';

interface EditQueryModalProps {
  queryFieldPath: string;
  setModalOpen(isOpen: boolean): void;
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
                                    onClick={() => setPopoverOpen(!popoverOpen)}
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
                                            formikProps.setFieldValue(
                                              'request',
                                              injectPlaceholdersInQueryString(
                                                preset.query
                                              )
                                            );
                                            setPopoverOpen(false);
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
                    <EuiFlexItem>
                      <JsonField
                        label="Query"
                        fieldPath={'request'}
                        editorHeight="50vh"
                        readOnly={false}
                      />
                    </EuiFlexItem>
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
                                    onClick={() => {
                                      dispatch(
                                        searchIndex({
                                          apiBody: {
                                            index: values?.search?.index?.name,
                                            body: injectParameters(
                                              queryParams,
                                              tempRequest
                                            ),
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
                                    }}
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
