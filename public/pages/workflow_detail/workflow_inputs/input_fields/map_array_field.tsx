/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiAccordion,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiPanel,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiSpacer,
} from '@elastic/eui';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import {
  EMPTY_MAP_ENTRY,
  MapArrayFormValue,
  MapEntry,
  WorkflowFormValues,
} from '../../../../../common';
import { MapField } from './map_field';

interface MapArrayFieldProps {
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  helpText?: string;
  keyTitle?: string;
  keyPlaceholder?: string;
  valueTitle?: string;
  valuePlaceholder?: string;
  onMapAdd?: (curArray: MapArrayFormValue) => void;
  onMapDelete?: (idxToDelete: number) => void;
  keyOptions?: { label: string }[];
  valueOptions?: { label: string }[];
  addMapEntryButtonText?: string;
  addMapButtonText?: string;
  mappingDirection?: 'sortRight' | 'sortLeft' | undefined;
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
    setFieldValue(props.fieldPath, [...curMapArray, [EMPTY_MAP_ENTRY]]);
    setFieldTouched(props.fieldPath, true);
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
    if (props.onMapDelete) {
      props.onMapDelete(entryIndexToDelete);
    }
  }

  return (
    <Field name={props.fieldPath}>
      {({ field, form }: FieldProps) => {
        const isNoMaps = field.value?.length === 0;
        const isMultipleMaps = field.value?.length > 1;
        const isSingleEmptyMap =
          field.value !== undefined &&
          field.value.length === 1 &&
          field.value[0].length === 0;
        const isSinglePopulatedMap =
          field.value !== undefined &&
          field.value.length === 1 &&
          field.value[0].length > 0;

        return (
          <EuiCompressedFormRow
            fullWidth={true}
            key={props.fieldPath}
            isInvalid={
              getIn(errors, field.name) !== undefined &&
              getIn(errors, field.name).length > 0 &&
              getIn(touched, field.name) !== undefined &&
              getIn(touched, field.name).length > 0
            }
          >
            <EuiFlexGroup direction="column" gutterSize="none">
              {isMultipleMaps ? (
                <>
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
                          initialIsOpen={true}
                        >
                          <EuiPanel grow={true}>
                            <MapField
                              fieldPath={`${props.fieldPath}.${idx}`}
                              helpText={props.helpText}
                              keyTitle={props.keyTitle}
                              keyPlaceholder={props.keyPlaceholder}
                              valueTitle={props.valueTitle}
                              valuePlaceholder={props.valuePlaceholder}
                              keyOptions={props.keyOptions}
                              valueOptions={props.valueOptions}
                              addEntryButtonText={props.addMapEntryButtonText}
                              mappingDirection={props.mappingDirection}
                            />
                          </EuiPanel>
                        </EuiAccordion>
                      </EuiFlexItem>
                    );
                  })}
                </>
              ) : isSinglePopulatedMap ? (
                <>
                  <EuiPanel grow={true}>
                    <MapField
                      fieldPath={`${props.fieldPath}.0`}
                      helpText={props.helpText}
                      keyTitle={props.keyTitle}
                      keyPlaceholder={props.keyPlaceholder}
                      valueTitle={props.valueTitle}
                      valuePlaceholder={props.valuePlaceholder}
                      keyOptions={props.keyOptions}
                      valueOptions={props.valueOptions}
                      addEntryButtonText={props.addMapEntryButtonText}
                      mappingDirection={props.mappingDirection}
                    />
                  </EuiPanel>
                  <EuiSpacer size="s" />
                </>
              ) : undefined}

              <EuiFlexItem grow={false}>
                <div>
                  <>
                    {isNoMaps || isSingleEmptyMap ? (
                      <EuiSmallButton
                        onClick={() => {
                          if (isNoMaps) {
                            addMap(field.value);
                          } else {
                            setFieldValue(`${field.name}.0`, [EMPTY_MAP_ENTRY]);
                          }
                        }}
                      >
                        {'Configure'}
                      </EuiSmallButton>
                    ) : (
                      <EuiPanel grow={true} paddingSize="none">
                        <EuiFlexItem grow={true} style={{ margin: '0px' }}>
                          <EuiSmallButtonEmpty
                            iconType="plusInCircle"
                            iconSide="left"
                            onClick={() => {
                              addMap(field.value);
                            }}
                          >
                            {props.addMapButtonText ||
                              `Add another map (Advanced)`}
                          </EuiSmallButtonEmpty>
                        </EuiFlexItem>
                      </EuiPanel>
                    )}
                  </>
                </div>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiCompressedFormRow>
        );
      }}
    </Field>
  );
}
