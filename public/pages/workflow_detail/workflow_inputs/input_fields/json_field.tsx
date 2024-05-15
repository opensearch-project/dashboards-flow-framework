/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiText, EuiTextArea } from '@elastic/eui';

interface JsonFieldProps {
  label: string;
  placeholder: string;
}

/**
 * An input field for a component where users manually enter
 * in some custom JSON
 */
// TODO: integrate with formik
export function JsonField(props: JsonFieldProps) {
  return (
    <>
      <EuiText size="s" className="eui-textLeft">
        {props.label}
      </EuiText>
      <EuiTextArea placeholder={props.placeholder} />
    </>
  );
}
