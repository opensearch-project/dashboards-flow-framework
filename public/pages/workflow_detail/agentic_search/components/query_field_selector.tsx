/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { getIn, useFormikContext } from 'formik';
import { cloneDeep, get, isEmpty } from 'lodash';
import {
  EuiFormRow,
  EuiComboBox,
  EuiToolTip,
  EuiIcon,
  EuiComboBoxOptionOption,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import {
  customStringify,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';

interface QueryFieldSelectorProps {
  uiConfig: WorkflowConfig | undefined;
  fieldMappings: any;
}

export function QueryFieldSelector(props: QueryFieldSelectorProps) {
  const { values, setFieldValue } = useFormikContext<WorkflowFormValues>();
  // interim state to properly render the dropdown list of fields with added metadata (e.g., field mapping type)
  const [selectedFields, setSelectedFields] = useState<
    EuiComboBoxOptionOption<string>[]
  >([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const comboBoxRef = useRef<HTMLElement | null>(null);

  // update query DSL on field options change
  function handleOptionsChange(
    options: EuiComboBoxOptionOption<string>[]
  ): void {
    const finalQuery = (() => {
      try {
        return JSON.parse(getIn(values, 'search.request', '{}'));
      } catch (e) {
        return {};
      }
    })();
    if (!fieldArraysEqual(finalQuery?.query?.agentic?.query_fields, options)) {
      const updatedQuery = cloneDeep(finalQuery);
      updatedQuery.query.agentic.query_fields = options.map(
        (option) => option.value
      );
      setFieldValue('search.request', customStringify(updatedQuery));
    }
  }

  // whenever the query is updated, if it changes the query fields, update the selected fields.
  // always wait for the field mappings to be initialized before populating to add metadata (e.g., field type)
  useEffect(() => {
    const finalQuery = (() => {
      try {
        return JSON.parse(getIn(values, 'search.request', '{}'));
      } catch (e) {
        return {};
      }
    })();
    if (
      finalQuery?.query?.agentic?.query_fields !== undefined &&
      !isEmpty(props.fieldMappings) &&
      !fieldArraysEqual(
        finalQuery?.query?.agentic?.query_fields,
        selectedFields
      )
    ) {
      const curQueryFields = finalQuery?.query?.agentic?.query_fields;
      const curFieldOptions = getFieldOptions(props.fieldMappings);
      setSelectedFields(getNewFieldOptions(curQueryFields, curFieldOptions));
    } else {
    }
  }, [getIn(values, 'search.request'), props.fieldMappings]);

  const handleDropdownClose = (options: EuiComboBoxOptionOption<string>[]) => {
    if (options.length === 0) {
      setShowDropdown(false);
    }
  };

  return (
    <>
      {selectedFields.length === 0 && !showDropdown ? (
        <div style={{ display: 'inline-block', marginLeft: '-6px' }}>
          <EuiSmallButtonEmpty
            // show the dropdown and auto-open it
            onClick={() => {
              setShowDropdown(true);
              setTimeout(() => {
                if (comboBoxRef.current) {
                  const inputElement = comboBoxRef.current.querySelector(
                    'input'
                  );
                  if (inputElement) {
                    (inputElement as HTMLElement).click();
                    (inputElement as HTMLElement).focus();
                  }
                }
              }, 50);
            }}
            iconType="plusInCircle"
            data-test-subj="add-query-fields-button"
          >
            Add query fields
          </EuiSmallButtonEmpty>
        </div>
      ) : (
        <EuiFormRow
          label={
            <>
              Query fields
              <EuiToolTip content="Choose the set of query fields you want to target in your search">
                <EuiIcon
                  type="questionInCircle"
                  color="subdued"
                  style={{ marginLeft: '4px' }}
                />
              </EuiToolTip>
            </>
          }
          fullWidth
        >
          {/**
           * Wrap the combobox dropdown in a ref to automatically click & focus on the component,
           * if a user clicks "Add query fields"
           */}
          <div ref={comboBoxRef as React.RefObject<HTMLDivElement>}>
            <EuiComboBox
              style={{ width: '50vw' }}
              placeholder="Select fields"
              options={getFieldOptions(props.fieldMappings)}
              selectedOptions={selectedFields}
              onChange={(options) => {
                handleOptionsChange(options);
                handleDropdownClose(options);
              }}
              onCreateOption={(searchValue) =>
                handleOptionsChange([
                  ...selectedFields,
                  {
                    label: searchValue,
                    value: searchValue,
                    type: undefined,
                  } as EuiComboBoxOptionOption<string>,
                ])
              }
              isClearable={true}
              isDisabled={false}
              fullWidth
              onBlur={() => {
                // If dropdown is closed and no selections, go back to button
                if (selectedFields.length === 0) {
                  setShowDropdown(false);
                }
              }}
              data-test-subj="query-fields-combo-box"
            />
          </div>
        </EuiFormRow>
      )}
    </>
  );
}

// compare the rendered field options in the combo box, with the string list in the underlying DSL query.
// used for keeping them consistent across views, if the values differ as users edit the combo box list and/or the DSL query.
function fieldArraysEqual(
  queryFields: string[],
  comboBoxFields: EuiComboBoxOptionOption<string>[]
): boolean {
  if (!Array.isArray(queryFields) || !Array.isArray(comboBoxFields))
    return false;
  if (queryFields.length !== comboBoxFields.length) return false;

  for (let i = 0; i < queryFields.length; i++) {
    if (typeof queryFields[i] !== 'string') return false;
    if (!comboBoxFields[i] || typeof comboBoxFields[i].value !== 'string')
      return false;
    if (queryFields[i] !== comboBoxFields[i].value) return false;
  }
  return true;
}
function getFieldOptions(mappings: any): EuiComboBoxOptionOption<string>[] {
  return Object.entries(get(mappings, 'properties', {})).map(
    ([fieldName, fieldInfo]: [string, any]) => {
      const fieldType = fieldInfo.type || 'object';
      return {
        label: `${fieldName} (${fieldType})`,
        value: fieldName,
        type: fieldType,
      } as EuiComboBoxOptionOption<string>;
    }
  );
}

// update the combo box options if the query field list in the DSL query is updated.
// add custom fields with unknown type if it is not in the known mappings options list.
function getNewFieldOptions(
  queryFields: string[],
  comboBoxFields: EuiComboBoxOptionOption<string>[]
): EuiComboBoxOptionOption<string>[] {
  const comboBoxMap = new Map(comboBoxFields.map((obj) => [obj.value, obj]));

  return (
    queryFields.map((str) => {
      if (comboBoxMap.has(str)) {
        return comboBoxMap.get(str) as EuiComboBoxOptionOption<string>;
      } else {
        return {
          label: str,
          value: str,
          type: undefined,
        } as EuiComboBoxOptionOption<string>;
      }
    }) || []
  );
}
