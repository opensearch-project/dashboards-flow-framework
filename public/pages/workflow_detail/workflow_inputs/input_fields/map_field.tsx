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
  EuiText,
} from '@elastic/eui';
import { Field, FieldProps, useFormikContext } from 'formik';
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
  const { setFieldValue } = useFormikContext<WorkflowFormValues>();

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
    curEntries.splice(entryIndexToDelete, 1);
    setFieldValue(props.fieldPath, curEntries);
    props.onFormChange();
  }

  return (
    <Field name={props.fieldPath}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiFlexGroup direction="column">
            <EuiFlexItem style={{ marginBottom: '0' }}>
              <EuiText size="xs">{props.field.label}</EuiText>
            </EuiFlexItem>
            {field.value?.map((mapping: MapEntry, idx: number) => {
              return (
                <EuiFlexItem key={idx}>
                  <EuiFlexGroup direction="row" justifyContent="spaceBetween">
                    <EuiFlexItem grow={false}>
                      <EuiFormControlLayoutDelimited
                        startControl={
                          <input
                            type="string"
                            placeholder="Key"
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
                            placeholder="Value"
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
        );
      }}
    </Field>
  );
}
