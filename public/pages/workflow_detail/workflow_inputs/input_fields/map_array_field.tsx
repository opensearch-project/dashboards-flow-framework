/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiAccordion,
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import {
  IConfigField,
  MapArrayFormValue,
  MapEntry,
  WorkflowFormValues,
} from '../../../../../common';
import { MapField } from './map_field';

interface MapArrayFieldProps {
  field: IConfigField;
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  label?: string;
  helpLink?: string;
  helpText?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  onFormChange: () => void;
  onMapAdd?: (curArray: MapArrayFormValue) => void;
  onMapDelete?: (idxToDelete: number) => void;
  keyOptions?: any[];
  valueOptions?: any[];
}

/**
 * Input component for configuring an array of field mappings
 */
export function MapArrayField(props: MapArrayFieldProps) {
  const { setFieldValue, setFieldTouched, errors, touched } = useFormikContext<
    WorkflowFormValues
  >();

  // Adding a map to the end of the existing arr
  function addMap(curMapArray: MapArrayFormValue): void {
    setFieldValue(props.fieldPath, [...curMapArray, []]);
    setFieldTouched(props.fieldPath, true);
    props.onFormChange();
    if (props.onMapAdd) {
      props.onMapAdd(curMapArray);
    }
  }

  // Deleting a map
  function deleteMap(
    curMapArray: MapArrayFormValue,
    entryIndexToDelete: number
  ): void {
    const updatedMapArray = [...curMapArray];
    updatedMapArray.splice(entryIndexToDelete, 1);
    setFieldValue(props.fieldPath, updatedMapArray);
    setFieldTouched(props.fieldPath, true);
    props.onFormChange();
    if (props.onMapDelete) {
      props.onMapDelete(entryIndexToDelete);
    }
  }

  return (
    <Field name={props.fieldPath}>
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
                    <EuiAccordion
                      key={idx}
                      id={`accordion${idx}`}
                      buttonContent={`Prediction ${idx + 1}`}
                      paddingSize="m"
                      extraAction={
                        <EuiButtonIcon
                          style={{ marginTop: '8px' }}
                          iconType={'trash'}
                          color="danger"
                          aria-label="Delete"
                          onClick={() => {
                            deleteMap(field.value, idx);
                          }}
                        />
                      }
                    >
                      <EuiPanel grow={true}>
                        <MapField
                          fieldPath={`${props.fieldPath}.${idx}`}
                          keyPlaceholder={props.keyPlaceholder}
                          valuePlaceholder={props.valuePlaceholder}
                          onFormChange={props.onFormChange}
                          keyOptions={props.keyOptions}
                          valueOptions={props.valueOptions}
                        />
                      </EuiPanel>
                    </EuiAccordion>
                  </EuiFlexItem>
                );
              })}
              <EuiFlexItem grow={false}>
                <div>
                  <EuiButton
                    size="s"
                    onClick={() => {
                      addMap(field.value);
                    }}
                  >
                    {field.value?.length > 0 ? 'Add another map' : 'Add map'}
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
