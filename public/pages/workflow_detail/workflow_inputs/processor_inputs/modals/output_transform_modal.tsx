/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  EuiCompressedSelect,
  EuiSelectOption,
  EuiSmallButton,
  EuiSpacer,
  EuiText,
  EuiPopover,
  EuiSmallButtonEmpty,
  EuiPopoverTitle,
  EuiCodeBlock,
  EuiCallOut,
  EuiIconTip,
} from '@elastic/eui';
import {
  IConfigField,
  IProcessorConfig,
  IngestPipelineConfig,
  JSONPATH_ROOT_SELECTOR,
  ML_INFERENCE_DOCS_LINK,
  ML_INFERENCE_RESPONSE_DOCS_LINK,
  MapArrayFormValue,
  ModelInterface,
  OutputTransformFormValues,
  OutputTransformSchema,
  PROCESSOR_CONTEXT,
  SearchHit,
  SearchPipelineConfig,
  SimulateIngestPipelineResponse,
  WorkflowConfig,
  WorkflowFormValues,
  customStringify,
} from '../../../../../../common';
import {
  formikToPartialPipeline,
  generateTransform,
  getFieldSchema,
  getInitialValue,
  prepareDocsForSimulate,
  unwrapTransformedDocs,
} from '../../../../../utils';
import {
  searchIndex,
  simulatePipeline,
  useAppDispatch,
} from '../../../../../store';
import { getCore } from '../../../../../services';
import { BooleanField, MapArrayField } from '../../input_fields';
import {
  getDataSourceId,
  parseModelOutputs,
  parseModelOutputsObj,
} from '../../../../../utils/utils';

interface OutputTransformModalProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  baseConfigPath: string;
  context: PROCESSOR_CONTEXT;
  outputMapFieldPath: string;
  modelInterface: ModelInterface | undefined;
  onClose: () => void;
}

/**
 * A modal to configure advanced JSON-to-JSON transforms from a model's expected output
 */
export function OutputTransformModal(props: OutputTransformModalProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();

  // sub-form values/schema
  const outputTransformFormValues = {
    output_map: getInitialValue('mapArray'),
    full_response_path: getInitialValue('boolean'),
  } as OutputTransformFormValues;
  const outputTransformFormSchema = yup.object({
    output_map: getFieldSchema({
      type: 'mapArray',
    } as IConfigField),
    full_response_path: getFieldSchema(
      {
        type: 'boolean',
      } as IConfigField,
      true
    ),
  }) as OutputTransformSchema;

  // persist standalone values. update / initialize when it is first opened
  const [tempErrors, setTempErrors] = useState<boolean>(false);
  const [tempFullResponsePath, setTempFullResponsePath] = useState<boolean>(
    false
  );
  const [tempOutputMap, setTempOutputMap] = useState<MapArrayFormValue>([]);

  // fetching input data state
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // source output / transformed output state
  const [sourceOutput, setSourceOutput] = useState<string>('{}');
  const [transformedOutput, setTransformedOutput] = useState<string>('{}');

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

  // popover state containing the model interface details, if applicable
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  // selected transform state
  const transformOptions = tempOutputMap.map((_, idx) => ({
    value: idx,
    text: `Prediction ${idx + 1}`,
  })) as EuiSelectOption[];
  const [selectedTransformOption, setSelectedTransformOption] = useState<
    number
  >((transformOptions[0]?.value as number) ?? 0);

  // hook to re-generate the transform when any inputs to the transform are updated
  useEffect(() => {
    if (!isEmpty(tempOutputMap) && !isEmpty(JSON.parse(sourceOutput))) {
      let sampleSourceOutput = {};
      try {
        sampleSourceOutput = JSON.parse(sourceOutput);
        const output = generateTransform(
          sampleSourceOutput,
          tempOutputMap[selectedTransformOption]
        );
        setTransformedOutput(customStringify(output));
      } catch {}
    } else {
      setTransformedOutput('{}');
    }
  }, [tempOutputMap, sourceOutput, selectedTransformOption]);

  // hook to clear the source output when full_response_path is toggled
  useEffect(() => {
    setSourceOutput('{}');
  }, [tempFullResponsePath]);

  return (
    <Formik
      enableReinitialize={false}
      initialValues={outputTransformFormValues}
      validationSchema={outputTransformFormSchema}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      {(formikProps) => {
        // override to parent form values when changes detected
        useEffect(() => {
          formikProps.setFieldValue(
            'output_map',
            getIn(values, props.outputMapFieldPath)
          );
        }, [getIn(values, props.outputMapFieldPath)]);
        useEffect(() => {
          formikProps.setFieldValue(
            'full_response_path',
            getIn(values, fullResponsePathPath)
          );
        }, [getIn(values, fullResponsePathPath)]);

        // update temp vars when form changes are detected
        useEffect(() => {
          setTempOutputMap(getIn(formikProps.values, 'output_map'));
        }, [getIn(formikProps.values, 'output_map')]);
        useEffect(() => {
          setTempFullResponsePath(
            getIn(formikProps.values, 'full_response_path')
          );
        }, [getIn(formikProps.values, 'full_response_path')]);

        // update tempErrors if errors detected
        useEffect(() => {
          setTempErrors(!isEmpty(formikProps.errors));
        }, [formikProps.errors]);

        const OutputMap = (
          <MapArrayField
            fieldPath={'output_map'}
            helpText={`An array specifying how to map the model’s output to new fields. Dot notation is used by default. To explicitly use JSONPath, please ensure to prepend with the
root object selector "${JSONPATH_ROOT_SELECTOR}"`}
            keyTitle="Name"
            keyPlaceholder="Name"
            keyOptions={
              tempFullResponsePath
                ? undefined
                : parseModelOutputs(props.modelInterface, false)
            }
            valueTitle={
              props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                ? 'Query field'
                : 'New document field'
            }
            valuePlaceholder={
              props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                ? 'Specify a query field'
                : 'Define a document field'
            }
            // If the map we are adding is the first one, populate the selected option to index 0
            onMapAdd={(curArray) => {
              if (isEmpty(curArray)) {
                setSelectedTransformOption(0);
              }
            }}
            // If the map we are deleting is the one we last used to test, reset the state and
            // default to the first map in the list.
            onMapDelete={(idxToDelete) => {
              if (selectedTransformOption === idxToDelete) {
                setSelectedTransformOption(0);
                setTransformedOutput('{}');
              }
            }}
            addMapEntryButtonText="Add output"
            addMapButtonText="Add output group (Advanced)"
            mappingDirection="sortRight"
          />
        );

        const FullResponsePathConfig = (
          <BooleanField
            label={'Full response path'}
            fieldPath={'full_response_path'}
            enabledOption={{
              id: `full_response_path_true`,
              label: 'True',
            }}
            disabledOption={{
              id: `full_response_path_false`,
              label: 'False',
            }}
            showLabel={true}
            helpLink={
              props.context === PROCESSOR_CONTEXT.INGEST
                ? ML_INFERENCE_DOCS_LINK
                : ML_INFERENCE_RESPONSE_DOCS_LINK
            }
            helpText="Parse the full model output"
          />
        );

        const FetchButton = (
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
                  const valuesWithoutOutputMapConfig = cloneDeep(values);
                  set(
                    valuesWithoutOutputMapConfig,
                    props.outputMapFieldPath,
                    []
                  );
                  set(
                    valuesWithoutOutputMapConfig,
                    fullResponsePathPath,
                    getIn(formikProps.values, 'full_response_path')
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
                    .then((resp: SimulateIngestPipelineResponse) => {
                      try {
                        const docObjs = unwrapTransformedDocs(resp);
                        if (docObjs.length > 0) {
                          const sampleModelResult =
                            docObjs[0]?.inference_results || {};
                          setSourceOutput(customStringify(sampleModelResult));
                        }
                      } catch {}
                    })
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
                  const valuesWithoutOutputMapConfig = cloneDeep(values);
                  set(
                    valuesWithoutOutputMapConfig,
                    props.outputMapFieldPath,
                    []
                  );
                  set(
                    valuesWithoutOutputMapConfig,
                    fullResponsePathPath,
                    getIn(formikProps.values, 'full_response_path')
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
                        index: values.ingest.index.name,
                        body: JSON.stringify({
                          ...JSON.parse(values.search.request as string),
                          search_pipeline: curSearchPipeline || {},
                        }),
                      },
                      dataSourceId,
                    })
                  )
                    .unwrap()
                    .then(async (resp) => {
                      const hits = resp.hits.hits.map(
                        (hit: SearchHit) => hit._source
                      ) as any[];
                      if (hits.length > 0) {
                        const sampleModelResult =
                          hits[0].inference_results || {};
                        setSourceOutput(customStringify(sampleModelResult));
                      }
                    })
                    .catch((error: any) => {
                      getCore().notifications.toasts.addDanger(
                        `Failed to fetch source output data`
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
            Fetch data
          </EuiSmallButton>
        );

        const SourceOutput = (
          <EuiCodeEditor
            mode="json"
            theme="textmate"
            width="100%"
            height="15vh"
            value={sourceOutput}
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
        );

        const TransformedOutput = (
          <EuiCodeEditor
            mode="json"
            theme="textmate"
            width="100%"
            height="15vh"
            value={transformedOutput}
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
        );

        return (
          <EuiModal onClose={props.onClose} style={{ width: '100vw' }}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <p>{`Preview output transformation`}</p>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <EuiFlexGroup direction="column">
                <EuiFlexItem>
                  <>
                    <EuiFlexGroup direction="row" gutterSize="xs">
                      <EuiFlexItem grow={false}>
                        <EuiText size="s">
                          <h3>Define transform</h3>
                        </EuiText>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false} style={{ marginTop: '8px' }}>
                        <EuiIconTip
                          content={
                            'Map the model outputs to new document fields'
                          }
                          position="right"
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiSpacer size="s" />
                    {OutputMap}
                  </>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFlexGroup direction="row" gutterSize="xs">
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <h3>Preview</h3>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false} style={{ marginTop: '8px' }}>
                      <EuiIconTip
                        content={
                          'Fetch some sample output data and see how it is transformed'
                        }
                        position="right"
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiFlexItem>
                    <>
                      {(onIngestAndNoDocs || onSearchAndNoQuery) && (
                        <>
                          <EuiCallOut
                            size="s"
                            title={
                              onIngestAndNoDocs
                                ? 'No source documents detected. Fetching is unavailable.'
                                : 'No source query detected. Fetching is unavailable.'
                            }
                            color="warning"
                          />
                          <EuiSpacer size="s" />
                        </>
                      )}
                      {(props.context === PROCESSOR_CONTEXT.INGEST ||
                        props.context ===
                          PROCESSOR_CONTEXT.SEARCH_RESPONSE) && (
                        <>
                          {FullResponsePathConfig}
                          <EuiSpacer size="s" />
                        </>
                      )}
                      {FetchButton}
                    </>
                  </EuiFlexItem>
                  <EuiSpacer size="s" />
                  <EuiFlexGroup direction="row">
                    <EuiFlexItem>
                      <>
                        <EuiFlexItem>
                          <EuiFlexGroup
                            direction="row"
                            justifyContent="spaceBetween"
                          >
                            <EuiFlexItem>
                              <EuiText size="s">
                                Data before transformation
                              </EuiText>
                            </EuiFlexItem>
                            {!isEmpty(
                              parseModelOutputsObj(
                                props.modelInterface,
                                tempFullResponsePath
                              )
                            ) && (
                              <EuiFlexItem grow={false}>
                                <EuiPopover
                                  isOpen={popoverOpen}
                                  closePopover={() => setPopoverOpen(false)}
                                  panelPaddingSize="s"
                                  button={
                                    <EuiSmallButtonEmpty
                                      style={{ marginTop: '-4px' }}
                                      onClick={() =>
                                        setPopoverOpen(!popoverOpen)
                                      }
                                    >
                                      Output schema
                                    </EuiSmallButtonEmpty>
                                  }
                                >
                                  <EuiPopoverTitle>
                                    The JSON Schema defining the model's
                                    expected output
                                  </EuiPopoverTitle>
                                  <EuiCodeBlock
                                    language="json"
                                    fontSize="m"
                                    isCopyable={false}
                                  >
                                    {customStringify(
                                      parseModelOutputsObj(
                                        props.modelInterface,
                                        tempFullResponsePath
                                      )
                                    )}
                                  </EuiCodeBlock>
                                </EuiPopover>
                              </EuiFlexItem>
                            )}
                          </EuiFlexGroup>
                          <EuiSpacer size="s" />
                          {SourceOutput}
                        </EuiFlexItem>
                      </>
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <>
                        {transformOptions.length <= 1 ? (
                          <EuiText size="s">Data after transformation</EuiText>
                        ) : (
                          <EuiCompressedSelect
                            prepend={
                              <EuiText size="s">
                                Data after transformation for
                              </EuiText>
                            }
                            options={transformOptions}
                            value={selectedTransformOption}
                            onChange={(e) => {
                              setSelectedTransformOption(
                                Number(e.target.value)
                              );
                            }}
                          />
                        )}
                        <EuiSpacer size="s" />
                        <EuiSpacer size="s" />

                        {TransformedOutput}
                      </>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiSmallButtonEmpty
                onClick={props.onClose}
                color="primary"
                data-testid="cancelOutputTransformModalButton"
              >
                Cancel
              </EuiSmallButtonEmpty>
              <EuiSmallButton
                onClick={() => {
                  // update the parent form values
                  setFieldValue(
                    fullResponsePathPath,
                    getIn(formikProps.values, 'full_response_path')
                  );
                  setFieldTouched(fullResponsePathPath, true);

                  setFieldValue(
                    props.outputMapFieldPath,
                    getIn(formikProps.values, 'output_map')
                  );
                  setFieldTouched(props.outputMapFieldPath, true);
                  props.onClose();
                }}
                isDisabled={tempErrors} // blocking update until valid input is given
                fill={true}
                color="primary"
                data-testid="updateOutputTransformModalButton"
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
