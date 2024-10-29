/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiSmallButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiIcon,
  EuiLink,
  EuiText,
  EuiSmallButton,
  EuiIconTip,
} from '@elastic/eui';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  MapEntry,
  MapFormValue,
  WorkflowFormValues,
} from '../../../../../common';
import { SelectWithCustomOptions } from './select_with_custom_options';
import { TextField } from './text_field';

interface MapFieldProps {
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  label?: string;
  helpLink?: string;
  helpText?: string;
  keyTitle?: string;
  keyPlaceholder?: string;
  valueTitle?: string;
  valuePlaceholder?: string;
  keyOptions?: { label: string }[];
  valueOptions?: { label: string }[];
  addEntryButtonText?: string;
}

// The keys will be more static in general. Give more space for values where users
// will typically be writing out more complex transforms/configuration (in the case of ML inference processors).
const KEY_FLEX_RATIO = 4;
const VALUE_FLEX_RATIO = 6;

/**
 * Input component for configuring field mappings. Input forms are defaulted to text fields. If
 * keyOptions or valueOptions are set, set the respective input form as a select field, with those options.
 * Allow custom options as a backup/default to ensure flexibility.
 */
export function MapField(props: MapFieldProps) {
  const { setFieldValue, setFieldTouched, errors, touched } = useFormikContext<
    WorkflowFormValues
  >();

  // Adding a map entry to the end of the existing arr
  function addMapEntry(curEntries: MapFormValue): void {
    const updatedEntries = [...curEntries, { key: '', value: '' } as MapEntry];
    setFieldValue(props.fieldPath, updatedEntries);
    setFieldTouched(props.fieldPath, true);
  }

  // Deleting a map entry
  function deleteMapEntry(
    curEntries: MapFormValue,
    entryIndexToDelete: number
  ): void {
    const updatedEntries = [...curEntries];
    updatedEntries.splice(entryIndexToDelete, 1);
    setFieldValue(props.fieldPath, updatedEntries);
    setFieldTouched(props.fieldPath, true);
  }

  return (
    <Field name={props.fieldPath} key={props.fieldPath}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiCompressedFormRow
            fullWidth={true}
            key={props.fieldPath}
            label={props.label}
            labelAppend={
              props.helpLink ? (
                <EuiText size="xs">
                  <EuiLink href={props.helpLink} target="_blank">
                    Learn more
                  </EuiLink>
                </EuiText>
              ) : undefined
            }
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
                    <EuiText size="s" color="subdued">
                      {props.keyTitle || 'Key'}
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                    <EuiFlexGroup direction="row" gutterSize="xs">
                      <EuiFlexItem grow={false}>
                        <EuiText size="s" color="subdued">
                          {props.valueTitle || 'Value'}
                        </EuiText>
                      </EuiFlexItem>
                      {props.helpText && (
                        <EuiFlexItem grow={false}>
                          <EuiIconTip
                            content={props.helpText}
                            position="right"
                          />
                        </EuiFlexItem>
                      )}
                    </EuiFlexGroup>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>

              {field.value?.map((mapping: MapEntry, idx: number) => {
                return (
                  <EuiFlexItem key={idx}>
                    <EuiFlexGroup direction="row" gutterSize="xs">
                      <EuiFlexItem grow={KEY_FLEX_RATIO}>
                        <EuiFlexGroup direction="row" gutterSize="xs">
                          <>
                            <EuiFlexItem>
                              <>
                                {!isEmpty(props.keyOptions) ? (
                                  <SelectWithCustomOptions
                                    fieldPath={`${props.fieldPath}.${idx}.key`}
                                    options={props.keyOptions as any[]}
                                    placeholder={
                                      props.keyPlaceholder || 'Input'
                                    }
                                  />
                                ) : (
                                  <TextField
                                    fullWidth={true}
                                    fieldPath={`${props.fieldPath}.${idx}.key`}
                                    placeholder={
                                      props.keyPlaceholder || 'Input'
                                    }
                                    showError={false}
                                  />
                                )}
                              </>
                            </EuiFlexItem>
                            <EuiFlexItem
                              grow={false}
                              style={{ marginTop: '10px' }}
                            >
                              <EuiIcon type="sortRight" />
                            </EuiFlexItem>
                          </>
                        </EuiFlexGroup>
                      </EuiFlexItem>
                      <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                        <EuiFlexGroup direction="row" gutterSize="xs">
                          <>
                            <EuiFlexItem>
                              <>
                                {!isEmpty(props.valueOptions) ? (
                                  <SelectWithCustomOptions
                                    fieldPath={`${props.fieldPath}.${idx}.value`}
                                    options={props.valueOptions || []}
                                    placeholder={
                                      props.valuePlaceholder || 'Output'
                                    }
                                  />
                                ) : (
                                  <TextField
                                    fullWidth={true}
                                    fieldPath={`${props.fieldPath}.${idx}.value`}
                                    placeholder={
                                      props.valuePlaceholder || 'Output'
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
              })}
              <EuiFlexItem grow={false}>
                <div>
                  <EuiSmallButton
                    onClick={() => {
                      addMapEntry(field.value);
                    }}
                  >
                    {props.addEntryButtonText || 'Add more'}
                  </EuiSmallButton>
                </div>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiCompressedFormRow>
        );
      }}
    </Field>
  );
}
