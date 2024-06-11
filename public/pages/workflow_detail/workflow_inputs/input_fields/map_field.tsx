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
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import { Field, FieldProps, useFormikContext } from 'formik';
import {
  IConfigField,
  MapEntry,
  WorkflowFormValues,
} from '../../../../../common';
import { ConfigFieldList } from '../config_field_list';
import { formikToUiConfig, generateId } from '../../../../utils';

interface MapFieldProps {
  field: IConfigField;
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  onFormChange: () => void;
  //uiConfig: WorkflowConfig;
  //setUiConfig: (uiConfig: WorkflowConfig) => void;
}

/**
 * Input component for configuring field mappings
 */
export function MapField(props: MapFieldProps) {
  const { values } = useFormikContext<WorkflowFormValues>();

  const mappingField = [] as string[];

  // Adding a field mapping
  function addMapping(mappingIdToAdd: string): void {
    // TODO
  }

  // Deleting a field mapping
  function deleteMapping(mappingIdToDelete: string): void {
    // TODO
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
                  <EuiPanel>
                    <EuiFlexGroup direction="row" justifyContent="spaceBetween">
                      <EuiFlexItem grow={false}>
                        <EuiFormControlLayoutDelimited
                          startControl={
                            <input
                              type="string"
                              placeholder="Key"
                              className="euiFieldText"
                            />
                          }
                          endControl={
                            <input
                              type="string"
                              placeholder="Value"
                              className="euiFieldText"
                            />
                          }
                        />
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButtonIcon
                          iconType={'trash'}
                          color="danger"
                          aria-label="Delete"
                          onClick={() => {
                            deleteMapping('test');
                          }}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiPanel>
                </EuiFlexItem>
              );
            })}
            <EuiFlexItem grow={false}>
              <div>
                <EuiButton
                  onClick={() => {
                    addMapping('test');
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
