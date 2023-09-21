/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiSuperSelect, EuiSuperSelectOption, EuiText } from '@elastic/eui';

// TODO: Should be fetched from global state.
// Need to have a way to determine where to fetch this dynamic data.
const existingIndices = [
  {
    value: 'index-1',
    inputDisplay: <EuiText>my-index-1</EuiText>,
    disabled: false,
  },
  {
    value: 'index-2',
    inputDisplay: <EuiText>my-index-2</EuiText>,
    disabled: false,
  },
] as Array<EuiSuperSelectOption<string>>;

/**
 * An input field for a component where users select from a list of available
 * options.
 */
export function SelectField() {
  const options = existingIndices;

  const [selectedOption, setSelectedOption] = useState<string>(
    options[0].value
  );

  const onChange = (option: string) => {
    setSelectedOption(option);
  };

  return (
    <EuiSuperSelect
      options={options}
      valueOfSelected={selectedOption}
      onChange={(option) => onChange(option)}
    />
  );
}
