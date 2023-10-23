/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { TextField, JsonField, SelectField } from './input_fields';
import { ReactFlowComponent } from '../../../../common';

/**
 * A helper component to format all of the input fields for a component. Dynamically
 * render based on the input type.
 */

interface InputFieldListProps {
  selectedComponent: ReactFlowComponent;
}

export function InputFieldList(props: InputFieldListProps) {
  const inputFields = props.selectedComponent.data.fields || [];
  return (
    <EuiFlexItem grow={false}>
      {inputFields.map((field, idx) => {
        let el;
        switch (field.type) {
          case 'string': {
            el = (
              <EuiFlexItem key={idx}>
                <TextField
                  field={field}
                  componentId={props.selectedComponent.id}
                />
                <EuiSpacer size="s" />
              </EuiFlexItem>
            );
            break;
          }
          case 'select': {
            el = (
              <EuiFlexItem key={idx}>
                <SelectField
                  field={field}
                  componentId={props.selectedComponent.id}
                />
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
        }
        return el;
      })}
    </EuiFlexItem>
  );
}
