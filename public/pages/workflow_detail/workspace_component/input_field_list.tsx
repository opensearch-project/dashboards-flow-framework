/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { IComponentField } from '../../../component_types';
import { TextField, JsonField, SelectField } from './input_fields';

/**
 * A helper component to format all of the input fields for a component. Dynamically
 * render based on the input type.
 */

interface InputFieldListProps {
  inputFields?: IComponentField[];
}

export function InputFieldList(props: InputFieldListProps) {
  return (
    <EuiFlexItem grow={false}>
      {props.inputFields?.map((field, idx) => {
        let el;
        switch (field.type) {
          case 'string': {
            el = (
              <EuiFlexItem key={idx}>
                <TextField
                  label={field.label}
                  placeholder={field.placeholder || ''}
                />
                <EuiSpacer size="s" />
              </EuiFlexItem>
            );
            break;
          }
          case 'json': {
            el = (
              <EuiFlexItem key={idx}>
                <JsonField
                  label={field.label}
                  placeholder={field.placeholder || ''}
                />
              </EuiFlexItem>
            );
            break;
          }
          case 'select': {
            el = (
              <EuiFlexItem key={idx}>
                <SelectField />
              </EuiFlexItem>
            );
            break;
          }
        }
        return el;
      })}
    </EuiFlexItem>
  );
}
