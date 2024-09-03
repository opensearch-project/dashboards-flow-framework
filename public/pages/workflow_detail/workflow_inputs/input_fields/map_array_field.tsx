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
  EuiLink,
  EuiPanel,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import {
  EMPTY_MAP_ENTRY,
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
                              keyPlaceholder={props.keyPlaceholder}
                              valuePlaceholder={props.valuePlaceholder}
                              keyOptions={props.keyOptions}
                              valueOptions={props.valueOptions}
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
                      keyPlaceholder={props.keyPlaceholder}
                      valuePlaceholder={props.valuePlaceholder}
                      keyOptions={props.keyOptions}
                      valueOptions={props.valueOptions}
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
                      <EuiSmallButtonEmpty
                        style={{ marginLeft: '-8px', marginTop: '-4px' }}
                        onClick={() => {
                          addMap(field.value);
                        }}
                      >{`(Advanced) Add another prediction`}</EuiSmallButtonEmpty>
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
