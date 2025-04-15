/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFormikContext, getIn, Field, FieldProps } from 'formik';
import { isEmpty, isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { flattie } from 'flattie';
import {
  EuiCallOut,
  EuiCompressedFormRow,
  EuiCompressedSuperSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiSmallButtonIcon,
  EuiSpacer,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui';
import {
  IProcessorConfig,
  IConfigField,
  PROCESSOR_CONTEXT,
  WorkflowFormValues,
  ModelInterface,
  IndexMappings,
  InputMapEntry,
  InputMapFormValue,
  Transform,
  TRANSFORM_TYPE,
  EMPTY_INPUT_MAP_ENTRY,
  WorkflowConfig,
  getCharacterLimitedString,
  INPUT_TRANSFORM_OPTIONS,
  MapCache,
} from '../../../../../../common';
import {
  TextField,
  SelectWithCustomOptions,
  BooleanField,
} from '../../input_fields';
import { AppState, getMappings, useAppDispatch } from '../../../../../store';
import {
  getDataSourceId,
  getObjsFromJSONLines,
  sanitizeJSONPath,
} from '../../../../../utils';
import { ConfigureExpressionModal, ConfigureTemplateModal } from './modals/';
import { updateCache } from './utils';

interface ModelInputsProps {
  config: IProcessorConfig;
  baseConfigPath: string;
  uiConfig: WorkflowConfig;
  context: PROCESSOR_CONTEXT;
  isDataFetchingAvailable: boolean;
}

// Spacing between the input field columns
const KEY_FLEX_RATIO = 3;
const TYPE_FLEX_RATIO = 3;
const VALUE_FLEX_RATIO = 4;

/**
 * Base component to configure ML inputs.
 */
export function ModelInputs(props: ModelInputsProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { models } = useSelector((state: AppState) => state.ml);
  const indices = useSelector((state: AppState) => state.opensearch.indices);
  const {
    setFieldValue,
    setFieldTouched,
    errors,
    touched,
    values,
    initialValues,
  } = useFormikContext<WorkflowFormValues>();
  // get some current form & config values
  const modelField = props.config.fields.find(
    (field) => field.type === 'model'
  ) as IConfigField;
  const modelFieldPath = `${props.baseConfigPath}.${props.config.id}.${modelField.id}`;
  const oneToOnePath = `${props.baseConfigPath}.${props.config.id}.one_to_one`;
  const oneToOneChanged = !isEqual(
    getIn(values, oneToOnePath),
    getIn(initialValues, oneToOnePath)
  );

  // Assuming no more than one set of input map entries.
  const inputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.input_map.0`;

  // model interface state
  const [modelInterface, setModelInterface] = useState<
    ModelInterface | undefined
  >(undefined);

  // get the model interface based on the selected ID and list of known models
  useEffect(() => {
    if (!isEmpty(models)) {
      const modelId = getIn(values, modelFieldPath)?.id;
      if (modelId) {
        setModelInterface(models[modelId]?.interface);
      }
    }
  }, [models, getIn(values, modelFieldPath)?.id]);

  // various modal states
  const [templateModalIdx, setTemplateModalIdx] = useState<number | undefined>(
    undefined
  );
  const [expressionModalIdx, setExpressionModalIdx] = useState<
    number | undefined
  >(undefined);

  // Temporarily cache any configured transformations for different transform types.
  // For example, if a user configures a prompt, swaps the transform
  // type to "Data field", and swaps back to "Prompt", the prompt will be persisted.
  const [inputMapCache, setInputMapCache] = useState<MapCache>({});

  // persisting doc/query/index mapping fields to collect a list
  // of options to display in the dropdowns when configuring input / output maps
  const [docFields, setDocFields] = useState<{ label: string }[]>([]);
  const [queryFields, setQueryFields] = useState<{ label: string }[]>([]);
  const [indexMappingFields, setIndexMappingFields] = useState<
    { label: string }[]
  >([]);
  useEffect(() => {
    try {
      const ingestDocsObjs = getObjsFromJSONLines(
        getIn(values, 'ingest.docs', '')
      );
      const docObjKeys = Object.keys(flattie(ingestDocsObjs[0]));
      if (docObjKeys.length > 0) {
        setDocFields(
          docObjKeys.map((key) => {
            return {
              label:
                // ingest inputs can handle dot notation, and hence don't need
                // sanitizing to handle JSONPath edge cases. The other contexts
                // only support JSONPath, and hence need some post-processing/sanitizing.
                props.context === PROCESSOR_CONTEXT.INGEST
                  ? key
                  : sanitizeJSONPath(key),
            };
          })
        );
      } else {
        setDocFields([]);
      }
    } catch {}
  }, [values?.ingest?.docs]);
  useEffect(() => {
    try {
      const queryObjKeys = Object.keys(
        flattie(JSON.parse(values.search.request))
      );
      if (queryObjKeys.length > 0) {
        setQueryFields(
          queryObjKeys.map((key) => {
            return {
              label:
                // ingest inputs can handle dot notation, and hence don't need
                // sanitizing to handle JSONPath edge cases. The other contexts
                // only support JSONPath, and hence need some post-processing/sanitizing.
                props.context === PROCESSOR_CONTEXT.INGEST
                  ? key
                  : sanitizeJSONPath(key),
            };
          })
        );
      }
    } catch {}
  }, [values?.search?.request]);

  useEffect(() => {
    const indexName = values?.search?.index?.name as string | undefined;
    if (indexName !== undefined && indices[indexName] !== undefined) {
      dispatch(
        getMappings({
          index: indexName,
          dataSourceId,
        })
      )
        .unwrap()
        .then((resp: IndexMappings) => {
          const mappingsObjKeys = Object.keys(resp.properties);
          if (mappingsObjKeys.length > 0) {
            setIndexMappingFields(
              mappingsObjKeys.map((key) => {
                return {
                  label: key,
                  type: resp.properties[key]?.type,
                };
              })
            );
          }
        });
    }
  }, [values?.search?.index?.name]);

  // Adding a map entry to the end of the existing arr
  function addMapEntry(curEntries: InputMapFormValue): void {
    const updatedEntries = [...curEntries, EMPTY_INPUT_MAP_ENTRY];
    setFieldValue(inputMapFieldPath, updatedEntries);
    setFieldTouched(inputMapFieldPath, true);
  }

  // Deleting a map entry
  function deleteMapEntry(
    curEntries: InputMapFormValue,
    entryIndexToDelete: number
  ): void {
    const updatedEntries = [...curEntries];
    updatedEntries.splice(entryIndexToDelete, 1);
    setFieldValue(inputMapFieldPath, updatedEntries);
    setFieldTouched(inputMapFieldPath, true);
  }

  const valueOptions =
    props.context === PROCESSOR_CONTEXT.INGEST
      ? docFields
      : props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
      ? queryFields
      : indexMappingFields;

  return (
    <Field name={inputMapFieldPath} key={inputMapFieldPath}>
      {({ field, form }: FieldProps) => {
        const populatedMap = field.value?.length !== 0;
        return (
          <>
            {populatedMap ? (
              <EuiPanel>
                {props.context === PROCESSOR_CONTEXT.SEARCH_RESPONSE && (
                  <>
                    <BooleanField
                      fieldPath={oneToOnePath}
                      label="Merge source data"
                      type="Switch"
                      inverse={true}
                      helpText="Merge multiple documents into a single document for model processing. To process only one document, turn off merge source data."
                    />
                    <EuiSpacer size="s" />
                    {oneToOneChanged && (
                      <>
                        <EuiCallOut
                          size="s"
                          color="warning"
                          iconType={'alert'}
                          title={
                            <EuiText size="s">
                              You have changed how source data will be
                              processed. You may need to update any existing
                              input values to reflect the updated data
                              structure.
                            </EuiText>
                          }
                        />
                        <EuiSpacer size="s" />
                      </>
                    )}
                  </>
                )}
                <EuiCompressedFormRow
                  fullWidth={true}
                  key={inputMapFieldPath}
                  error={
                    getIn(errors, field.name) !== undefined &&
                    getIn(errors, field.name).length > 0
                      ? 'Invalid or missing mapping values'
                      : false
                  }
                  isInvalid={
                    getIn(errors, field.name) !== undefined &&
                    getIn(errors, field.name).length > 0 &&
                    getIn(touched, field.name) !== undefined &&
                    getIn(touched, field.name).length > 0
                  }
                >
                  <EuiFlexGroup direction="column">
                    <EuiFlexItem style={{ marginBottom: '0px' }}>
                      <EuiFlexGroup direction="row" gutterSize="xs">
                        <EuiFlexItem grow={KEY_FLEX_RATIO}>
                          <EuiFlexGroup direction="row" gutterSize="xs">
                            <EuiFlexItem grow={false}>
                              <EuiText size="s">{`Model input`}</EuiText>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiFlexItem>
                        <EuiFlexItem grow={TYPE_FLEX_RATIO}>
                          <EuiFlexGroup direction="row" gutterSize="xs">
                            <EuiFlexItem grow={false}>
                              <EuiText size="s">{`Transformation type`}</EuiText>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiFlexItem>
                        <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                          <EuiFlexGroup direction="row" gutterSize="xs">
                            <EuiFlexItem grow={false}>
                              <EuiText size="s">Value</EuiText>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    {field.value?.map(
                      (mapEntry: InputMapEntry, idx: number) => {
                        const transformType = getIn(
                          values,
                          `${inputMapFieldPath}.${idx}.value.transformType`
                        );
                        return (
                          <EuiFlexItem key={idx}>
                            <EuiFlexGroup direction="row" gutterSize="xs">
                              <EuiFlexItem grow={KEY_FLEX_RATIO}>
                                <EuiFlexGroup direction="row" gutterSize="xs">
                                  <>
                                    <EuiFlexItem>
                                      <>
                                        {/**
                                         * If there is a model interface, display the field name.
                                         * Otherwise, leave as a free-form text box for a user to enter manually.
                                         */}
                                        {!isEmpty(modelInterface) ? (
                                          <EuiText
                                            size="s"
                                            style={{ marginTop: '4px' }}
                                          >
                                            {getIn(
                                              values,
                                              `${inputMapFieldPath}.${idx}.key`
                                            )}
                                          </EuiText>
                                        ) : (
                                          <TextField
                                            fullWidth={true}
                                            fieldPath={`${inputMapFieldPath}.${idx}.key`}
                                            placeholder={`Name`}
                                            showError={false}
                                          />
                                        )}
                                      </>
                                    </EuiFlexItem>
                                  </>
                                </EuiFlexGroup>
                              </EuiFlexItem>
                              <EuiFlexItem grow={TYPE_FLEX_RATIO}>
                                <EuiFlexItem>
                                  <EuiCompressedSuperSelect
                                    fullWidth={true}
                                    disabled={false}
                                    options={INPUT_TRANSFORM_OPTIONS.map(
                                      (option) =>
                                        ({
                                          value: option.id,
                                          inputDisplay: (
                                            <>
                                              <EuiText size="s">
                                                {option.id}
                                              </EuiText>
                                            </>
                                          ),
                                          dropdownDisplay: (
                                            <>
                                              <EuiText size="s">
                                                {option.id}
                                              </EuiText>
                                              <EuiText
                                                size="xs"
                                                color="subdued"
                                              >
                                                {option.description}
                                              </EuiText>
                                            </>
                                          ),
                                          disabled: false,
                                        } as EuiSuperSelectOption<string>)
                                    )}
                                    valueOfSelected={
                                      getIn(
                                        values,
                                        `${inputMapFieldPath}.${idx}.value.transformType`
                                      ) || ''
                                    }
                                    onChange={(option) => {
                                      // before updating, cache any form values
                                      const updatedCache = updateCache(
                                        inputMapCache,
                                        mapEntry,
                                        idx
                                      );
                                      setFieldValue(
                                        `${inputMapFieldPath}.${idx}.value.transformType`,
                                        option
                                      );
                                      // Pre-populate with any cached values, if found
                                      const curCacheForOption = updatedCache[
                                        idx
                                      ]?.find(
                                        (transform: Transform) =>
                                          transform.transformType === option
                                      );
                                      setFieldValue(
                                        `${inputMapFieldPath}.${idx}.value.value`,
                                        curCacheForOption?.value || ''
                                      );
                                      setFieldValue(
                                        `${inputMapFieldPath}.${idx}.value.nestedVars`,
                                        curCacheForOption?.nestedVars || []
                                      );
                                      setInputMapCache(updatedCache);
                                    }}
                                  />
                                </EuiFlexItem>
                              </EuiFlexItem>
                              <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                                <EuiFlexGroup direction="row" gutterSize="xs">
                                  <>
                                    {/**
                                     * Conditionally render the value form component based on the transform type.
                                     * It may be a button, dropdown, or simply freeform text.
                                     */}
                                    {templateModalIdx === (idx as number) && (
                                      <ConfigureTemplateModal
                                        config={props.config}
                                        baseConfigPath={props.baseConfigPath}
                                        uiConfig={props.uiConfig}
                                        context={props.context}
                                        fieldPath={`${inputMapFieldPath}.${idx}.value`}
                                        modelInterface={modelInterface}
                                        isDataFetchingAvailable={
                                          props.isDataFetchingAvailable
                                        }
                                        onClose={() =>
                                          setTemplateModalIdx(undefined)
                                        }
                                      />
                                    )}
                                    {expressionModalIdx === (idx as number) && (
                                      <ConfigureExpressionModal
                                        config={props.config}
                                        baseConfigPath={props.baseConfigPath}
                                        uiConfig={props.uiConfig}
                                        context={props.context}
                                        fieldPath={`${inputMapFieldPath}.${idx}.value`}
                                        modelInterface={modelInterface}
                                        modelInputFieldName={getIn(
                                          values,
                                          `${inputMapFieldPath}.${idx}.key`
                                        )}
                                        isDataFetchingAvailable={
                                          props.isDataFetchingAvailable
                                        }
                                        onClose={() =>
                                          setExpressionModalIdx(undefined)
                                        }
                                      />
                                    )}
                                    <EuiFlexItem>
                                      <>
                                        {transformType ===
                                        TRANSFORM_TYPE.TEMPLATE ? (
                                          <>
                                            {isEmpty(
                                              getIn(
                                                values,
                                                `${inputMapFieldPath}.${idx}.value.value`
                                              )
                                            ) ? (
                                              <EuiSmallButton
                                                style={{ width: '100px' }}
                                                fill={false}
                                                onClick={() =>
                                                  setTemplateModalIdx(idx)
                                                }
                                                data-testid="configureTemplateButton"
                                              >
                                                Configure
                                              </EuiSmallButton>
                                            ) : (
                                              <EuiFlexGroup
                                                direction="row"
                                                justifyContent="spaceAround"
                                              >
                                                <EuiFlexItem>
                                                  <EuiText
                                                    size="s"
                                                    color="subdued"
                                                    style={{
                                                      marginTop: '4px',
                                                      whiteSpace: 'nowrap',
                                                      overflow: 'hidden',
                                                    }}
                                                  >
                                                    {getCharacterLimitedString(
                                                      getIn(
                                                        values,
                                                        `${inputMapFieldPath}.${idx}.value.value`
                                                      ),
                                                      15
                                                    )}
                                                  </EuiText>
                                                </EuiFlexItem>
                                                <EuiFlexItem grow={false}>
                                                  <EuiSmallButtonIcon
                                                    aria-label="edit"
                                                    iconType="pencil"
                                                    disabled={false}
                                                    color={'primary'}
                                                    onClick={() =>
                                                      setTemplateModalIdx(idx)
                                                    }
                                                  />
                                                </EuiFlexItem>
                                              </EuiFlexGroup>
                                            )}
                                          </>
                                        ) : transformType ===
                                          TRANSFORM_TYPE.EXPRESSION ? (
                                          <>
                                            {isEmpty(
                                              getIn(
                                                values,
                                                `${inputMapFieldPath}.${idx}.value.value`
                                              )
                                            ) ? (
                                              <EuiSmallButton
                                                style={{ width: '100px' }}
                                                fill={false}
                                                onClick={() =>
                                                  setExpressionModalIdx(idx)
                                                }
                                                data-testid="configureExpressionButton"
                                              >
                                                Configure
                                              </EuiSmallButton>
                                            ) : (
                                              <EuiFlexGroup
                                                direction="row"
                                                justifyContent="spaceAround"
                                              >
                                                <EuiFlexItem>
                                                  <EuiText
                                                    size="s"
                                                    color="subdued"
                                                    style={{
                                                      marginTop: '4px',
                                                      whiteSpace: 'nowrap',
                                                      overflow: 'hidden',
                                                    }}
                                                  >
                                                    {getCharacterLimitedString(
                                                      getIn(
                                                        values,
                                                        `${inputMapFieldPath}.${idx}.value.value`
                                                      ),
                                                      15
                                                    )}
                                                  </EuiText>
                                                </EuiFlexItem>
                                                <EuiFlexItem grow={false}>
                                                  <EuiSmallButtonIcon
                                                    aria-label="edit"
                                                    iconType="pencil"
                                                    disabled={false}
                                                    color={'primary'}
                                                    onClick={() =>
                                                      setExpressionModalIdx(idx)
                                                    }
                                                  />
                                                </EuiFlexItem>
                                              </EuiFlexGroup>
                                            )}
                                          </>
                                        ) : isEmpty(transformType) ||
                                          transformType ===
                                            TRANSFORM_TYPE.STRING ||
                                          transformType ===
                                            TRANSFORM_TYPE.TEMPLATE ||
                                          isEmpty(valueOptions) ? (
                                          <TextField
                                            fullWidth={true}
                                            fieldPath={`${inputMapFieldPath}.${idx}.value.value`}
                                            placeholder={`Value`}
                                            showError={false}
                                            preventWhitespace={
                                              !(
                                                transformType ===
                                                TRANSFORM_TYPE.STRING
                                              )
                                            }
                                          />
                                        ) : (
                                          <SelectWithCustomOptions
                                            fieldPath={`${inputMapFieldPath}.${idx}.value.value`}
                                            options={valueOptions || []}
                                            placeholder={
                                              props.context ===
                                              PROCESSOR_CONTEXT.SEARCH_REQUEST
                                                ? 'Query field'
                                                : 'Document field'
                                            }
                                            allowCreate={true}
                                          />
                                        )}
                                      </>
                                    </EuiFlexItem>
                                    {/**
                                     * Only allow deleting entries if no defined model interface
                                     */}
                                    {isEmpty(modelInterface) && (
                                      <EuiFlexItem grow={false}>
                                        <EuiSmallButtonIcon
                                          iconType={'trash'}
                                          color="danger"
                                          aria-label="Delete"
                                          onClick={() => {
                                            deleteMapEntry(field.value, idx);
                                          }}
                                        />
                                      </EuiFlexItem>
                                    )}
                                  </>
                                </EuiFlexGroup>
                              </EuiFlexItem>
                            </EuiFlexGroup>
                          </EuiFlexItem>
                        );
                      }
                    )}
                    {/**
                     * Only allow adding entries if no defined model interface
                     */}
                    {isEmpty(modelInterface) && (
                      <EuiFlexItem grow={false}>
                        <div>
                          <EuiSmallButtonEmpty
                            style={{ marginLeft: '-8px', marginTop: '0px' }}
                            iconType={'plusInCircle'}
                            iconSide="left"
                            onClick={() => {
                              addMapEntry(field.value);
                            }}
                          >
                            {`Add input`}
                          </EuiSmallButtonEmpty>
                        </div>
                      </EuiFlexItem>
                    )}
                  </EuiFlexGroup>
                </EuiCompressedFormRow>
              </EuiPanel>
            ) : (
              <EuiSmallButton
                style={{ width: '100px' }}
                onClick={() => {
                  setFieldValue(field.name, [EMPTY_INPUT_MAP_ENTRY]);
                }}
              >
                {'Configure'}
              </EuiSmallButton>
            )}
          </>
        );
      }}
    </Field>
  );
}
