/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useFormikContext, getIn, Formik } from 'formik';
import { isEmpty } from 'lodash';
import * as yup from 'yup';
import {
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSmallButton,
  EuiText,
  EuiSmallButtonEmpty,
  EuiSpacer,
} from '@elastic/eui';
import {
  customStringify,
  ExpressionFormValues,
  IngestPipelineConfig,
  InputMapEntry,
  IProcessorConfig,
  MAX_STRING_LENGTH,
  ModelInterface,
  PROCESSOR_CONTEXT,
  SearchHit,
  SimulateIngestPipelineResponse,
  TRANSFORM_CONTEXT,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../../../common';
import {
  formikToPartialPipeline,
  generateArrayTransform,
  generateTransform,
  getDataSourceId,
  getInitialValue,
  prepareDocsForSimulate,
  unwrapTransformedDocs,
} from '../../../../../../utils';
import { TextField } from '../../../input_fields';
import {
  searchIndex,
  simulatePipeline,
  useAppDispatch,
} from '../../../../../../store';
import { getCore } from '../../../../../../services';

interface ConfigureExpressionModalProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  context: PROCESSOR_CONTEXT;
  baseConfigPath: string;
  modelInputFieldName: string;
  fieldPath: string;
  modelInterface: ModelInterface | undefined;
  isDataFetchingAvailable: boolean;
  onClose: () => void;
}

// Spacing between the input field columns
const KEY_FLEX_RATIO = 7;
const VALUE_FLEX_RATIO = 4;

// the max number of input docs we use to display & test transforms with (search response hits)
const MAX_INPUT_DOCS = 10;

/**
 * A modal to configure a JSONPath expression / transform. Used for configuring model input transforms.
 */
export function ConfigureExpressionModal(props: ConfigureExpressionModalProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();

  // sub-form values/schema
  const expressionFormValues = {
    expression: getInitialValue('string'),
  } as ExpressionFormValues;
  const expressionFormSchema = yup.object({
    expression: yup
      .string()
      .trim()
      .min(1, 'Too short')
      .max(MAX_STRING_LENGTH, 'Too long')
      .required('Required') as yup.Schema,
  }) as yup.Schema;

  // persist standalone values. update / initialize when it is first opened
  const [tempExpression, setTempExpression] = useState<string>('');
  const [tempErrors, setTempErrors] = useState<boolean>(false);

  // get some current form values
  const oneToOne = getIn(
    values,
    `${props.baseConfigPath}.${props.config.id}.one_to_one`
  );
  const docs = getIn(values, 'ingest.docs');
  let docObjs = [] as {}[] | undefined;
  try {
    docObjs = JSON.parse(docs);
  } catch {}
  const query = getIn(values, 'search.request');
  let queryObj = {} as {} | undefined;
  try {
    queryObj = JSON.parse(query);
  } catch {}
  const onIngestAndNoDocs =
    props.context === PROCESSOR_CONTEXT.INGEST && isEmpty(docObjs);
  const onSearchAndNoQuery =
    (props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST ||
      props.context === PROCESSOR_CONTEXT.SEARCH_RESPONSE) &&
    isEmpty(queryObj);

  // button updating state
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // source input / transformed input state
  const [sourceInput, setSourceInput] = useState<string>('{}');
  const [transformedInput, setTransformedInput] = useState<string>('{}');

  // fetching input data state
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // hook to re-generate the transform when any inputs to the transform are updated
  useEffect(() => {
    const tempExpressionAsInputMap = [
      {
        key: props.modelInputFieldName,
        value: {
          value: tempExpression,
        },
      } as InputMapEntry,
    ];
    if (!isEmpty(tempExpression) && !isEmpty(JSON.parse(sourceInput))) {
      let sampleSourceInput = {} as {} | [];
      try {
        sampleSourceInput = JSON.parse(sourceInput);
        const output =
          // Edge case: users are collapsing input docs into a single input field when many-to-one is selected
          // fo input transforms on search response processors.
          oneToOne === false &&
          props.context === PROCESSOR_CONTEXT.SEARCH_RESPONSE &&
          Array.isArray(sampleSourceInput)
            ? generateArrayTransform(
                sampleSourceInput as [],
                tempExpressionAsInputMap,
                props.context,
                TRANSFORM_CONTEXT.INPUT,
                queryObj
              )
            : generateTransform(
                sampleSourceInput,
                tempExpressionAsInputMap,
                props.context,
                TRANSFORM_CONTEXT.INPUT,
                queryObj
              );

        setTransformedInput(customStringify(output));
      } catch {}
    } else {
      setTransformedInput('{}');
    }
  }, [tempExpression, sourceInput]);

  // if updating, take the temp vars and assign it to the parent form
  function onUpdate() {
    setIsUpdating(true);
    setFieldValue(`${props.fieldPath}.value`, tempExpression);
    setFieldTouched(props.fieldPath, true);
    props.onClose();
  }

  return (
    <Formik
      enableReinitialize={false}
      initialValues={expressionFormValues}
      validationSchema={expressionFormSchema}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      {(formikProps) => {
        // override to parent form values when changes detected
        useEffect(() => {
          formikProps.setFieldValue(
            'expression',
            getIn(values, `${props.fieldPath}.value`)
          );
        }, [getIn(values, props.fieldPath)]);

        // update temp vars when form changes are detected
        useEffect(() => {
          setTempExpression(getIn(formikProps.values, 'expression'));
        }, [getIn(formikProps.values, 'expression')]);

        // update tempErrors if errors detected
        useEffect(() => {
          setTempErrors(!isEmpty(formikProps.errors));
        }, [formikProps.errors]);

        return (
          <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <p>{`Extract data with expression`}</p>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody style={{ height: '40vh' }}>
              <EuiFlexGroup direction="row">
                <EuiFlexItem grow={5}>
                  <EuiFlexGroup direction="column" gutterSize="xs">
                    <EuiFlexItem grow={false}>
                      <EuiFlexGroup direction="row" gutterSize="m">
                        <EuiFlexItem grow={KEY_FLEX_RATIO}>
                          <EuiText size="s" color="subdued">
                            {`Expression`}
                          </EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                          <EuiText size="s" color="subdued">
                            {`Model input name`}
                          </EuiText>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiSpacer size="s" />
                      <EuiFlexGroup direction="row" gutterSize="m">
                        <EuiFlexItem grow={KEY_FLEX_RATIO}>
                          <TextField
                            fullWidth={true}
                            fieldPath={`expression`}
                            placeholder={`$.data`}
                            showError={true}
                          />
                        </EuiFlexItem>
                        <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                          <EuiText>{props.modelInputFieldName}</EuiText>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiSpacer size="s" />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem grow={4}>
                  <EuiFlexGroup direction="column" gutterSize="xs">
                    <EuiFlexItem grow={false}>
                      <EuiFlexGroup
                        direction="row"
                        justifyContent="spaceAround"
                      >
                        <EuiFlexItem>
                          <EuiText size="m">Preview</EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiSmallButton
                            style={{ width: '100px' }}
                            isLoading={isFetching}
                            disabled={
                              onIngestAndNoDocs ||
                              onSearchAndNoQuery ||
                              !props.isDataFetchingAvailable
                            }
                            onClick={async () => {
                              setIsFetching(true);
                              switch (props.context) {
                                case PROCESSOR_CONTEXT.INGEST: {
                                  // get the current ingest pipeline up to, but not including, this processor
                                  const curIngestPipeline = formikToPartialPipeline(
                                    values,
                                    props.uiConfig,
                                    props.config.id,
                                    false,
                                    PROCESSOR_CONTEXT.INGEST
                                  );
                                  // if there are preceding processors, we need to simulate the partial ingest pipeline,
                                  // in order to get the latest transformed version of the docs
                                  if (curIngestPipeline !== undefined) {
                                    const curDocs = prepareDocsForSimulate(
                                      values.ingest.docs,
                                      values.ingest.index.name
                                    );
                                    await dispatch(
                                      simulatePipeline({
                                        apiBody: {
                                          pipeline: curIngestPipeline as IngestPipelineConfig,
                                          docs: [curDocs[0]],
                                        },
                                        dataSourceId,
                                      })
                                    )
                                      .unwrap()
                                      .then(
                                        (
                                          resp: SimulateIngestPipelineResponse
                                        ) => {
                                          const docObjs = unwrapTransformedDocs(
                                            resp
                                          );
                                          if (docObjs.length > 0) {
                                            setSourceInput(
                                              customStringify(docObjs[0])
                                            );
                                          }
                                        }
                                      )
                                      .catch((error: any) => {
                                        getCore().notifications.toasts.addDanger(
                                          `Failed to fetch input data`
                                        );
                                      })
                                      .finally(() => {
                                        setIsFetching(false);
                                      });
                                  } else {
                                    try {
                                      const docObjs = JSON.parse(
                                        values.ingest.docs
                                      ) as {}[];
                                      if (docObjs.length > 0) {
                                        setSourceInput(
                                          customStringify(docObjs[0])
                                        );
                                      }
                                    } catch {
                                    } finally {
                                      setIsFetching(false);
                                    }
                                  }
                                  break;
                                }
                                case PROCESSOR_CONTEXT.SEARCH_REQUEST: {
                                  // get the current search pipeline up to, but not including, this processor
                                  const curSearchPipeline = formikToPartialPipeline(
                                    values,
                                    props.uiConfig,
                                    props.config.id,
                                    false,
                                    PROCESSOR_CONTEXT.SEARCH_REQUEST
                                  );
                                  // if there are preceding processors, we cannot generate. The button to render
                                  // this modal should be disabled if the search pipeline would be enabled. We add
                                  // this if check as an extra layer of checking, and if mechanism for gating
                                  // this is changed in the future.
                                  if (curSearchPipeline === undefined) {
                                    setSourceInput(values.search.request);
                                  }
                                  setIsFetching(false);
                                  break;
                                }
                                case PROCESSOR_CONTEXT.SEARCH_RESPONSE: {
                                  // get the current search pipeline up to, but not including, this processor
                                  const curSearchPipeline = formikToPartialPipeline(
                                    values,
                                    props.uiConfig,
                                    props.config.id,
                                    false,
                                    PROCESSOR_CONTEXT.SEARCH_RESPONSE
                                  );
                                  // Execute search. If there are preceding processors, augment the existing query with
                                  // the partial search pipeline (inline) to get the latest transformed version of the response.
                                  dispatch(
                                    searchIndex({
                                      apiBody: {
                                        index: values.search.index.name,
                                        body: JSON.stringify({
                                          ...JSON.parse(
                                            values.search.request as string
                                          ),
                                          search_pipeline:
                                            curSearchPipeline || {},
                                        }),
                                      },
                                      dataSourceId,
                                    })
                                  )
                                    .unwrap()
                                    .then(async (resp) => {
                                      const hits = resp?.hits?.hits
                                        ?.map((hit: SearchHit) => hit._source)
                                        .slice(0, MAX_INPUT_DOCS);
                                      if (hits.length > 0) {
                                        setSourceInput(
                                          // if one-to-one, treat the source input as a single retrieved document
                                          // else, treat it as all of the returned documents
                                          customStringify(
                                            oneToOne ? hits[0] : hits
                                          )
                                        );
                                      }
                                    })
                                    .catch((error: any) => {
                                      getCore().notifications.toasts.addDanger(
                                        `Failed to fetch source input data`
                                      );
                                    })
                                    .finally(() => {
                                      setIsFetching(false);
                                    });
                                  break;
                                }
                              }
                            }}
                          >
                            Run preview
                          </EuiSmallButton>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">Source data</EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiCodeEditor
                        mode="json"
                        theme="textmate"
                        width="100%"
                        height="15vh"
                        value={sourceInput}
                        readOnly={true}
                        setOptions={{
                          fontSize: '12px',
                          autoScrollEditorIntoView: true,
                          showLineNumbers: false,
                          showGutter: false,
                          showPrintMargin: false,
                          wrap: true,
                        }}
                        tabSize={2}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">Extracted data</EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiCodeEditor
                        mode="json"
                        theme="textmate"
                        width="100%"
                        height="15vh"
                        value={transformedInput}
                        readOnly={true}
                        setOptions={{
                          fontSize: '12px',
                          autoScrollEditorIntoView: true,
                          showLineNumbers: false,
                          showGutter: false,
                          showPrintMargin: false,
                          wrap: true,
                        }}
                        tabSize={2}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiSmallButtonEmpty
                onClick={props.onClose}
                color="primary"
                data-testid="closeExpressionButton"
              >
                Cancel
              </EuiSmallButtonEmpty>
              <EuiSmallButton
                onClick={() => {
                  formikProps
                    .submitForm()
                    .then((value: any) => {
                      onUpdate();
                    })
                    .catch((err: any) => {});
                }}
                isLoading={isUpdating}
                isDisabled={tempErrors} // blocking update until valid input is given
                fill={true}
                color="primary"
                data-testid="updateExpressionButton"
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
