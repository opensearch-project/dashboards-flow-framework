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
  EuiFormControlLayoutDelimited,
  EuiFormRow,
  EuiLink,
  EuiText,
} from '@elastic/eui';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import {
  IConfigField,
  MapEntry,
  MapFormValue,
  WorkflowFormValues,
} from '../../../../../common';

interface MapFieldProps {
  field: IConfigField;
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  onFormChange: () => void;
}

/**
 * Input component for configuring field mappings
 */
export function MapField(props: MapFieldProps) {
  const { setFieldValue, errors, touched } = useFormikContext<
    WorkflowFormValues
  >();

  // Adding a map entry to the end of the existing arr
  function addMapEntry(curEntries: MapFormValue): void {
    const updatedEntries = [...curEntries, { key: '', value: '' } as MapEntry];
    setFieldValue(props.fieldPath, updatedEntries);
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
    props.onFormChange();
  }

  return (
    <Field name={props.fieldPath}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiFormRow
            key={props.fieldPath}
            label={props.field.label}
            labelAppend={
              props.field.helpLink ? (
                <EuiText size="xs">
                  <EuiLink href={props.field.helpLink} target="_blank">
                    Learn more
                  </EuiLink>
                </EuiText>
              ) : undefined
            }
            helpText={props.field.helpText || undefined}
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
                    <EuiFlexGroup direction="row" justifyContent="spaceBetween">
                      <EuiFlexItem grow={false}>
                        <EuiFormControlLayoutDelimited
                          startControl={
                            <input
                              type="string"
                              // TODO: find a way to config/title the placeholder text.
                              // For example, K/V values have different meanings if input
                              // map or output map for ML inference processors.
                              placeholder="Input"
                              className="euiFieldText"
                              value={mapping.key}
                              onChange={(e) => {
                                form.setFieldValue(
                                  `${props.fieldPath}.${idx}.key`,
                                  e.target.value
                                );
                                props.onFormChange();
                              }}
                            />
                          }
                          endControl={
                            <input
                              type="string"
                              placeholder="Output"
                              className="euiFieldText"
                              value={mapping.value}
                              onChange={(e) => {
                                form.setFieldValue(
                                  `${props.fieldPath}.${idx}.value`,
                                  e.target.value
                                );
                                props.onFormChange();
                              }}
                            />
                          }
                        />
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
