/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import {
  EuiCompressedFormRow,
  EuiCompressedSuperSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiSmallButtonIcon,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui';
import {
  IProcessorConfig,
  IConfigField,
  PROCESSOR_CONTEXT,
  WorkflowFormValues,
  ModelInterface,
  WorkflowConfig,
  OutputMapEntry,
  TRANSFORM_TYPE,
  NO_TRANSFORMATION,
  getCharacterLimitedString,
  OutputMapFormValue,
  EMPTY_OUTPUT_MAP_ENTRY,
  ExpressionVar,
  OUTPUT_TRANSFORM_OPTIONS,
} from '../../../../../../common';
import { TextField } from '../../input_fields';
import { AppState } from '../../../../../store';
import { ConfigureMultiExpressionModal } from './modals';

interface ModelOutputsProps {
  config: IProcessorConfig;
  baseConfigPath: string;
  uiConfig: WorkflowConfig;
  context: PROCESSOR_CONTEXT;
  isDataFetchingAvailable: boolean;
}

// Spacing between the output field columns
const KEY_FLEX_RATIO = 3;
const TYPE_FLEX_RATIO = 3;
const VALUE_FLEX_RATIO = 4;

/**
 * Base component to configure ML outputs.
 */
export function ModelOutputs(props: ModelOutputsProps) {
  const { models } = useSelector((state: AppState) => state.ml);
  const {
    errors,
    values,
    touched,
    setFieldValue,
    setFieldTouched,
  } = useFormikContext<WorkflowFormValues>();

  // get some current form & config values
  const modelField = props.config.fields.find(
    (field) => field.type === 'model'
  ) as IConfigField;
  const modelFieldPath = `${props.baseConfigPath}.${props.config.id}.${modelField.id}`;
  // Assuming no more than one set of output map entries.
  const outputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.output_map.0`;

  // various modal states
  const [expressionsModalIdx, setExpressionsModalIdx] = useState<
    number | undefined
  >(undefined);

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

  // Adding a map entry to the end of the existing arr
  function addMapEntry(curEntries: OutputMapFormValue): void {
    const updatedEntries = [...curEntries, EMPTY_OUTPUT_MAP_ENTRY];
    setFieldValue(outputMapFieldPath, updatedEntries);
    setFieldTouched(outputMapFieldPath, true);
  }

  // Deleting a map entry
  function deleteMapEntry(
    curEntries: OutputMapFormValue,
    entryIndexToDelete: number
  ): void {
    const updatedEntries = [...curEntries];
    updatedEntries.splice(entryIndexToDelete, 1);
    setFieldValue(outputMapFieldPath, updatedEntries);
    setFieldTouched(outputMapFieldPath, true);
  }

  return (
    <Field name={outputMapFieldPath} key={outputMapFieldPath}>
      {({ field, form }: FieldProps) => {
        const populatedMap = field.value?.length !== 0;
        return (
          <>
            {populatedMap ? (
              <EuiPanel>
                <EuiCompressedFormRow
                  fullWidth={true}
                  key={outputMapFieldPath}
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
                              <EuiText size="s">{`Model output`}</EuiText>
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
                              <EuiText size="s">
                                {props.context ===
                                PROCESSOR_CONTEXT.SEARCH_REQUEST
                                  ? 'Query field'
                                  : 'New document field(s)'}
                              </EuiText>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    {field.value?.map(
                      (mapEntry: OutputMapEntry, idx: number) => {
                        // TODO: can I get this from mapEntry directly
                        const transformType = getIn(
                          values,
                          `${outputMapFieldPath}.${idx}.value.transformType`
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
                                              `${outputMapFieldPath}.${idx}.key`
                                            )}
                                          </EuiText>
                                        ) : (
                                          <TextField
                                            fullWidth={true}
                                            fieldPath={`${outputMapFieldPath}.${idx}.key`}
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
                                    options={OUTPUT_TRANSFORM_OPTIONS.map(
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
                                        `${outputMapFieldPath}.${idx}.value.transformType`
                                      ) || ''
                                    }
                                    onChange={(option) => {
                                      setFieldValue(
                                        `${outputMapFieldPath}.${idx}.value.transformType`,
                                        option
                                      );
                                      // If the transform type changes, clear any set value and/or nested vars,
                                      // as it will likely not make sense under other types/contexts.
                                      setFieldValue(
                                        `${outputMapFieldPath}.${idx}.value.value`,
                                        ''
                                      );
                                      setFieldValue(
                                        `${outputMapFieldPath}.${idx}.value.nestedVars`,
                                        []
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
                                    {expressionsModalIdx ===
                                      (idx as number) && (
                                      <ConfigureMultiExpressionModal
                                        config={props.config}
                                        baseConfigPath={props.baseConfigPath}
                                        uiConfig={props.uiConfig}
                                        context={props.context}
                                        fieldPath={`${outputMapFieldPath}.${idx}.value`}
                                        modelInterface={modelInterface}
                                        modelInputFieldName={getIn(
                                          values,
                                          `${outputMapFieldPath}.${idx}.key`
                                        )}
                                        // pass the full output map field path arr
                                        outputMapFieldPath={`${props.baseConfigPath}.${props.config.id}.output_map`}
                                        isDataFetchingAvailable={
                                          props.isDataFetchingAvailable
                                        }
                                        onClose={() =>
                                          setExpressionsModalIdx(undefined)
                                        }
                                      />
                                    )}
                                    <EuiFlexItem>
                                      <>
                                        {transformType ===
                                        TRANSFORM_TYPE.EXPRESSION ? (
                                          <>
                                            {isEmpty(
                                              getIn(
                                                values,
                                                `${outputMapFieldPath}.${idx}.value.nestedVars`
                                              )
                                            ) ? (
                                              <EuiSmallButton
                                                style={{ width: '100px' }}
                                                fill={false}
                                                onClick={() =>
                                                  setExpressionsModalIdx(idx)
                                                }
                                                data-testid="configureExpressionsButton"
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
                                                      whiteSpace: 'pre-wrap',
                                                    }}
                                                  >
                                                    {(getIn(
                                                      values,
                                                      `${outputMapFieldPath}.${idx}.value.nestedVars`
                                                    ) as ExpressionVar[]).map(
                                                      (
                                                        expression,
                                                        idx,
                                                        arr
                                                      ) => {
                                                        return idx < 2
                                                          ? `${getCharacterLimitedString(
                                                              expression.transform ||
                                                                '',
                                                              15
                                                            )}${
                                                              idx === 0 &&
                                                              arr.length > 1
                                                                ? `,\n`
                                                                : ''
                                                            }`
                                                          : '';
                                                      }
                                                    )}
                                                  </EuiText>
                                                </EuiFlexItem>
                                                <EuiFlexItem grow={false}>
                                                  <EuiSmallButtonIcon
                                                    aria-label="edit"
                                                    iconType="pencil"
                                                    disabled={false}
                                                    color={'primary'}
                                                    onClick={() => {
                                                      setExpressionsModalIdx(
                                                        idx
                                                      );
                                                    }}
                                                  />
                                                </EuiFlexItem>
                                              </EuiFlexGroup>
                                            )}
                                          </>
                                        ) : transformType ===
                                          TRANSFORM_TYPE.FIELD ? (
                                          <TextField
                                            fullWidth={true}
                                            fieldPath={`${outputMapFieldPath}.${idx}.value.value`}
                                            placeholder={
                                              props.context ===
                                              PROCESSOR_CONTEXT.SEARCH_REQUEST
                                                ? 'Specify a query field'
                                                : 'Define a document field'
                                            }
                                            showError={false}
                                          />
                                        ) : transformType ===
                                          NO_TRANSFORMATION ? (
                                          <EuiText>-</EuiText>
                                        ) : undefined}
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
                            {`Add output`}
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
                  setFieldValue(field.name, [EMPTY_OUTPUT_MAP_ENTRY]);
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
