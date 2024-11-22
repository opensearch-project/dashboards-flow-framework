/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFormikContext, getIn, Field, FieldProps } from 'formik';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import { flattie } from 'flattie';
import {
  EuiCompressedFormRow,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiSmallButtonIcon,
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
  TRANSFORM_TYPE,
  EMPTY_INPUT_MAP_ENTRY,
  WorkflowConfig,
} from '../../../../../../common';
import { TextField, SelectWithCustomOptions } from '../../input_fields';
import { AppState, getMappings, useAppDispatch } from '../../../../../store';
import {
  getDataSourceId,
  parseModelInputs,
  sanitizeJSONPath,
} from '../../../../../utils';
import { ConfigureTemplateModal } from './modals/';

interface ModelInputsProps {
  config: IProcessorConfig;
  baseConfigPath: string;
  uiConfig: WorkflowConfig;
  context: PROCESSOR_CONTEXT;
}

// Spacing between the input field columns
const KEY_FLEX_RATIO = 3;
const TYPE_FLEX_RATIO = 3;
const VALUE_FLEX_RATIO = 4;

const TRANSFORM_OPTIONS = Object.values(TRANSFORM_TYPE).map((type) => {
  return {
    label: type,
  };
});

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
  } = useFormikContext<WorkflowFormValues>();
  // get some current form & config values
  const modelField = props.config.fields.find(
    (field) => field.type === 'model'
  ) as IConfigField;
  const modelFieldPath = `${props.baseConfigPath}.${props.config.id}.${modelField.id}`;
  // Assuming no more than one set of input map entries.
  const inputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.input_map.0`;

  // model interface state
  const [modelInterface, setModelInterface] = useState<
    ModelInterface | undefined
  >(undefined);

  // various modal states
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(
    false
  );

  // on initial load of the models, update model interface states
  useEffect(() => {
    if (!isEmpty(models)) {
      const modelId = getIn(values, modelFieldPath)?.id;
      if (modelId) {
        setModelInterface(models[modelId]?.interface);
      }
    }
  }, [models]);

  // persisting doc/query/index mapping fields to collect a list
  // of options to display in the dropdowns when configuring input / output maps
  const [docFields, setDocFields] = useState<{ label: string }[]>([]);
  const [queryFields, setQueryFields] = useState<{ label: string }[]>([]);
  const [indexMappingFields, setIndexMappingFields] = useState<
    { label: string }[]
  >([]);
  useEffect(() => {
    try {
      const docObjKeys = Object.keys(
        flattie((JSON.parse(values.ingest.docs) as {}[])[0])
      );
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
    const updatedEntries = [
      ...curEntries,
      {
        key: '',
        value: {
          transformType: '' as TRANSFORM_TYPE,
          value: '',
        },
      } as InputMapEntry,
    ];
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

  // Defining constants for the key/value text vars, typically dependent on the different processor contexts.
  const keyOptions = parseModelInputs(modelInterface);
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
                              <EuiText size="s" color="subdued">
                                {`Name`}
                              </EuiText>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiFlexItem>
                        <EuiFlexItem grow={TYPE_FLEX_RATIO}>
                          <EuiFlexGroup direction="row" gutterSize="xs">
                            <EuiFlexItem grow={false}>
                              <EuiText size="s" color="subdued">
                                {`Input type`}
                              </EuiText>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiFlexItem>
                        <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                          <EuiFlexGroup direction="row" gutterSize="xs">
                            <EuiFlexItem grow={false}>
                              <EuiText size="s" color="subdued">
                                Value
                              </EuiText>
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
                                         * We determine if there is an interface based on if there are key options or not,
                                         * as the options would be derived from the underlying interface.
                                         * And if so, these values should be static.
                                         * So, we only display the static text with no mechanism to change it's value.
                                         * Note we still allow more entries, if a user wants to override / add custom
                                         * keys if there is some gaps in the model interface.
                                         */}
                                        {!isEmpty(keyOptions) &&
                                        !isEmpty(
                                          getIn(
                                            values,
                                            `${inputMapFieldPath}.${idx}.key`
                                          )
                                        ) ? (
                                          <EuiText
                                            size="s"
                                            style={{ marginTop: '4px' }}
                                          >
                                            {getIn(
                                              values,
                                              `${inputMapFieldPath}.${idx}.key`
                                            )}
                                          </EuiText>
                                        ) : !isEmpty(keyOptions) ? (
                                          <SelectWithCustomOptions
                                            fieldPath={`${inputMapFieldPath}.${idx}.key`}
                                            options={keyOptions as any[]}
                                            placeholder={`Name`}
                                            allowCreate={true}
                                          />
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
                                    <EuiFlexItem
                                      grow={false}
                                      style={{ marginTop: '10px' }}
                                    >
                                      <EuiIcon type={'sortLeft'} />
                                    </EuiFlexItem>
                                  </>
                                </EuiFlexGroup>
                              </EuiFlexItem>
                              <EuiFlexItem grow={TYPE_FLEX_RATIO}>
                                <EuiFlexItem>
                                  <SelectWithCustomOptions
                                    fieldPath={`${inputMapFieldPath}.${idx}.value.transformType`}
                                    options={TRANSFORM_OPTIONS}
                                    placeholder={`Input type`}
                                    allowCreate={false}
                                    onChange={() => {
                                      // If the transform type changes, clear any set value as it will likely not make sense
                                      // under other types/contexts.
                                      setFieldValue(
                                        `${inputMapFieldPath}.${idx}.value.value`,
                                        ''
                                      );
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
                                    {isTemplateModalOpen && (
                                      <ConfigureTemplateModal
                                        config={props.config}
                                        baseConfigPath={props.baseConfigPath}
                                        uiConfig={props.uiConfig}
                                        context={props.context}
                                        fieldPath={`${inputMapFieldPath}.${idx}.value`}
                                        modelInterface={modelInterface}
                                        onClose={() =>
                                          setIsTemplateModalOpen(false)
                                        }
                                      />
                                    )}
                                    <EuiFlexItem>
                                      <>
                                        {transformType ===
                                        TRANSFORM_TYPE.TEMPLATE ? (
                                          <EuiSmallButton
                                            style={{ width: '100px' }}
                                            fill={false}
                                            onClick={() =>
                                              setIsTemplateModalOpen(true)
                                            }
                                            data-testid="configureTemplateButton"
                                          >
                                            Configure
                                          </EuiSmallButton>
                                        ) : isEmpty(transformType) ||
                                          // TODO: add buttons & new modals to configure expressions & templates
                                          transformType ===
                                            TRANSFORM_TYPE.EXPRESSION ||
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
                                  </>
                                </EuiFlexGroup>
                              </EuiFlexItem>
                            </EuiFlexGroup>
                          </EuiFlexItem>
                        );
                      }
                    )}
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
