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
  IProcessorConfig,
  IConfigField,
  PROCESSOR_CONTEXT,
  WorkflowFormValues,
  ModelInterface,
  IndexMappings,
  REQUEST_PREFIX,
  REQUEST_PREFIX_WITH_JSONPATH_ROOT_SELECTOR,
  InputMapEntry,
  InputMapFormValue,
  TRANSFORM_TYPE,
  EMPTY_INPUT_MAP_ENTRY,
} from '../../../../../../common';
import { TextField } from '../../input_fields';
import { AppState, getMappings, useAppDispatch } from '../../../../../store';
import {
  getDataSourceId,
  parseModelInputs,
  sanitizeJSONPath,
} from '../../../../../utils';
import {
  EuiCompressedFormRow,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiIconTip,
  EuiPanel,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiSmallButtonIcon,
  EuiText,
} from '@elastic/eui';
import { SelectWithCustomOptions } from '../../input_fields/select_with_custom_options';

interface ModelInputsProps {
  config: IProcessorConfig;
  baseConfigPath: string;
  context: PROCESSOR_CONTEXT;
}

// The keys will be more static in general. Give more space for values where users
// will typically be writing out more complex transforms/configuration (in the case of ML inference processors).
const KEY_FLEX_RATIO = 4;
const VALUE_FLEX_RATIO = 6;

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
  // TODO: confirm the above.
  const inputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.input_map.0`;

  // model interface state
  const [modelInterface, setModelInterface] = useState<
    ModelInterface | undefined
  >(undefined);

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
          transformType: TRANSFORM_TYPE.FIELD,
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
  const keyTitle = 'Name';
  const keyPlaceholder = 'Name';
  const keyOptions = parseModelInputs(modelInterface);
  const valueTitle =
    props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
      ? 'Query field'
      : 'Document field';
  const valuePlaceholder =
    props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
      ? 'Specify a query field'
      : 'Define a document field';
  const valueHelpText = `Specify a ${
    props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST ? 'query' : 'document'
  } field or define JSONPath to transform the ${
    props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST ? 'query' : 'document'
  } to map to a model input field.${
    props.context === PROCESSOR_CONTEXT.SEARCH_RESPONSE
      ? ` Or, if you'd like to include data from the the original query request, prefix your mapping with "${REQUEST_PREFIX}" or "${REQUEST_PREFIX_WITH_JSONPATH_ROOT_SELECTOR}" - for example, "_request.query.match.my_field"`
      : ''
  }`;
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
                                {keyTitle}
                              </EuiText>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiFlexItem>
                        <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                          <EuiFlexGroup direction="row" gutterSize="xs">
                            <EuiFlexItem grow={false}>
                              <EuiText size="s" color="subdued">
                                {valueTitle}
                              </EuiText>
                            </EuiFlexItem>
                            <EuiFlexItem grow={false}>
                              <EuiIconTip
                                content={valueHelpText}
                                position="right"
                              />
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    {field.value?.map(
                      (mapEntry: InputMapEntry, idx: number) => {
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
                                            placeholder={keyPlaceholder}
                                          />
                                        ) : (
                                          <TextField
                                            fullWidth={true}
                                            fieldPath={`${inputMapFieldPath}.${idx}.key`}
                                            placeholder={keyPlaceholder}
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
                              <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                                <EuiFlexGroup direction="row" gutterSize="xs">
                                  <>
                                    <EuiFlexItem>
                                      <>
                                        {!isEmpty(valueOptions) ? (
                                          <SelectWithCustomOptions
                                            fieldPath={`${inputMapFieldPath}.${idx}.value.value`}
                                            options={valueOptions || []}
                                            placeholder={
                                              valuePlaceholder || 'Output'
                                            }
                                          />
                                        ) : (
                                          <TextField
                                            fullWidth={true}
                                            fieldPath={`${inputMapFieldPath}.${idx}.value.value`}
                                            placeholder={
                                              valuePlaceholder || 'Output'
                                            }
                                            showError={false}
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
