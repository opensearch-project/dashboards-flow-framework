/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFieldText } from '@elastic/eui';

interface TextFieldProps {
  label: string;
  placeholder: string;
}

/**
 * An input field for a component where users input plaintext
 */
export function TextField(props: TextFieldProps) {
  return (
    <EuiFieldText
      prepend={props.label}
      compressed={false}
      placeholder={props.placeholder || ''}
    />
  );
}
