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

  const [options, setOptions] = useState<any[]>(props.options);

  // update the selected option when the form is updated
  useEffect(() => {
    if (getIn(values, props.fieldPath) !== undefined) {
      setSelectedOption([{ label: getIn(values, props.fieldPath) }]);
    }
  }, [getIn(values, props.fieldPath)]);

  function onCreateOption(searchValue: any): void {
    const normalizedSearchValue = searchValue.trim()?.toLowerCase();
    if (!normalizedSearchValue) {
      return;
    }
    const newOption = {
      label: searchValue,
    };
    setFieldTouched(props.fieldPath, true);
    setFieldValue(props.fieldPath, searchValue);
    props.onFormChange();
    //setSelectedOption([newOption]);
  }

  function renderOption(option: any, searchValue: string) {
    return (
      <EuiFlexGroup direction="row" alignItems="flexStart">
        <EuiFlexItem grow={false}>
          <EuiText>{option.label}</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ marginTop: '14px' }}>
          <EuiText size="s" color="subdued">
            {option.type || 'Unknown type'}
          </EuiText>{' '}
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
      isClearable={true}
      options={options}
      selectedOptions={selectedOption}
      renderOption={renderOption}
      onChange={(options) => {
        const updatedOptions = isEmpty(options) ? [{ label: '' }] : options;
        setFieldTouched(props.fieldPath, true);
        setFieldValue(props.fieldPath, get(updatedOptions, '0.label'));
        props.onFormChange();
      }}
      onCreateOption={onCreateOption}
      customOptionText="Add {searchValue} as a custom option"
    />
  );
}
