/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFormikContext, getIn, Formik } from 'formik';
import { isEmpty } from 'lodash';
import Ajv from 'ajv';
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
  EuiCodeBlock,
  EuiPopoverTitle,
  EuiIconTip,
  EuiCompressedSwitch,
  EuiCallOut,
} from '@elastic/eui';
import {
  IConfigField,
  IProcessorConfig,
  IngestPipelineConfig,
  InputTransformFormValues,
  InputTransformSchema,
  JSONPATH_ROOT_SELECTOR,
  ML_INFERENCE_RESPONSE_DOCS_LINK,
  MapArrayFormValue,
  ModelInterface,
  PROCESSOR_CONTEXT,
  SearchHit,
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
import {
  generateArrayTransform,
  getDataSourceId,
  parseModelInputs,
  parseModelInputsObj,
} from '../../../../../utils/utils';
import { BooleanField, MapArrayField } from '../../input_fields';

interface InputTransformModalProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  baseConfigPath: string;
  context: PROCESSOR_CONTEXT;
  inputMapFieldPath: string;
  modelInterface: ModelInterface | undefined;
  valueOptions: { label: string }[];
  onClose: () => void;
}

// the max number of input docs we use to display & test transforms with (search response hits)
const MAX_INPUT_DOCS = 10;

/**
 * A modal to configure advanced JSON-to-JSON transforms into a model's expected input
 */
export function InputTransformModal(props: InputTransformModalProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();

  // sub-form values/schema
  const inputTransformFormValues = {
    input_map: getInitialValue('mapArray'),
    one_to_one: getInitialValue('boolean'),
  } as InputTransformFormValues;
  const inputTransformFormSchema = yup.object({
    input_map: getFieldSchema({
      type: 'mapArray',
    } as IConfigField),
    one_to_one: getFieldSchema(
      {
        type: 'boolean',
      } as IConfigField,
      true
    ),
  }) as InputTransformSchema;

  // persist standalone values. update / initialize when it is first opened
  const [tempErrors, setTempErrors] = useState<boolean>(false);
  const [tempOneToOne, setTempOneToOne] = useState<boolean>(false);
  const [tempInputMap, setTempInputMap] = useState<MapArrayFormValue>([]);

  // various prompt states
  const [viewPromptDetails, setViewPromptDetails] = useState<boolean>(false);
  const [viewTransformedPrompt, setViewTransformedPrompt] = useState<boolean>(
    false
  );
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [transformedPrompt, setTransformedPrompt] = useState<string>('');

  // fetching input data state
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // source input / transformed input state
  const [sourceInput, setSourceInput] = useState<string>('{}');
  const [transformedInput, setTransformedInput] = useState<string>('{}');

  // get some current form values
  const oneToOnePath = `${props.baseConfigPath}.${props.config.id}.one_to_one`;
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

  // selected transform state
  const transformOptions = tempInputMap.map((_, idx) => ({
    value: idx,
    text: `Prediction ${idx + 1}`,
  })) as EuiSelectOption[];
  const [selectedTransformOption, setSelectedTransformOption] = useState<
    number
  >((transformOptions[0]?.value as number) ?? 0);

  // popover state containing the model interface details, if applicable
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  // validation state utilizing the model interface, if applicable. undefined if
  // there is no model interface and/or no source input
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);

  const description =
    props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
      ? 'Fetch an input query and see how it is transformed.'
      : props.context === PROCESSOR_CONTEXT.INGEST
      ? 'Fetch a sample document and see how it is transformed'
      : `Fetch some returned documents (up to ${MAX_INPUT_DOCS}) and see how they are transformed.`;

  // hook to re-generate the transform when any inputs to the transform are updated
  useEffect(() => {
    if (!isEmpty(tempInputMap) && !isEmpty(JSON.parse(sourceInput))) {
      let sampleSourceInput = {} as {} | [];
      try {
        sampleSourceInput = JSON.parse(sourceInput);
        const output =
          // Edge case: users are collapsing input docs into a single input field when many-to-one is selected
          // fo input transforms on search response processors.
          tempOneToOne === false &&
          props.context === PROCESSOR_CONTEXT.SEARCH_RESPONSE &&
          Array.isArray(sampleSourceInput)
            ? generateArrayTransform(
                sampleSourceInput as [],
                tempInputMap[selectedTransformOption]
              )
            : generateTransform(
                sampleSourceInput,
                tempInputMap[selectedTransformOption]
              );

        setTransformedInput(customStringify(output));
      } catch {}
    } else {
      setTransformedInput('{}');
    }
  }, [tempInputMap, sourceInput, selectedTransformOption]);

  // hook to re-determine validity when the generated output changes
  // utilize Ajv JSON schema validator library. For more info/examples, see
  // https://www.npmjs.com/package/ajv
  useEffect(() => {
    if (
      !isEmpty(JSON.parse(sourceInput)) &&
      !isEmpty(props.modelInterface?.input?.properties?.parameters)
    ) {
      const validateFn = new Ajv().compile(
        props.modelInterface?.input?.properties?.parameters || {}
      );
      setIsValid(validateFn(JSON.parse(transformedInput)));
    } else {
      setIsValid(undefined);
    }
  }, [transformedInput]);

  // hook to set the prompt if found in the model config
  useEffect(() => {
    const modelConfigString = getIn(
      values,
      `${props.baseConfigPath}.${props.config.id}.model_config`
    );
    try {
      const prompt = JSON.parse(modelConfigString)?.prompt;
      if (!isEmpty(prompt)) {
        setOriginalPrompt(prompt);
      }
    } catch {}
  }, [
    getIn(values, `${props.baseConfigPath}.${props.config.id}.model_config`),
  ]);

  // hook to set the transformed prompt, if a valid prompt found, and
  // valid parameters set
  useEffect(() => {
    const transformedInputObj = JSON.parse(transformedInput);
    if (!isEmpty(originalPrompt) && !isEmpty(transformedInputObj)) {
      setTransformedPrompt(
        injectValuesIntoPrompt(originalPrompt, transformedInputObj)
      );
      setViewPromptDetails(true);
      setViewTransformedPrompt(true);
    } else {
      setViewPromptDetails(false);
      setViewTransformedPrompt(false);
      setTransformedPrompt(originalPrompt);
    }
  }, [originalPrompt, transformedInput]);

  // hook to clear the source input when one_to_one is toggled
  useEffect(() => {
    setSourceInput('{}');
  }, [tempOneToOne]);

  return (
    <Formik
      enableReinitialize={false}
      initialValues={inputTransformFormValues}
      validationSchema={inputTransformFormSchema}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      {(formikProps) => {
        // override to parent form values when changes detected
        useEffect(() => {
          formikProps.setFieldValue(
            'input_map',
            getIn(values, props.inputMapFieldPath)
          );
        }, [getIn(values, props.inputMapFieldPath)]);
        useEffect(() => {
          formikProps.setFieldValue('one_to_one', getIn(values, oneToOnePath));
        }, [getIn(values, oneToOnePath)]);

        // update temp vars when form changes are detected
        useEffect(() => {
          setTempInputMap(getIn(formikProps.values, 'input_map'));
        }, [getIn(formikProps.values, 'input_map')]);
        useEffect(() => {
          setTempOneToOne(getIn(formikProps.values, 'one_to_one'));
        }, [getIn(formikProps.values, 'one_to_one')]);

        // update tempErrors if errors detected
        useEffect(() => {
          setTempErrors(!isEmpty(formikProps.errors));
        }, [formikProps.errors]);

        const InputMap = (
          <MapArrayField
            fieldPath={'input_map'}
            helpText={`An array specifying how to map fields from the ingested document to the model’s input. Dot notation is used by default. To explicitly use JSONPath, please ensure to prepend with the
        root object selector "${JSONPATH_ROOT_SELECTOR}"`}
            keyTitle="Name"
            keyPlaceholder="Name"
            keyOptions={parseModelInputs(props.modelInterface)}
            valueTitle={
              props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                ? 'Query field'
                : 'Document field'
            }
            valuePlaceholder={
              props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                ? 'Specify a query field'
                : 'Define a document field'
            }
            valueOptions={props.valueOptions}
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
                setTransformedInput('{}');
              }
            }}
            addMapEntryButtonText="Add input"
            addMapButtonText="Add input group (Advanced)"
            mappingDirection="sortLeft"
          />
        );

        const OneToOneConfig = (
          <BooleanField
            label={'One-to-one'}
            fieldPath={'one_to_one'}
            enabledOption={{
              id: `one_to_one_true`,
              label: 'True',
            }}
            disabledOption={{
              id: `one_to_one_false`,
              label: 'False',
            }}
            showLabel={true}
            helpLink={ML_INFERENCE_RESPONSE_DOCS_LINK}
            helpText="Run inference for each document separately"
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
                      .then((resp: SimulateIngestPipelineResponse) => {
                        const docObjs = unwrapTransformedDocs(resp);
                        if (docObjs.length > 0) {
                          setSourceInput(customStringify(docObjs[0]));
                        }
                      })
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
                      const docObjs = JSON.parse(values.ingest.docs) as {}[];
                      if (docObjs.length > 0) {
                        setSourceInput(customStringify(docObjs[0]));
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
                          ...JSON.parse(values.search.request as string),
                          search_pipeline: curSearchPipeline || {},
                        }),
                      },
                      dataSourceId,
                    })
                  )
                    .unwrap()
                    .then(async (resp) => {
                      const hits = resp.hits.hits
                        .map((hit: SearchHit) => hit._source)
                        .slice(0, MAX_INPUT_DOCS);
                      if (hits.length > 0) {
                        setSourceInput(
                          // if one-to-one, treat the source input as a single retrieved document
                          // else, treat it as all of the returned documents
                          customStringify(tempOneToOne ? hits[0] : hits)
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
            Fetch data
          </EuiSmallButton>
        );

        const SourceInput = (
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
        );

        const TransformedInput = (
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
        );

        return (
          <EuiModal onClose={props.onClose} style={{ width: '100vw' }}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <p>{`Preview input transformation`}</p>
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
                          content={'Map the source input to the model inputs'}
                          position="right"
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiSpacer size="s" />
                    {InputMap}
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
                      <EuiIconTip content={description} position="right" />
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
                      {props.context === PROCESSOR_CONTEXT.SEARCH_RESPONSE && (
                        <>
                          {OneToOneConfig}
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
                        <EuiFlexGroup
                          direction="row"
                          justifyContent="spaceBetween"
                        >
                          <EuiFlexItem>
                            <EuiText size="s">
                              Data before transformation
                            </EuiText>
                          </EuiFlexItem>
                        </EuiFlexGroup>
                        <EuiSpacer size="s" />
                        {SourceInput}
                      </>
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <>
                        <EuiFlexGroup
                          direction="row"
                          justifyContent="spaceBetween"
                        >
                          {isValid !== undefined && (
                            <EuiFlexItem
                              grow={false}
                              style={{
                                marginTop: '16px',
                                marginLeft: '8px',
                                marginRight: '-8px',
                              }}
                            >
                              <EuiIconTip
                                type={isValid ? 'check' : 'cross'}
                                color={isValid ? 'success' : 'danger'}
                                size="m"
                                content={
                                  isValid
                                    ? 'Meets model interface requirements'
                                    : 'Does not meet model interface requirements'
                                }
                              />
                            </EuiFlexItem>
                          )}
                          <EuiFlexItem grow={true}>
                            {transformOptions.length <= 1 ? (
                              <EuiText size="s">
                                Data after transformation
                              </EuiText>
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
                          </EuiFlexItem>
                          {!isEmpty(
                            parseModelInputsObj(props.modelInterface)
                          ) && (
                            <EuiFlexItem grow={false}>
                              <EuiPopover
                                isOpen={popoverOpen}
                                closePopover={() => setPopoverOpen(false)}
                                panelPaddingSize="s"
                                button={
                                  <EuiSmallButtonEmpty
                                    style={{ marginTop: '-4px' }}
                                    onClick={() => setPopoverOpen(!popoverOpen)}
                                  >
                                    Input schema
                                  </EuiSmallButtonEmpty>
                                }
                              >
                                <EuiPopoverTitle>
                                  The JSON Schema defining the model's expected
                                  input
                                </EuiPopoverTitle>
                                <EuiCodeBlock
                                  language="json"
                                  fontSize="m"
                                  isCopyable={false}
                                >
                                  {customStringify(
                                    parseModelInputsObj(props.modelInterface)
                                  )}
                                </EuiCodeBlock>
                              </EuiPopover>
                            </EuiFlexItem>
                          )}
                        </EuiFlexGroup>
                        <EuiSpacer size="s" />
                        {TransformedInput}
                      </>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                {!isEmpty(originalPrompt) && (
                  <EuiFlexItem>
                    <>
                      <EuiFlexGroup direction="row">
                        <EuiFlexItem grow={false}>
                          <EuiText size="s">Transformed prompt</EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ marginTop: '16px' }}>
                          <EuiCompressedSwitch
                            label="Show"
                            checked={viewPromptDetails}
                            onChange={() =>
                              setViewPromptDetails(!viewPromptDetails)
                            }
                            disabled={isEmpty(JSON.parse(transformedInput))}
                          />
                        </EuiFlexItem>
                        {isEmpty(JSON.parse(transformedInput)) && (
                          <EuiFlexItem grow={false}>
                            <EuiText size="s" color="subdued">
                              Transformed input is empty
                            </EuiText>
                          </EuiFlexItem>
                        )}
                      </EuiFlexGroup>
                      {viewPromptDetails && (
                        <>
                          <EuiSpacer size="s" />
                          <EuiCompressedSwitch
                            label="With transformed inputs"
                            checked={viewTransformedPrompt}
                            onChange={() =>
                              setViewTransformedPrompt(!viewTransformedPrompt)
                            }
                          />
                          <EuiSpacer size="m" />
                          <EuiCodeEditor
                            mode="json"
                            theme="textmate"
                            width="100%"
                            height="15vh"
                            value={
                              viewTransformedPrompt
                                ? transformedPrompt
                                : originalPrompt
                            }
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
                        </>
                      )}
                    </>
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiSmallButtonEmpty
                onClick={props.onClose}
                color="primary"
                data-testid="cancelInputTransformModalButton"
              >
                Cancel
              </EuiSmallButtonEmpty>
              <EuiSmallButton
                onClick={() => {
                  // update the parent form values
                  if (props.context === PROCESSOR_CONTEXT.SEARCH_RESPONSE) {
                    setFieldValue(
                      oneToOnePath,
                      getIn(formikProps.values, 'one_to_one')
                    );
                    setFieldTouched(oneToOnePath, true);
                  }
                  setFieldValue(
                    props.inputMapFieldPath,
                    getIn(formikProps.values, 'input_map')
                  );
                  setFieldTouched(props.inputMapFieldPath, true);
                  props.onClose();
                }}
                isDisabled={tempErrors} // blocking update until valid input is given
                fill={true}
                color="primary"
                data-testid="updateInputTransformModalButton"
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

function injectValuesIntoPrompt(
  promptString: string,
  parameters: { [key: string]: string }
): string {
  let finalPromptString = promptString;
  // replace any parameter placeholders in the prompt with any values found in the
  // parameters obj.
  // we do 2 checks - one for the regular prompt, and one with "toString()" appended.
  // this is required for parameters that have values as a list, for example.
  Object.keys(parameters).forEach((parameterKey) => {
    const parameterValue = parameters[parameterKey];
    const regex = new RegExp(`\\$\\{parameters.${parameterKey}\\}`, 'g');
    const regexWithToString = new RegExp(
      `\\$\\{parameters.${parameterKey}.toString\\(\\)\\}`,
      'g'
    );
    finalPromptString = finalPromptString
      .replace(regex, parameterValue)
      .replace(regexWithToString, parameterValue);
  });

  return finalPromptString;
}
