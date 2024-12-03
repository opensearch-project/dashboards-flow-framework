/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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
  EuiCodeEditor,
  EuiEmptyPrompt,
  EuiCallOut,
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import {
  customStringify,
  IConfigField,
  QUERY_PRESETS,
  QueryParam,
  QueryPreset,
  RequestFormValues,
  SearchHit,
  WorkflowFormValues,
} from '../../../../../common';
import {
  containsSameValues,
  getDataSourceId,
  getFieldSchema,
  getInitialValue,
  getPlaceholdersFromQuery,
  injectParameters,
} from '../../../../utils';
import { searchIndex, useAppDispatch } from '../../../../store';
import { QueryParamsList } from '../../../../general_components';

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

  // results state
  const [tempResults, setTempResults] = useState<string>('');
  const [tempResultsError, setTempResultsError] = useState<string>('');

  // query/request params state. Re-generate when the request has been updated,
  // and if there are a new set of parameters
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);

  // Do a few things when the request is changed:
  // 1. Check if there is a new set of query parameters, and if so,
  //    reset the form.
  // 2. Clear any persisted error
  useEffect(() => {
    const placeholders = getPlaceholdersFromQuery(tempRequest);
    if (
      !containsSameValues(
        placeholders,
        queryParams.map((queryParam) => queryParam.name)
      )
    ) {
      setQueryParams(
        placeholders.map((placeholder) => ({ name: placeholder, value: '' }))
      );
    }
    setTempResultsError('');
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
            style={{ width: '70vw' }}
            data-testid="editQueryModal"
          >
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <p>{`Edit query definition`}</p>
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
                                          preset.query
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
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <JsonField
                        label="Query"
                        fieldPath={'request'}
                        editorHeight="25vh"
                        readOnly={false}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
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
                        <EuiFlexItem grow={false}>
                          <EuiSmallButton
                            fill={false}
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
                                .then(async (resp) => {
                                  setTempResults(
                                    customStringify(
                                      resp?.hits?.hits?.map(
                                        (hit: SearchHit) => hit._source
                                      )
                                    )
                                  );
                                  setTempResultsError('');
                                })
                                .catch((error: any) => {
                                  setTempResults('');
                                  const errorMsg = `Error running query: ${error}`;
                                  setTempResultsError(errorMsg);
                                  console.error(errorMsg);
                                });
                            }}
                          >
                            Search
                          </EuiSmallButton>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    {/**
                     * Note: this may return nothing if the list of params are empty
                     */}
                    <QueryParamsList
                      queryParams={queryParams}
                      setQueryParams={setQueryParams}
                    />
                    <EuiFlexItem>
                      <>
                        <EuiText size="s">Results</EuiText>
                        {isEmpty(tempResults) && isEmpty(tempResultsError) ? (
                          <EuiEmptyPrompt
                            title={<h2>No results</h2>}
                            titleSize="s"
                            body={
                              <>
                                <EuiText size="s">
                                  Run search to view results.
                                </EuiText>
                              </>
                            }
                          />
                        ) : !isEmpty(tempResultsError) ? (
                          <EuiCallOut color="danger" title={tempResultsError} />
                        ) : (
                          <EuiCodeEditor
                            mode="json"
                            theme="textmate"
                            width="100%"
                            height="100%"
                            value={tempResults}
                            readOnly={true}
                            setOptions={{
                              fontSize: '12px',
                              autoScrollEditorIntoView: true,
                              wrap: true,
                            }}
                            tabSize={2}
                          />
                        )}
                      </>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
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
                Save
              </EuiSmallButton>
            </EuiModalFooter>
          </EuiModal>
        );
      }}
    </Formik>
  );
}
