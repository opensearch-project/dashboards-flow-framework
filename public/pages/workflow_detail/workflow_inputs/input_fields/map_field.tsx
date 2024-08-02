/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiIcon,
  EuiLink,
  EuiText,
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
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  onFormChange: () => void;
  keyOptions?: any[];
  valueOptions?: any[];
}

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
    props.onFormChange();
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
    props.onFormChange();
  }

  return (
    <Field name={props.fieldPath} key={props.fieldPath}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiFormRow
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
            helpText={props.helpText || undefined}
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
              {field.value?.map((mapping: MapEntry, idx: number) => {
                return (
                  <EuiFlexItem key={idx}>
                    <EuiFlexGroup direction="row">
                      <EuiFlexItem grow={true}>
                        <EuiFlexGroup direction="row" gutterSize="xs">
                          <EuiFlexItem>
                            <>
                              {!isEmpty(props.keyOptions) ? (
                                <SelectWithCustomOptions
                                  fieldPath={`${props.fieldPath}.${idx}.key`}
                                  options={props.keyOptions as any[]}
                                  placeholder={props.keyPlaceholder || 'Input'}
                                  onFormChange={props.onFormChange}
                                />
                              ) : (
                                <TextField
                                  fieldPath={`${props.fieldPath}.${idx}.key`}
                                  placeholder={props.keyPlaceholder || 'Input'}
                                  showError={false}
                                  onFormChange={props.onFormChange}
                                />
                              )}
                            </>
                          </EuiFlexItem>
                          <EuiFlexItem
                            grow={false}
                            style={{ marginTop: '14px' }}
                          >
                            <EuiIcon type="sortRight" />
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <>
                              {!isEmpty(props.valueOptions) ? (
                                <SelectWithCustomOptions
                                  fieldPath={`${props.fieldPath}.${idx}.value`}
                                  options={props.valueOptions || []}
                                  placeholder={
                                    props.valuePlaceholder || 'Output'
                                  }
                                  onFormChange={props.onFormChange}
                                />
                              ) : (
                                <TextField
                                  fieldPath={`${props.fieldPath}.${idx}.value`}
                                  placeholder={
                                    props.valuePlaceholder || 'Output'
                                  }
                                  showError={false}
                                  onFormChange={props.onFormChange}
                                />
                              )}
                            </>
                          </EuiFlexItem>
                        </EuiFlexGroup>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButtonIcon
                          style={{ marginTop: '8px' }}
                          iconType={'trash'}
                          color="danger"
                          aria-label="Delete"
                          onClick={() => {
                            deleteMapEntry(field.value, idx);
                          }}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                );
              })}
              <EuiFlexItem grow={false}>
                <div>
                  <EuiButton
                    size="s"
                    onClick={() => {
                      addMapEntry(field.value);
                    }}
                  >
                    {field.value?.length > 0
                      ? 'Add another field mapping'
                      : 'Add field mapping'}
                  </EuiButton>
                </div>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFormRow>
        );
      }}
    </Field>
  );
}
