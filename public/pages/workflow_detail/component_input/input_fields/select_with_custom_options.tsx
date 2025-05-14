/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { getIn, useFormikContext } from 'formik';
import { get, isEmpty } from 'lodash';
import { EuiComboBox, EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';
import { WorkflowFormValues } from '../../../../../common';

interface SelectWithCustomOptionsProps {
  fieldPath: string;
  placeholder: string;
  options: { label: string }[];
  allowCreate?: boolean;
  showInvalid?: boolean;
  onChange?: () => void;
  disabled?: boolean;
}

/**
 * A generic select field from a list of preconfigured options, and the functionality to add more options
 */
export function SelectWithCustomOptions(props: SelectWithCustomOptionsProps) {
  const {
    values,
    errors,
    touched,
    setFieldTouched,
    setFieldValue,
  } = useFormikContext<WorkflowFormValues>();

  const isInvalid =
    (props.showInvalid ?? true) &&
    getIn(errors, props.fieldPath) &&
    getIn(touched, props.fieldPath);

  // selected option state
  const [selectedOption, setSelectedOption] = useState<any[]>([]);

  // set the visible option when the underlying form is updated.
  useEffect(() => {
    const formValue = getIn(values, props.fieldPath);
    if (!isEmpty(formValue)) {
      setSelectedOption([{ label: formValue }]);
    } else {
      setSelectedOption([]);
    }
  }, [getIn(values, props.fieldPath)]);

  // custom handler when users create a custom option
  // only update the form value if non-empty
  function onCreateOption(searchValue: any): void {
    const normalizedSearchValue = searchValue.trim()?.toLowerCase();
    if (!normalizedSearchValue) {
      return;
    }
    setFieldTouched(props.fieldPath, true);
    setFieldValue(props.fieldPath, searchValue);
  }

  // custom render fn.
  function renderOption(option: any, searchValue: string) {
    return (
      <EuiFlexGroup direction="row" alignItems="flexStart" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiText size="s">{option.label || ''}</EuiText>
        </EuiFlexItem>
        {option.type && (
          <EuiFlexItem grow={false}>
            <EuiText size="xs" color="subdued" style={{ marginTop: '2px' }}>
              {`(${option.type})`}
            </EuiText>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    );
  }

  return (
    <EuiComboBox
      fullWidth={true}
      compressed={true}
      placeholder={props.placeholder}
      singleSelection={{ asPlainText: true }}
      isClearable={false}
      options={props.options}
      selectedOptions={selectedOption}
      renderOption={renderOption}
      onChange={(options) => {
        setFieldTouched(props.fieldPath, true);
        setFieldValue(props.fieldPath, get(options, '0.label'));
        if (props.onChange) {
          props.onChange();
        }
      }}
      onCreateOption={props.allowCreate ? onCreateOption : undefined}
      customOptionText={
        props.allowCreate ? 'Add {searchValue} as a custom option' : undefined
      }
      isInvalid={isInvalid}
      isDisabled={props.disabled ?? false}
    />
  );
}
