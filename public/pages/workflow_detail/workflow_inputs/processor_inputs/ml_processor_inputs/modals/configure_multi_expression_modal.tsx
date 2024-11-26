/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useFormikContext, getIn, Formik } from 'formik';
import { cloneDeep, isEmpty, set } from 'lodash';
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
  ExpressionVar,
  IngestPipelineConfig,
  IProcessorConfig,
  MAX_STRING_LENGTH,
  ModelInterface,
  MultiExpressionFormValues,
  MultiExpressionSchema,
  OutputMapEntry,
  PROCESSOR_CONTEXT,
  SearchHit,
  SearchPipelineConfig,
  SimulateIngestPipelineResponse,
  TRANSFORM_CONTEXT,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../../../common';
import {
  formikToPartialPipeline,
  generateTransform,
  getDataSourceId,
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

interface ConfigureMultiExpressionModalProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  context: PROCESSOR_CONTEXT;
  baseConfigPath: string;
  modelInputFieldName: string;
  fieldPath: string;
  modelInterface: ModelInterface | undefined;
  outputMapFieldPath: string;
  onClose: () => void;
}

// Spacing between the input field columns
const KEY_FLEX_RATIO = 6;
const VALUE_FLEX_RATIO = 4;

/**
 * A modal to configure multiple JSONPath expression / transforms.
 */
export function ConfigureMultiExpressionModal(
  props: ConfigureMultiExpressionModalProps
) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();

  // sub-form values/schema
  const expressionsFormValues = {
    expressions: [],
  } as MultiExpressionFormValues;
  const expressionsFormSchema = yup
    .array()
    .of(
      yup.object({
        name: yup
          .string()
          .trim()
          .min(1, 'Too short')
          .max(MAX_STRING_LENGTH, 'Too long')
          .required('Required') as yup.Schema,
        transform: yup
          .string()
          .trim()
          .min(1, 'Too short')
          .max(MAX_STRING_LENGTH, 'Too long')
          .required('Required') as yup.Schema,
      })
    )
    .min(1) as MultiExpressionSchema;

  // persist standalone values. update / initialize when it is first opened
  const [tempExpressions, setTempExpressions] = useState<ExpressionVar[]>([]);
  const [tempErrors, setTempErrors] = useState<boolean>(false);

  // get some current form values
  const fullResponsePathPath = `${props.baseConfigPath}.${props.config.id}.full_response_path`;
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
    const tempExpressionsAsOutputMap = tempExpressions.map(
      (expressionVar) =>
        ({
          key: expressionVar.name || '',
          value: {
            value: expressionVar.transform || '',
          },
        } as OutputMapEntry)
    );
    if (
      !isEmpty(tempExpressionsAsOutputMap) &&
      !isEmpty(JSON.parse(sourceInput))
    ) {
      let sampleSourceInput = {} as {} | [];
      try {
        sampleSourceInput = JSON.parse(sourceInput);
        const output = generateTransform(
          sampleSourceInput,
          tempExpressionsAsOutputMap,
          props.context,
          TRANSFORM_CONTEXT.OUTPUT
        );
        setTransformedInput(customStringify(output));
      } catch {}
    } else {
      setTransformedInput('{}');
    }
  }, [tempExpressions, sourceInput]);

  // if updating, take the temp vars and assign it to the parent form
  function onUpdate() {
    setIsUpdating(true);
    setFieldValue(`${props.fieldPath}.nestedVars`, tempExpressions);
    setFieldTouched(props.fieldPath, true);
    props.onClose();
  }

  return (
    <Formik
      enableReinitialize={false}
      initialValues={expressionsFormValues}
      validationSchema={expressionsFormSchema}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      {(formikProps) => {
        // override to parent form values when changes detected
        useEffect(() => {
          formikProps.setFieldValue(
            'expressions',
            getIn(values, `${props.fieldPath}.nestedVars`)
          );
        }, [getIn(values, props.fieldPath)]);

        // update temp vars when form changes are detected
        useEffect(() => {
          setTempExpressions(getIn(formikProps.values, 'expressions'));
        }, [getIn(formikProps.values, 'expressions')]);

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
                            {`Expressions`}
                          </EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                          <EuiText size="s" color="subdued">
                            {`New document field`}
                          </EuiText>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiSpacer size="s" />
                      <EuiFlexGroup direction="row" gutterSize="m">
                        <EuiFlexItem grow={KEY_FLEX_RATIO}>
                          {/**
                           * TODO: change this to dynamic arr with minimum one entry
                           */}
                          <TextField
                            fullWidth={true}
                            fieldPath={`expressions.0.transform`}
                            placeholder={`$.data`}
                            showError={true}
                          />
                        </EuiFlexItem>
                        <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                          <TextField
                            fullWidth={true}
                            fieldPath={`expressions.0.name`}
                            placeholder={`New document field`}
                            showError={true}
                          />
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
                            disabled={onIngestAndNoDocs || onSearchAndNoQuery}
                            onClick={async () => {
                              setIsFetching(true);
                              switch (props.context) {
                                // note we skip search request processor context. that is because empty output maps are not supported.
                                // for more details, see comment in ml_processor_inputs.tsx
                                case PROCESSOR_CONTEXT.INGEST: {
                                  // get the current ingest pipeline up to, and including this processor.
                                  // remove any currently-configured output map since we only want the transformation
                                  // up to, and including, the input map transformations
                                  const valuesWithoutOutputMapConfig = cloneDeep(
                                    values
                                  );
                                  set(
                                    valuesWithoutOutputMapConfig,
                                    props.outputMapFieldPath,
                                    []
                                  );
                                  set(
                                    valuesWithoutOutputMapConfig,
                                    fullResponsePathPath,
                                    getIn(
                                      formikProps.values,
                                      'full_response_path'
                                    )
                                  );
                                  const curIngestPipeline = formikToPartialPipeline(
                                    valuesWithoutOutputMapConfig,
                                    props.uiConfig,
                                    props.config.id,
                                    true,
                                    PROCESSOR_CONTEXT.INGEST
                                  ) as IngestPipelineConfig;
                                  const curDocs = prepareDocsForSimulate(
                                    values.ingest.docs,
                                    values.ingest.index.name
                                  );
                                  await dispatch(
                                    simulatePipeline({
                                      apiBody: {
                                        pipeline: curIngestPipeline,
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
                                        try {
                                          const docObjs = unwrapTransformedDocs(
                                            resp
                                          );
                                          if (docObjs.length > 0) {
                                            const sampleModelResult =
                                              docObjs[0]?.inference_results ||
                                              {};
                                            setSourceInput(
                                              customStringify(sampleModelResult)
                                            );
                                          }
                                        } catch {}
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
                                  break;
                                }
                                case PROCESSOR_CONTEXT.SEARCH_RESPONSE: {
                                  // get the current search pipeline up to, and including this processor.
                                  // remove any currently-configured output map since we only want the transformation
                                  // up to, and including, the input map transformations
                                  const valuesWithoutOutputMapConfig = cloneDeep(
                                    values
                                  );
                                  set(
                                    valuesWithoutOutputMapConfig,
                                    props.outputMapFieldPath,
                                    []
                                  );
                                  set(
                                    valuesWithoutOutputMapConfig,
                                    fullResponsePathPath,
                                    getIn(
                                      formikProps.values,
                                      'full_response_path'
                                    )
                                  );
                                  const curSearchPipeline = formikToPartialPipeline(
                                    valuesWithoutOutputMapConfig,
                                    props.uiConfig,
                                    props.config.id,
                                    true,
                                    PROCESSOR_CONTEXT.SEARCH_RESPONSE
                                  ) as SearchPipelineConfig;

                                  // Execute search. Augment the existing query with
                                  // the partial search pipeline (inline) to get the latest transformed
                                  // version of the request.
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
                                      const hits = resp?.hits?.hits?.map(
                                        (hit: SearchHit) => hit._source
                                      ) as any[];
                                      if (hits.length > 0) {
                                        const sampleModelResult =
                                          hits[0].inference_results || {};
                                        setSourceInput(
                                          customStringify(sampleModelResult)
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
                data-testid="closeMultiExpressionButton"
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
                data-testid="updateMultiExpressionButton"
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
