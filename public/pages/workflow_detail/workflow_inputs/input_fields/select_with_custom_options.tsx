/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { getIn, useFormikContext } from 'formik';
import { get, isEmpty } from 'lodash';
import { EuiComboBox, EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';
import { WorkspaceFormValues } from '../../../../../common';

interface SelectWithCustomOptionsProps {
  fieldPath: string;
  placeholder: string;
  options: any[];
  onFormChange: () => void;
}

/**
 * A generic select field from a list of preconfigured options, and the functionality to add more options
 */
export function SelectWithCustomOptions(props: SelectWithCustomOptionsProps) {
  const { values, setFieldTouched, setFieldValue } = useFormikContext<
    WorkspaceFormValues
  >();

  // selected option state
  const [selectedOption, setSelectedOption] = useState<any[]>([]);

  // update the selected option when the form is updated. set to empty if the form value is undefined
  // or an empty string ('')
  useEffect(() => {
    const formValue = getIn(values, props.fieldPath);
    if (!isEmpty(formValue)) {
      setSelectedOption([{ label: getIn(values, props.fieldPath) }]);
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
    props.onFormChange();
  }

  // custom render fn.
  function renderOption(option: any, searchValue: string) {
    return (
      <EuiFlexGroup direction="row" alignItems="flexStart" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiText size="s">{option.label}</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="xs" color="subdued" style={{ marginTop: '2px' }}>
            {`(${option.type || 'unknown type'})`}
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  return (
    <EuiComboBox
      fullWidth={true}
      compressed={false}
      placeholder={props.placeholder}
      singleSelection={{ asPlainText: true }}
      isClearable={false}
      options={props.options}
      selectedOptions={selectedOption}
      renderOption={renderOption}
      onChange={(options) => {
        setFieldTouched(props.fieldPath, true);
        setFieldValue(props.fieldPath, get(options, '0.label'));
        props.onFormChange();
      }}
      onCreateOption={onCreateOption}
      customOptionText="Add {searchValue} as a custom option"
    />
  );
}
